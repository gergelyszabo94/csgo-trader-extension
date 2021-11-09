import { goldenCommenters } from 'utils/goldening';
import { logExtensionPresence, updateLoggedInUserInfo, removeLinkFilterFromLinks } from 'utils/utilsModular';
import { reportComments, addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { getSharedFileIDAndOwner } from 'utils/steamID';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
reportComments('shared_file', getSharedFileIDAndOwner());
goldenCommenters();
updateLoggedInUserInfo();
removeLinkFilterFromLinks();
