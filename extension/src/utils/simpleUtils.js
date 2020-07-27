// this utils module should never have any non-static dependencies

const getItemMarketLink = (appID, marketHashName) => {
  return `https://steamcommunity.com/market/listings/${appID}/${marketHashName}`;
};

const getItemInventoryLink = (steamID, appID, contextID, assetID) => {
  return `https://steamcommunity.com/profiles/${steamID}/inventory/#${appID}_${contextID}_${assetID}`;
};

const getOfferLink = (offerID) => {
  return `https://steamcommunity.com/tradeoffer/${offerID}`;
};

export { getItemMarketLink, getItemInventoryLink, getOfferLink };
