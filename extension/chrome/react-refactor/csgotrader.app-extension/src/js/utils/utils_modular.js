const logExtensionPresence = () => {
    const version = chrome.runtime.getManifest().version;
    console.log(`CSGO Trader - Steam Trading Enhancer ${version} is running on this page. Changelog at: https://csgotrader.app/changelog/`);
    console.log('If you see any errors that seem related to the extension please email support@csgotrader.app')
};

export { logExtensionPresence };