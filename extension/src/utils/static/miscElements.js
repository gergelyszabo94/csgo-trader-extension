const listIcon = chrome.runtime.getURL('images/list-solid.svg');

const inOtherOfferIndicator = `
    <img
        class="inOtherOffer clickable"
        title="Item also in other offer, click to see in which one(s)"
        alt="Item also in other offer, click to see in which one(s)"
        src="${listIcon}"
    />`;

const friendAndInvitesBanner = `
    <div class="friendInvitesBanner">
        <b>CS2 Trader Extension:</b>
         You can set rules to friend requests and check invite history in the <b>Extension Options</b>
         under <b>"Friends and Invites"</b>
    </div>`;

export { listIcon, inOtherOfferIndicator, friendAndInvitesBanner };
