export interface Prices {
    [key: string]: object;
}

export interface PriceQueueActivity {
    lastUsed: number;
    usedAt: string;
}

export type PricingMode = string;
export type PricingProvider = string;
export type RealTimePricesFreqFailure = number;
export type RealTimePricesFreqSuccess = number;
export type RealTimePricesMode = string;
