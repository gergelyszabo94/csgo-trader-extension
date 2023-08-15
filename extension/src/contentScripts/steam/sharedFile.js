import { goldenCommenters } from 'utils/goldening';
import { logExtensionPresence, updateLoggedInUserInfo, removeLinkFilterFromLinks } from 'utils/utilsModular';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver } from 'utils/comments';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

logExtensionPresence();
addReplyToCommentsFunctionality();
addCommentsMutationObserver();
goldenCommenters();
updateLoggedInUserInfo();
removeLinkFilterFromLinks();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();
