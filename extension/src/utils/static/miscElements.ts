export const listIcon = chrome.runtime.getURL('images/list-solid.svg');

export const inOtherOfferIndicator = `
    <img
        class="inOtherOffer clickable"
        title="Item also in other offer, click to see in which one(s)"
        alt="Item also in other offer, click to see in which one(s)"
        src="${listIcon}"
    />`;

export const friendAndInvitesBanner = `
    <div class="friendInvitesBanner">
        <b>CSGO Trader Extension:</b>
         You can set rules to friend requests and check invite history in the <b>Extension Options</b>
         under <b>"Friends and Invites"</b>
    </div>`;
