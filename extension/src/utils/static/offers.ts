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
    notify_discord: {
        key: 'notify_discord',
        pretty: 'Notify on Discord',
        description: 'Send a Discord message.',
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
        pretty: 'Notified',
        description: 'You were notified about this trade offer!',
    },
    notify_discord: {
        key: 'notify_discord',
        pretty: 'Notified on Discord',
        description: 'A message was sent to you on Discord!',
    },
    decline: {
        key: 'decline',
        pretty: 'Declined',
        description: 'The extension declined this trade offer!',
    },
    accept: {
        key: 'accept',
        pretty: 'Accepted',
        description: 'The extension accepted this trade offer!',
    },
};

const conditions = {
    profit_over: {
        key: 'profit_over',
        pretty: 'Profit over',
        description: 'Projected profit equal or over the specified value',
        with_value: true,
        value_type: 'number',
        default_value: 5,
    },
    profit_under: {
        key: 'profit_under',
        pretty: 'Profit under',
        description: 'Projected profit is less than the specified value',
        with_value: true,
        value_type: 'number',
        default_value: -50,
    },
    profit_percentage_over: {
        key: 'profit_percentage_over',
        pretty: 'Profit percentage over',
        description: 'Projected profit percentage equal or over the specified value',
        with_value: true,
        value_type: 'number',
        default_value: 10,
    },
    profit_percentage_under: {
        key: 'profit_percentage_under',
        pretty: 'Profit percentage under',
        description: 'Projected profit percentage is less than the specified value',
        with_value: true,
        value_type: 'number',
        default_value: -80,
    },
    has_message: {
        key: 'has_message',
        pretty: 'Has message',
        description: 'The offer has a message attached',
        with_value: false,
    },
    no_message: {
        key: 'no_message',
        pretty: 'Has no message',
        description: 'The offer has no message attached',
        with_value: false,
    },
    message_includes: {
        key: 'message_includes',
        pretty: 'Message includes',
        description: 'The offer message includes the specified string',
        with_value: true,
        value_type: 'string',
        default_value: 'please',
    },
    message_doesnt_include: {
        key: 'message_doesnt_include',
        pretty: 'Message does not include',
        description: 'The offer has a message but it does not include the specified string',
        with_value: true,
        value_type: 'string',
        default_value: 'please',
    },
    receiving_items_over: {
        key: 'receiving_items_over',
        pretty: 'Receiving x or more items',
        description: 'Receiving x or more items in the offer',
        with_value: true,
        value_type: 'number',
        default_value: 50,
    },
    receiving_items_under: {
        key: 'receiving_items_under',
        pretty: 'Receiving fewer than x items',
        description: 'Receiving fewer than x items in the offer',
        with_value: true,
        value_type: 'number',
        default_value: 1,
    },
    giving_items_over: {
        key: 'giving_items_over',
        pretty: 'Giving x or more items',
        description: 'Giving x or more items in the offer',
        with_value: true,
        value_type: 'number',
        default_value: 50,
    },
    giving_items_under: {
        key: 'giving_items_under',
        pretty: 'Giving fewer than x items',
        description: 'Giving fewer than x items in the offer',
        with_value: true,
        value_type: 'number',
        default_value: 1,
    },
    receiving_non_csgo_items: {
        key: 'receiving_non_csgo_items',
        pretty: 'Receiving non-csgo items',
        description: 'The list of items to receive includes one or more non-csgo items',
        with_value: false,
    },
    giving_non_csgo_items: {
        key: 'giving_non_csgo_items',
        pretty: 'Giving non-csgo items',
        description: 'The list of items to give includes one or more non-csgo items',
        with_value: false,
    },
    receiving_no_price_items: {
        key: 'receiving_no_price_items',
        pretty: 'Receiving items with no price',
        description: 'The list of items to receive includes one or more items that does not have extension price',
        with_value: false,
    },
    giving_no_price_items: {
        key: 'giving_no_price_items',
        pretty: 'Giving items with no price',
        description: 'The list of items to give includes one or more items that does not have extension price',
        with_value: false,
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
        description:
            "The offer hasn't been sent yet and is awaiting email/mobile confirmation. The offer is only visible to the sender.",
    },
    10: {
        key: 10,
        short: 'canceled_second_factor',
        pretty: 'Canceled before mobil confirmation',
        description:
            'Either party canceled the offer via email/mobile. The offer is visible to both parties, even if the sender canceled it before it was sent.',
    },
    11: {
        key: 11,
        short: 'in_escrow',
        pretty: 'In trade-hold',
        description:
            "The trade has been placed on hold. The items involved in the trade have all been removed from both parties' inventories and will be automatically delivered in the future.",
    },
};

const operators = {
    or: {
        key: 'or',
        pretty: 'OR',
        description: 'OR operator',
    },
    and: {
        key: 'and',
        pretty: 'AND',
        description: 'AND operator',
    },
};

export { actions, eventTypes, offerStates, conditions, operators };
