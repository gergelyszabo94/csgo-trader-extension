// inject scripts from content scripts the the page context
// usually to access variables or override functionality
// using method 1 and 3 from https://stackoverflow.com/a/9517879/3862289

const injectScript = (scriptString, toRemove, id, executeAndReturn) => {
  const tempEl = document.createElement('div');
  tempEl.setAttribute('onreset', `${scriptString};`);
  tempEl.dispatchEvent(new CustomEvent('reset'));
  tempEl.removeAttribute('onreset');
  tempEl.remove();

  const simpleAttributeParsing = ['steamidOfLoggedinUser', 'steamidOfProfileOwner', 'tradePartnerSteamID', 'inventoryOwnerID', 'listingsInfo',
    'inventoryInfo', 'allItemsLoaded', 'offerInventoryInfo', 'steamWalletCurrency', 'steamWallet', 'formattedToInt', 'intToFormatted',
    'priceAfterFees', 'sessionid', 'offerID', 'partnerName', 'userAppInfo', 'csgoFloat', 'commentExtendedData'];

  const result = simpleAttributeParsing.includes(executeAndReturn)
    ? document.querySelector('body').getAttribute(executeAndReturn)
    : null;
  if (result !== null) document.querySelector('body').removeAttribute(executeAndReturn);
  return result;
};

// it appears that this method is asynchronous
// retrieving on-page data does not work, because the injected script
// is executed after the code that calls this function
// working around this would be very ugly, avoid if possible
const injectScriptAsFile = (scriptName, id, params) => {
  // removes previously added instance of the script
  const elementFromBefore = document.getElementById(id);
  if (elementFromBefore !== null) elementFromBefore.remove();

  const toInject = document.createElement('script');
  toInject.id = id;

  if (params) toInject.dataset.params = JSON.stringify(params);

  toInject.src = chrome.runtime.getURL(`js/injectToPage/${scriptName}.js`);
  (document.head || document.documentElement).appendChild(toInject);
};

const injectStyle = (styleString, elementID) => {
  const existingStyleElement = document.getElementById(elementID);
  if (existingStyleElement === null) {
    const styleElement = document.createElement('style');
    styleElement.id = elementID;
    styleElement.innerHTML = styleString;
    document.querySelector('body').appendChild(styleElement);
  }
};

export {
  injectScript, injectStyle, injectScriptAsFile,
};
