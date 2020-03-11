import { goldenCommenters } from 'utils/goldening';
import { logExtensionPresence, updateLoggedInUserID } from 'utils/utilsModular';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { trackEvent } from 'utils/analytics';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
goldenCommenters();
updateLoggedInUserID();
trackEvent({
  type: 'pageview',
  action: 'SharedFileView',
});
