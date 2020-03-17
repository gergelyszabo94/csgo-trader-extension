// inject scripts from content scripts the the page context
// usually to access variables or override functionality

const injectScript = (scriptString, toRemove, id, executeAndReturn) => {
  // removes previously added instance of the script
  const elementFromBefore = document.getElementById(id);
  if (elementFromBefore !== null) elementFromBefore.remove();

  const toInject = document.createElement('script');
  toInject.id = id;
  toInject.innerHTML = scriptString;
  (document.head || document.documentElement).appendChild(toInject);

  const simpleAttributeParsing = ['steamidOfLoggedinUser', 'steamidOfProfileOwner', 'tradePartnerSteamID', 'inventoryOwnerID', 'listingsInfo',
    'inventoryInfo', 'allItemsLoaded', 'offerInventoryInfo', 'steamWalletCurrency', 'steamWallet', 'formattedToInt', 'intToFormatted',
    'priceAfterFees', 'sessionid'];
  const result = simpleAttributeParsing.includes(executeAndReturn) ? document.querySelector('body').getAttribute(executeAndReturn) : null;
  if (result !== null) document.querySelector('body').setAttribute(executeAndReturn, '');

  if (toRemove) document.head.removeChild(toInject);
  return result;
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

export { injectScript, injectStyle };
