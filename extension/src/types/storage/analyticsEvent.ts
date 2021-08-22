export interface AnalyticsEvent {
    type: string;
    action: string;
    timestamp: number;
}

export interface AnalyticsEvents {
    analyticsEvents: AnalyticsEvent[];
}
