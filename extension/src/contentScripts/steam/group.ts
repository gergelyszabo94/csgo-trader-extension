import { goldenMemberNames, goldenCommenters } from 'utils/goldening';
import {
  logExtensionPresence, updateLoggedInUserInfo,
  listenToLocationChange, addUpdatedRibbon, removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { trackEvent } from 'utils/analytics';
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
  listenToLocationChange(goldenMemberNames);
  trackEvent({
    type: 'pageview',
    action: 'GroupView',
  });

  if (document.location.href.includes('/members')) goldenMemberNames();

  setInterval(() => {
    if (/#announcements|#comments/.test(window.location.href)) addReplyToCommentsFunctionality();
  }, 2000);
}
