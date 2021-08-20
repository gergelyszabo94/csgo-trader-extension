import { logExtensionPresence, updateLoggedInUserInfo } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';
import DOMPurify from 'dompurify';

logExtensionPresence();
updateLoggedInUserInfo();

chrome.storage.local.get('autoSetSteamAPIKey', ({ autoSetSteamAPIKey }) => {
  trackEvent({
    type: 'event',
    action: 'apiKeyAutoSet',
  });

  if (autoSetSteamAPIKey) {
    if (document.getElementById('editForm').action.includes('registerkey')) { // if no API key registered yet, registers one
      document.getElementById('domain').value = `registered_${Date.now()}`;
      document.getElementById('agreeToTerms').checked = true;
      document.querySelector('input[type=submit]').click();
    } else { // if API key registered, just parse it and add it to extension
      const apiKey = document.getElementById('bodyContents_ex').querySelector('p').innerText.split(': ')[1];

      chrome.runtime.sendMessage({ apikeytovalidate: apiKey }, (response) => {
        if (response.valid) {
          chrome.storage.local.set({ steamAPIKey: apiKey, apiKeyValid: true }, () => {
            document.getElementById('editForm').insertAdjacentHTML(
              'afterend',
              DOMPurify.sanitize(
                `<div class="apiKeyAdded" ">
                        Added API key to CSGOTrader Extension, if you don't like this happening you can go the options and turn Autoset off.
                    </div>`,
              ),
            );
          });
        } else {
          document.getElementById('editForm').insertAdjacentHTML(
            'afterend',
            DOMPurify.sanitize(
              `<div style="color:red; margin-top: 10px;">
                    CSGOTrader Extension could not validate your API key, please try again.
                  </div>`,
            ),
          );
          console.log('API key could not be validated');
        }
      });
    }
  }
  // adds
  const contentDiv = document.getElementById('BG_bottom');
  contentDiv.insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(
      `<div class="apiKeyMessage">
                <b>CSGO Trader:</b>
                The Steam API allows you and others to access your Steam account programmatically.
                You should not give it to people/services that you don't trust.
                <div style="color:red">
                  If you see your offers getting canceled without any action on your part or
                  otherwise suspect that someone else may have access to your account without your consent then
                  <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=1408053055">Follow this guide to make sure that you are safe.</a>
                </div>
            </div>`,
    ),
  );
});
