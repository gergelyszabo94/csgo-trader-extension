logExtensionPresence();

chrome.storage.local.get('autoOpenIDLogin', (result) => {
    if (result.autoOpenIDLogin) {
        let loginButton = document.getElementById('imageLogin');
        if (loginButton !== null) loginButton.click();
    }
});