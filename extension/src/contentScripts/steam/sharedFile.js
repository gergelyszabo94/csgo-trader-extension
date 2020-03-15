import { goldenCommenters } from 'utils/goldening';
import { logExtensionPresence, updateLoggedInUserID } from 'utils/utilsModular';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { trackEvent } from 'utils/analytics';
import { getSharedFileIDAndOwner } from 'utils/steamID';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments('shared_file', getSharedFileIDAndOwner());
goldenCommenters();
updateLoggedInUserID();
trackEvent({
  type: 'pageview',
  action: 'SharedFileView',
});
