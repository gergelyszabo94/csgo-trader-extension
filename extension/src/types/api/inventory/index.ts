export interface Inventory {
    [key: string]: Item;
}

export interface Item {
    id: string;
    classid: string;
    instanceid: string;
    amount: string;
    hide_in_china: number;
    pos: number;
}

export interface Descriptions {
    [key: string]: Description;
}

export interface Description {
    appid: string;
    classid: string;
    instanceid: string;
    icon_url: string;
    icon_url_large: string;
    icon_drag_url: string;
    name: string;
    market_hash_name: string;
    market_name: string;
    name_color: string;
    background_color: string;
    type: string;
    tradable: number;
    marketable: number;
    commodity: number;
    market_tradable_restriction: string;
    cache_expiration: string;
    descriptions: SmallDescription[];
    actions: Action[];
    market_actions: Action[];
    tags: Tag[];
}

export interface Tag {
    internal_name: string;
    name: string;
    category: string;
    category_name: string;
    color?: string;
}

export interface Action {
    name: string;
    link: string;
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