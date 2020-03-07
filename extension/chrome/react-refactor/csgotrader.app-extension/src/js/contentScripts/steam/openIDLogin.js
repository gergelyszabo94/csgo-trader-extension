import { logExtensionPresence } from 'js/utils/utilsModular';

logExtensionPresence();

chrome.storage.local.get('autoOpenIDLogin', (result) => {
  if (result.autoOpenIDLogin) {
    const loginButton = document.getElementById('imageLogin');
    if (loginButton !== null) loginButton.click();
  }
});
