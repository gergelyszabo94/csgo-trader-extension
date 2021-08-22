export interface Bookmark {
    added: number;
    comment: string;
    itemInfo: ItemInfo;
    notifTime: string;
    notifType: string;
    notify: boolean;
    owner: string;
}

export interface Bookmarks {
    bookmarks: Bookmark[];
}

interface ItemInfo {
    appid: string;
    assetid: string;
    classid: string;
    contextid: string;
    dopplerInfo?: any;
    duplicates: Duplicates;
    exterior: Exterior;
    floatInfo: FloatInfo;
    iconURL: string;
    inspectLink: string;
    instanceid: string;
    isSouvenir: boolean;
    isStatrack: boolean;
    market_hash_name: string;
    marketable: number;
    marketlink: string;
    name: string;
    name_color: string;
    nametag?: any;
    owner: string;
    patternInfo?: any;
    position: number;
    price: Price;
    quality: Quality;
    starInName: boolean;
    stickerPrice?: any;
    stickers: any[];
    tradability: string;
    tradabilityShort: string;
    type: Type;
}

interface Type {
    float: boolean;
    internal_name: string;
    key: string;
    name: string;
}

interface Quality {
    backgroundcolor: string;
    color: string;
    name: string;
    prettyName: string;
}

interface Price {
    display: string;
    price: string;
}

interface FloatInfo {
    floatvalue: number;
    low_rank?: any;
    max: number;
    min: number;
    origin_name: string;
    paintindex: number;
    paintseed: number;
    stickers: any[];
}

interface Exterior {
    internal_name: string;
    localized_name: string;
    localized_short: string;
    name: string;
    short: string;
    type: string;
}

interface Duplicates {
    instances: string[];
    num: number;
}
