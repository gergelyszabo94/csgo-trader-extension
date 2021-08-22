export interface TradeOffersEventLog {
    offerID: string;
    rule: number;
    steamID: string;
    timestamp: number;
    type: string;
}

export interface TradeOffersEventLogs {
    tradeOffersEventLogs: TradeOffersEventLog[];
}

export type TradeOffersSortingMode = string;
export type TradeHistoryLastUpdate = number;
