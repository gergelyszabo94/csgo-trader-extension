import {
  logExtensionPresence, updateLoggedInUserInfo, updateLoggedInUserName,
  addUpdatedRibbon, removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

if (!window.location.href.includes('/discussions')) {
  logExtensionPresence();
  addReplyToCommentsFunctionality();
  addCommentsMutationObserver();
  updateLoggedInUserInfo();
  addUpdatedRibbon();
  removeLinkFilterFromLinks();
  updateLoggedInUserName();
  listenToAcceptTrade();
  reloadPageOnExtensionUpdate();

  setInterval(() => {
    if (/#announcements|#comments/.test(window.location.href)) addReplyToCommentsFunctionality();
  }, 2000);
}
