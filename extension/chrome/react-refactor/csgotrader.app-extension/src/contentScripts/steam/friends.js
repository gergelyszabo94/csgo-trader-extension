import { logExtensionPresence, updateLoggedInUserID } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';

logExtensionPresence();
updateLoggedInUserID();
trackEvent({
  type: 'pageview',
  action: 'friendListView',
});


// highlights profiles with "csgotrader.app" in their name with gold colors
document.querySelectorAll('.selectable.friend_block_v2.persona').forEach((friendBlock) => {
  if (friendBlock.querySelector('.friend_block_content').innerText.includes('csgotrader.app')) {
    const avatar = friendBlock.querySelector('.player_avatar');
    avatar.classList.remove('online', 'offline', 'in-game');
    avatar.classList.add('golden');
    friendBlock.classList.remove('online', 'offline', 'in-game');
    friendBlock.classList.add('golden');
  }
});
