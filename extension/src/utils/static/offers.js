const actions = {
  accept: {
    key: 'accept',
    pretty: 'Accept',
    description: 'Accept trade offer',
  },
  decline: {
    key: 'decline',
    pretty: 'Decline',
    description: 'Decline trade offer',
  },
  notify: {
    key: 'notify',
    pretty: 'Notify',
    description: 'Send a browser notification',
  },
  report: {
    key: 'report',
    pretty: 'Report',
    description: 'Report the trade offer/user for attempted scam',
  },
  no_action: {
    key: 'no_action',
    pretty: 'No action',
    description: 'Do nothing',
  },
};

const eventTypes = {
  new: {
    key: 'new',
    pretty: 'New Trade Offer',
    description: 'New trade offer spotted by the extension',
  },
  notify: {
    key: 'notify',
    pretty: 'Notified!',
    description: 'You were notified about this trade offer!',
  },
};

const conditions = {
  profit_over: {
    key: 'profit_over',
    pretty: 'Profit over',
    description: 'Projected profit equal or over the specified value',
  },
  profit_under: {
    key: 'profit_under',
    pretty: 'Profit under',
    description: 'Projected profit is less than the specified value',
  },
};

// from: https://developer.valvesoftware.com/wiki/Steam_Web_API/IEconService
const offerStates = {
  1: {
    key: 1,
    short: 'invalid',
    pretty: 'Invalid',
    description: 'Invalid',
  },
  2: {
    key: 2,
    short: 'valid',
    pretty: 'Valid',
    description: 'This trade offer has been sent, neither party has acted on it yet. ',
  },
  3: {
    key: 3,
    short: 'accepted',
    pretty: 'Accepted',
    description: 'The trade offer was accepted by the recipient and items were exchanged.',
  },
  4: {
    key: 4,
    short: 'countered',
    pretty: 'Countered',
    description: 'The recipient made a counter offer',
  },
  5: {
    key: 5,
    short: 'expired',
    pretty: 'Expired',
    description: 'The trade offer was not accepted before the expiration date',
  },
  6: {
    key: 6,
    short: 'canceled',
    pretty: 'Canceled',
    description: 'The sender cancelled the offer',
  },
  7: {
    key: 7,
    short: 'declined',
    pretty: 'Declined',
    description: 'The recipient declined the offer',
  },
  8: {
    key: 8,
    short: 'invalid_items',
    pretty: 'Some items no longer available',
    description: 'Some of the items in the offer are no longer available',
  },
  9: {
    key: 9,
    short: 'needs_confirmation',
    pretty: 'Awaiting confirmation',
    description: 'The offer hasn\'t been sent yet and is awaiting email/mobile confirmation. The offer is only visible to the sender.',
  },
  10: {
    key: 10,
    short: 'canceled_second_factor',
    pretty: 'Canceled before mobil confirmation',
    description: 'Either party canceled the offer via email/mobile. The offer is visible to both parties, even if the sender canceled it before it was sent.',
  },
  11: {
    key: 11,
    short: 'in_escrow',
    pretty: 'In trade-hold',
    description: 'The trade has been placed on hold. The items involved in the trade have all been removed from both parties\' inventories and will be automatically delivered in the future.',
  },
};

export {
  actions, eventTypes, offerStates, conditions,
};
