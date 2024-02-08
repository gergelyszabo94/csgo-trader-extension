import { injectScriptAsFile } from 'utils/injection';

// makes trade offers open in new tab instead of a separate window
const overrideShowTradeOffer = () => {
  chrome.storage.local.get(['openOfferInTab'], ({ openOfferInTab }) => {
    if (openOfferInTab) injectScriptAsFile('ShowTradeOffer', 'ShowTradeOfferScript');
  });
};

// adds In-browser inspect as action - in trade offers
const overrideHandleTradeActionMenu = (buffIds) => {
  injectScriptAsFile('HandleTradeActionMenu', 'HandleTradeActionMenuScript', { buffIds });
};

// adds In-browser inspect as action in inventory
const overridePopulateActions = () => {
  injectScriptAsFile('PopulateActions', 'PopulateActionsScript');
};

// loads more market history items
const overrideLoadMarketHistory = () => {
  chrome.storage.local.get('marketHistoryEventsToShow', ({ marketHistoryEventsToShow }) => {
    injectScriptAsFile('LoadMarketHistory', 'LoadMarketHistoryScript', { marketHistoryEventsToShow });
  });
};

// show years in market history
const overrideCreatePriceHistoryGraph = () => {
  chrome.storage.local.get(['showYearsOnMarketGraphs'], ({ showYearsOnMarketGraphs }) => {
    if (showYearsOnMarketGraphs) injectScriptAsFile('CreatePriceHistoryGraph', 'CreatePriceHistoryGraphScript');
  });
};

export {
  overrideShowTradeOffer, overridePopulateActions, overrideCreatePriceHistoryGraph,
  overrideHandleTradeActionMenu, overrideLoadMarketHistory,
};
