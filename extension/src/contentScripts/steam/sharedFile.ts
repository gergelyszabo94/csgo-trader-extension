import { trackEvent } from 'utils/analytics';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { goldenCommenters } from 'utils/goldening';
import { getSharedFileIDAndOwner } from 'utils/steamID';
import { logExtensionPresence, updateLoggedInUserInfo, removeLinkFilterFromLinks } from 'utils/utilsModular';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments('shared_file', getSharedFileIDAndOwner());
goldenCommenters();
updateLoggedInUserInfo();
removeLinkFilterFromLinks();
trackEvent({
    type: 'pageview',
    action: 'SharedFileView',
});
