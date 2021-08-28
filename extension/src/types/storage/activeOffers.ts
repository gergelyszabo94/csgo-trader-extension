import { Action, Exterior, FloatInfo, Price, Quality, Tag, Type } from 'types';

export interface ActiveOffers {
    descriptions: SmallDescription[];
    items: Item[];
    lastFullUpdate: number;
    received: Offer[];
    receivedActiveCount: number;
    sent: Offer[];
    sentActiveCount: number;
}

export interface Offer {
    PLPercentage: number;
    PLPercentageFormatted: string;
    accountid_other: number;
    confirmation_method: number;
    escrow_end_date: number;
    expiration_time: number;
    from_real_time_trade: boolean;
    is_our_offer: boolean;
    items_to_give: ItemsInOffer[];
    items_to_receive: ItemsInOffer[];
    message: string;
    profitOrLoss: number;
    theirIncludesItemWIthNoPrice: boolean;
    theirIncludesNonCSGO: boolean;
    theirItemsTotal: number;
    time_created: number;
    time_updated: number;
    trade_offer_state: number;
    tradeofferid: string;
    yourIncludesItemWIthNoPrice: boolean;
    yourIncludesNonCSGO: boolean;
    yourItemsTotal: number;
}

export interface ItemsInOffer {
    amount: string;
    appid: number;
    assetid: string;
    classid: string;
    contextid: string;
    est_usd: string;
    instanceid: string;
    missing: boolean;
}

export interface Item {
    appid: string;
    assetid: string;
    classid: string;
    contextid: string;
    descriptions: SmallerDescription[];
    dopplerInfo?: any;
    exterior?: Exterior;
    floatInfo?: FloatInfo;
    iconURL: string;
    inOffer: string;
    inspectLink: string;
    instanceid: string;
    isSouvenir: boolean;
    isStatrack: boolean;
    market_hash_name: string;
    marketable: boolean;
    marketlink: string;
    name: string;
    name_color: string;
    nametag?: any;
    offerOrigin: string;
    owner: string;
    patternInfo?: any;
    position: number;
    price: Price;
    quality: Quality;
    side: string;
    starInName: boolean;
    stickerPrice?: StickerPrice;
    stickers: Sticker[];
    type: Type;
}

export interface Sticker {
    iconURL: string;
    marketURL: string;
    name: string;
    price: Price;
}

export interface StickerPrice {
    display: string;
    price: number;
}

export interface SmallDescription {
    actions: Action[];
    appid: number;
    background_color: string;
    classid: string;
    commodity: boolean;
    currency: boolean;
    descriptions: SmallerDescription[];
    icon_url: string;
    icon_url_large: string;
    instanceid: string;
    market_actions: Action[];
    market_hash_name: string;
    market_name: string;
    market_tradable_restriction: number;
    marketable: boolean;
    name: string;
    name_color: string;
    tags: Tag[];
    tradable: boolean;
    type: string;
}

export interface SmallerDescription {
    type: string;
    value: string;
    color?: string;
}
