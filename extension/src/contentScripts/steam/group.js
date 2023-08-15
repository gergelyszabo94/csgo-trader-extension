import { goldenMemberNames, goldenCommenters } from 'utils/goldening';
import {
  logExtensionPresence, updateLoggedInUserInfo, updateLoggedInUserName,
  listenToLocationChange, addUpdatedRibbon, removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

if (!window.location.href.includes('/discussions')) {
  logExtensionPresence();
  addReplyToCommentsFunctionality();
  addCommentsMutationObserver();
  goldenCommenters();
  updateLoggedInUserInfo();
  addUpdatedRibbon();
  removeLinkFilterFromLinks();
  updateLoggedInUserName();
  listenToLocationChange(goldenMemberNames);
  listenToAcceptTrade();
  reloadPageOnExtensionUpdate();

  if (document.location.href.includes('/members')) goldenMemberNames();

  setInterval(() => {
    if (/#announcements|#comments/.test(window.location.href)) addReplyToCommentsFunctionality();
  }, 2000);
}
