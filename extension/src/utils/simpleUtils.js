// this utils modul should never have any non-static dependencies

const getItemMarketLink = (appID, marketHashName) => {
  return `https://steamcommunity.com/market/listings/${appID}/${marketHashName}`;
};

// eslint-disable-next-line import/prefer-default-export
export { getItemMarketLink };
