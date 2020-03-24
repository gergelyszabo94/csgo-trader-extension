const listIcon = chrome.runtime.getURL('images/list-solid.svg');

const inOtherOfferIndicator = `
    <img
        class="inOtherOffer clickable"
        title="Item also in other offer, click to see in which one(s)"
        alt="Item also in other offer, click to see in which one(s)"
        src="${listIcon}"
    />`;

// eslint-disable-next-line import/prefer-default-export
export { listIcon, inOtherOfferIndicator };
