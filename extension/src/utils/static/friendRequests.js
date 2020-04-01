const conditions = {
  profile_private: {
    key: 'profile_private',
    pretty: 'Private profile',
    description: 'The user has a private Steam profile',
  },
};

const actions = {
  accept: {
    key: 'accept',
    pretty: 'Accept',
    description: 'Accept friend request',
  },
  ignore: {
    key: 'ignore',
    pretty: 'Ignore',
    description: 'Ignore friend request',
  },
  block: {
    key: 'block',
    pretty: 'Block',
    description: 'Ignore friend request and block user',
  },
};

export { conditions, actions };
