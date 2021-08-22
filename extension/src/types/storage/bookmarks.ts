import { Exterior, FloatInfo, Price, Quality, Type } from 'types';

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

export interface ItemInfo {
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

export interface Duplicates {
    instances: string[];
    num: number;
}
