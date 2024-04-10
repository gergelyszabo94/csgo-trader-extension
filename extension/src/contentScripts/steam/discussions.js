import {
  addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo,
  removeLinkFilterFromLinks, refreshSteamAccessToken,
} from 'utils/utilsModular';
import { overrideShowTradeOffer } from 'utils/steamOverriding';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

logExtensionPresence();
refreshSteamAccessToken();
updateLoggedInUserInfo();
addUpdatedRibbon();
removeLinkFilterFromLinks();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();

// when searching with keyword  in the topic
// it's a different kind of page where this is not applicable
if (!window.location.href.includes('discussions/search/')) {
  const searchElement = document.getElementById('DiscussionSearchForm');
  if (searchElement !== null) overrideShowTradeOffer();
}
