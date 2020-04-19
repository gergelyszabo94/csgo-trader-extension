import { logExtensionPresence, updateLoggedInUserInfo } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';
import DOMPurify from 'dompurify';

logExtensionPresence();
updateLoggedInUserInfo();

chrome.storage.local.get('autoSetSteamAPIKey', (result) => {
  trackEvent({
    type: 'event',
    action: 'apiKeyAutoSet',
  });

  if (result.autoSetSteamAPIKey) {
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
                `<div style="color:green; margin-top: 10px;">
                        Added API key to CSGOTrader Extension
                    </div>`,
              ),
            );
            console.log('api key valid');
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
});
