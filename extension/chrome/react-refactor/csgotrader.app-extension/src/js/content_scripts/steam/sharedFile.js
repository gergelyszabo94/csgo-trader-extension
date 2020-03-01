import { goldenCommenters } from "js/utils/goldening";
import { logExtensionPresence, updateLoggedInUserID } from "js/utils/utilsModular";
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from "js/utils/comments";
import { trackEvent } from "js/utils/analytics";

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
goldenCommenters();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'SharedFileView'
});