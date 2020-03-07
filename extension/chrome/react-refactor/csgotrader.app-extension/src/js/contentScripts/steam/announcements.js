import { logExtensionPresence, updateLoggedInUserID } from 'js/utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver, reportComments } from 'js/utils/comments';
import { goldenCommenters } from 'js/utils/goldening';
import { trackEvent } from 'js/utils/analytics';

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
