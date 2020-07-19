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
};

export { actions, eventTypes };
