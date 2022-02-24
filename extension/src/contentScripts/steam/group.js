import { goldenMemberNames, goldenCommenters } from 'utils/goldening';
import {
  logExtensionPresence, updateLoggedInUserInfo, updateLoggedInUserName,
  listenToLocationChange, addUpdatedRibbon, removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { getGroupID } from 'utils/steamID';

if (!window.location.href.includes('/discussions')) {
  logExtensionPresence();
  addReplyToCommentsFunctionality();
  addCommentsMutationObserver();
  if (!window.location.href.includes('/announcements/')) reportComments('group', getGroupID());
  goldenCommenters();
  updateLoggedInUserInfo();
  addUpdatedRibbon();
  removeLinkFilterFromLinks();
  updateLoggedInUserName();
  listenToLocationChange(goldenMemberNames);

  if (document.location.href.includes('/members')) goldenMemberNames();

  setInterval(() => {
    if (/#announcements|#comments/.test(window.location.href)) addReplyToCommentsFunctionality();
  }, 2000);
}
