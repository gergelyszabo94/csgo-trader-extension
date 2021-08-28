import { Action, Tag } from 'types';

export interface TradeOffers {
    trade_offers_sent: TradeOffer[];
    trade_offers_received: TradeOffer[];
    descriptions: Description[];
    next_cursor: number;
}

export interface Description {
    appid: number;
    classid: string;
    instanceid: string;
    currency: boolean;
    background_color: string;
    icon_url: string;
    icon_url_large: string;
    icon_drag_url?: string;
    descriptions: SmallDescription[];
    tradable: boolean;
    actions: Action[];
    name: string;
    name_color: string;
    type: string;
    market_name: string;
    market_hash_name: string;
    market_actions: MarketAction[];
    commodity: boolean;
    market_tradable_restriction: number;
    marketable: boolean;
    tags: Tag[];
}

export interface SmallDescription {
    type: string;
    value: string;
    color?: string;
    app_data?: AppData;
}

export interface AppData {
    def_index: string;
    is_itemset_name: number;
}

export interface MarketAction {
    link: string;
    name: string;
}

export interface TradeOffer {
    tradeofferid: string;
    accountid_other: number;
    message: string;
    expiration_time: number;
    trade_offer_state: number;
    items_to_give?: Item[];
    items_to_receive?: Item[];
    is_our_offer: boolean;
    time_created: number;
    time_updated: number;
    from_real_time_trade: boolean;
    escrow_end_date: number;
    confirmation_method: number;
}

export interface Item {
    appid: number;
    contextid: string;
    assetid: string;
    classid: string;
    instanceid: string;
    amount: string;
    missing: boolean;
    est_usd: string;
}
