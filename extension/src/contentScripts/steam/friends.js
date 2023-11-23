import { logExtensionPresence, updateLoggedInUserInfo, addUpdatedRibbon } from 'utils/utilsModular';
import { friendAndInvitesBanner } from 'utils/static/miscElements';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';
import DOMPurify from 'dompurify';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();

// adds links to friends and invites options
const friendTitle = document.querySelector('.profile_friends.title_bar');
if (friendTitle !== null) {
  friendTitle.insertAdjacentHTML('beforeBegin', DOMPurify.sanitize(friendAndInvitesBanner));
}
