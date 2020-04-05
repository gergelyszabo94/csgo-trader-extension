const conditions = {
  profile_private: {
    key: 'profile_private',
    pretty: 'Private profile',
    description: 'The user has a private Steam profile',
  },
  profile_public: {
    key: 'profile_public',
    pretty: 'Private public',
    description: 'The user has a public Steam profile',
  },
  steam_level_under: {
    key: 'steam_level_under',
    pretty: 'Steam lever under',
    description: 'User\' Steam profile lever is under or the same as the set number',
  },
  steam_level_over: {
    key: 'steam_level_over',
    pretty: 'Steam lever over',
    description: 'User\' Steam profile lever is over the set number',
  },
  vac_banned: {
    key: 'vac_banned',
    pretty: 'Vac banned',
    description: 'The user has VAC ban(s) on their account',
  },
  community_banned: {
    key: 'community_banned',
    pretty: 'Community banned',
    description: 'The user is community banned on Steam',
  },
  game_banned: {
    key: 'game_banned',
    pretty: 'Game banned',
    description: 'The user is banned in some games (for example CS:GO Overwatch banned)',
  },
  trade_banned: {
    key: 'trade_banned',
    pretty: 'Trade banned',
    description: 'The user is trade banned or on trade ban probation',
  },
  streamrep_banned: {
    key: 'streamrep_banned',
    pretty: 'SteamRep banned',
    description: 'The user is a convicted scammer on steamrep.com',
  },
  csgo_inventory_value_over: {
    key: 'csgo_inventory_value_over',
    pretty: 'CS:GO Inventory value over',
    description: 'The user\'s inventory value is over',
  },
  csgo_inventory_value_under: {
    key: 'csgo_inventory_value_under',
    pretty: 'CS:GO Inventory value under',
    description: 'The user\'s inventory value is under or the equal to',
  },
  inventory_private: {
    key: 'inventory_private',
    pretty: 'Private inventory',
    description: 'The user\'s inventory is not publicly viewable',
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
  no_action: {
    key: 'no_action',
    pretty: 'No action',
    description: 'Do nothing',
  },
};

const eventTypes = {
  new: {
    key: 'new',
    pretty: 'New Invite',
    description: 'New invite spotted by the extension',
  },
  disappeared: {
    key: 'disappeared',
    pretty: 'Invite Disappeared',
    description: 'The invite was either canceled or accepted / ignored / blocked by you',
  },
  no_action: {
    key: 'no_action',
    pretty: 'No action',
    description: 'No action taken by the extension',
  },
  auto_ignored: {
    key: 'auto_ignored',
    pretty: 'Auto-ignored',
    description: 'Automatically ignored by the extension',
  },
  auto_accepted: {
    key: 'auto_accepted',
    pretty: 'Auto-accepted',
    description: 'Automatically accepted by the extension',
  },
  auto_blocked: {
    key: 'auto_blocked',
    pretty: 'Auto-blocked',
    description: 'Automatically blocked by the extension',
  },
};

export { conditions, actions, eventTypes };
