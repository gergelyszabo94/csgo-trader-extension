import { logExtensionPresence, updateLoggedInUserInfo, removeLinkFilterFromLinks } from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
updateLoggedInUserInfo();
removeLinkFilterFromLinks();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();
