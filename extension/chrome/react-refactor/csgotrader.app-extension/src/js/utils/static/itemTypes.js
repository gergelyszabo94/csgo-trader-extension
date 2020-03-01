const itemTypes = {
    collectible:{
        key: 'collectible',
        name: "Collectible",
        internal_name: "CSGO_Type_Collectible",
        float: false
    },
    container:{
        key: 'container',
        name: "Container",
        internal_name: "CSGO_Type_WeaponCase",
        float: false
    },
    knife:{
        key: 'knife',
        name: "Knife",
        internal_name: "CSGO_Type_Knife",
        float: true
    },
    graffiti:{
        key: 'graffiti',
        name: "Graffiti",
        internal_name: "CSGO_Type_Spray",
        float: false
    },
    c4:{
        key: 'c4',
        name: "C4",
        internal_name: "CSGO_Type_C4",
        float: false
    },
    sniper:{
        key: 'sniper',
        name: "Sniper Rifle",
        internal_name: "CSGO_Type_SniperRifle",
        float: true
    },
    rifle:{
        key: 'rifle',
        name: "Rifle",
        internal_name: "CSGO_Type_Rifle",
        float: true
    },
    pistol:{
        key: 'pistol',
        name: "Pistol",
        internal_name: "CSGO_Type_Pistol",
        float: true
    },
    smg:{
        key: 'smg',
        name: "SMG",
        internal_name: "CSGO_Type_SMG",
        float: true
    },
    gloves:{
        key: 'gloves',
        name: "Gloves",
        internal_name: "Type_Hands",
        float: true
    },
    key:{
        key: 'key',
        name: "Key",
        internal_name: "CSGO_Tool_WeaponCase_KeyTag",
        float: false
    },
    music_kit:{
        key: 'music_kit',
        name: "Music Kit",
        internal_name: "CSGO_Type_MusicKit",
        float: false
    },
    nametag:{
        key: 'nametag',
        name: "Name Tag",
        internal_name: "CSGO_Tool_Name_TagTag",
        float: false
    },
    shotgun:{
        key: 'shotgun',
        name: "Shotgun",
        internal_name: "CSGO_Type_Shotgun",
        float: true
    },
    machinegun:{
        key: 'machinegun',
        name: "Machinegun",
        internal_name: "CSGO_Type_Machinegun",
        float: true
    },
    sticker:{
        key: 'sticker',
        name: "Sticker",
        internal_name: "CSGO_Tool_Sticker",
        float: false
    },
    tool:{
        key: 'tool',
        name: "Swap Tool",
        internal_name: "CSGO_Type_Tool",
        float: false
    },
    ticket:{
        key: 'ticket',
        name: "Pass",
        internal_name: "CSGO_Type_Ticket",
        float: false
    },
    gift_package:{
        key: 'gift_package',
        name: "Gift Package",
        internal_name: "CSGO_Tool_GiftTag",
        float: false
    },
    unknown_type:{
        key: 'unknown_type',
        name: "Unknown Type",
        internal_name: "Unknown",
        float: false
    },
    custom_player:{
        key: 'custom_player',
        name: "Custom Player",
        internal_name: "Type_CustomPlayer",
        float: false
    }
};

export default itemTypes;