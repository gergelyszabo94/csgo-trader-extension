import { logExtensionPresence, updateLoggedInUserID } from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver, reportComments } from 'utils/comments';
import { goldenCommenters } from 'utils/goldening';
import { trackEvent } from 'utils/analytics';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
goldenCommenters();
updateLoggedInUserID();
trackEvent({
  type: 'pageview',
  action: 'AnnouncementView',
});
