import {
  addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo,
  removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import { overrideShowTradeOffer } from 'utils/steamOverriding';
import { listenToAcceptTrade } from 'utils/tradeOffers';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
removeLinkFilterFromLinks();
listenToAcceptTrade();

// when searching with keyword  in the topic
// it's a different kind of page where this is not applicable
if (!window.location.href.includes('discussions/search/')) {
  const searchElement = document.getElementById('DiscussionSearchForm');
  if (searchElement !== null) overrideShowTradeOffer();
}
