// some global types that are used more than once
// can be added to, removed, replaced, etc in the future

// custom

export interface DopplerMapping {
    type: string;
    name: string;
    short: string;
    color: string;
}

export interface SmallItem {
    appid: string;
    contextid: string;
    amount: number;
    assetid: string;
}

export interface SharedFileIDAndOwner {
    ownerID: string;
    sharedFileID: string;
}

// shared

export interface Action {
    link: string;
    name: string;
}

export interface Exterior {
    internal_name: string;
    localized_name: string;
    localized_short: string;
    name: string;
    short: string;
    type: string;
}

export interface FloatInfo {
    floatvalue: number;
    low_rank?: number;
    max: number;
    min: number;
    origin_name: string;
    paintindex: number;
    paintseed: number;
    stickers: any[];
}

export interface Price {
    display: string;
    price: string;
}

export interface Quality {
    backgroundcolor: string;
    color: string;
    name: string;
    prettyName: string;
}

export interface Type {
    float: boolean;
    internal_name: string;
    key: string;
    name: string;
}
