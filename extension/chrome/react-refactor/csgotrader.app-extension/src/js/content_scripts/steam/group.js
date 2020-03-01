import { goldenMemberNames, goldenCommenters } from "js/utils/goldening";
import { logExtensionPresence, updateLoggedInUserID, listenToLocationChange } from "js/utils/utilsModular";
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from "js/utils/comments";
import { trackEvent } from "js/utils/analytics";

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
goldenCommenters();
updateLoggedInUserID();
listenToLocationChange(goldenMemberNames);
trackEvent({
    type: 'pageview',
    action: 'GroupView'
});

if (document.location.href.includes('/members')) goldenMemberNames();

setInterval( () => {
    if (/#announcements|#comments/.test(window.location.href)) addReplyToCommentsFunctionality();
}, 2000);