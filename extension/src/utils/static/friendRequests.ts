export const conditions = {
    profile_private: {
        key: 'profile_private',
        pretty: 'Private profile',
        description: 'The user has a private Steam profile',
        with_value: false,
    },
    profile_public: {
        key: 'profile_public',
        pretty: 'Private public',
        description: 'The user has a public Steam profile',
        with_value: false,
    },
    steam_level_under: {
        key: 'steam_level_under',
        pretty: 'Steam level under',
        description: "User' Steam profile lever is under or the same as the set number",
        with_value: true,
        value_type: 'number',
        default_value: 5,
    },
    steam_level_over: {
        key: 'steam_level_over',
        pretty: 'Steam level over',
        description: "User' Steam profile lever is over the set number",
        with_value: true,
        value_type: 'number',
        default_value: 50,
    },
    vac_banned: {
        key: 'vac_banned',
        pretty: 'Vac banned',
        description: 'The user has VAC ban(s) on their account',
        with_value: false,
    },
    community_banned: {
        key: 'community_banned',
        pretty: 'Community banned',
        description: 'The user is community banned on Steam',
        with_value: false,
    },
    game_banned: {
        key: 'game_banned',
        pretty: 'Game banned',
        description: 'The user is banned in some games (for example CS:GO Overwatch banned)',
        with_value: false,
    },
    trade_banned: {
        key: 'trade_banned',
        pretty: 'Trade banned',
        description: 'The user is trade banned or on trade ban probation',
        with_value: false,
    },
    streamrep_banned: {
        key: 'streamrep_banned',
        pretty: 'SteamRep banned',
        description: 'The user is a convicted scammer on steamrep.com',
        with_value: false,
    },
    csgo_inventory_value_over: {
        key: 'csgo_inventory_value_over',
        pretty: 'CS:GO Inventory value over',
        description: "The user's inventory value is over",
        with_value: true,
        value_type: 'number',
        default_value: 500,
    },
    csgo_inventory_value_under: {
        key: 'csgo_inventory_value_under',
        pretty: 'CS:GO Inventory value under',
        description: "The user's inventory value is under or the equal to",
        with_value: true,
        value_type: 'number',
        default_value: 50,
    },
    inventory_private: {
        key: 'inventory_private',
        pretty: 'Private inventory',
        description: "The user's inventory is not publicly viewable",
        with_value: false,
    },
    common_friends_over: {
        key: 'common_friends_over',
        pretty: 'Common friends more than',
        description: 'You have more common friends with the user than this number',
        with_value: true,
        value_type: 'number',
        default_value: 10,
    },
    common_friends_under: {
        key: 'common_friends_under',
        pretty: 'Common friends same or less than',
        description: 'You have fewer or the same number of common friends with the user than this number',
        with_value: true,
        value_type: 'number',
        default_value: 5,
    },
    name_includes: {
        key: 'name_includes',
        pretty: 'Username includes',
        description: "The user's Steam username includes the specified string of characters",
        with_value: true,
        value_type: 'string',
        default_value: '',
    },
    request_received: {
        key: 'request_received',
        pretty: 'Received multiple friend request from',
        description: 'The user has already sent a friend request in the past week',
        with_value: false,
    },
    from_country: {
        key: 'from_country',
        pretty: 'From country',
        description: 'The user has this country set on their profile',
        with_value: true,
        value_type: 'country',
        default_value: 'US',
    },
    all_users: {
        key: 'all_users',
        pretty: 'All users',
        description: 'Matches all users, useful if you want to accept or ignore everyone for example',
        with_value: false,
    },
};

export const actions = {
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

export const eventTypes = {
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
