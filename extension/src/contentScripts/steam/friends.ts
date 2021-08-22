import { addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo } from 'utils/utilsModular';

import DOMPurify from 'dompurify';
import { friendAndInvitesBanner } from 'utils/static/miscElements';
import { trackEvent } from 'utils/analytics';

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
    friendTitle.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(friendAndInvitesBanner));
}
