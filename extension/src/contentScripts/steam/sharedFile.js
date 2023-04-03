import { goldenCommenters } from 'utils/goldening';
import { logExtensionPresence, updateLoggedInUserInfo, removeLinkFilterFromLinks } from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
goldenCommenters();
updateLoggedInUserInfo();
removeLinkFilterFromLinks();
