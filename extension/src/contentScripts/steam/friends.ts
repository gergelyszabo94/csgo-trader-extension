import { logExtensionPresence, updateLoggedInUserInfo, addUpdatedRibbon } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';
import { friendAndInvitesBanner } from 'utils/static/miscElements';
import DOMPurify from 'dompurify';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'friendListView',
});

// highlights profiles with "csgotrader.app" in their name with gold colors
document.querySelectorAll('.selectable.friend_block_v2.persona').forEach((friendBlock) => {
  if (friendBlock.querySelector('.friend_block_content').innerText.toLowerCase().includes('csgotrader.app')) {
    const avatar = friendBlock.querySelector('.player_avatar');
    avatar.classList.remove('online', 'offline', 'in-game');
    avatar.classList.add('golden');
    friendBlock.classList.remove('online', 'offline', 'in-game');
    friendBlock.classList.add('golden');
  }
});

// adds links to friends and invites options
const friendTitle = document.querySelector('.profile_friends.title_bar');
if (friendTitle !== null) {
  friendTitle.insertAdjacentHTML('beforeBegin', DOMPurify.sanitize(friendAndInvitesBanner));
}
