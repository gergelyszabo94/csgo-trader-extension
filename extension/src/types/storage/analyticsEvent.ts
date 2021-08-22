export interface analyticsEvent {
    type: string;
    action: string;
    timestamp: number;
}

export interface analyticsEvents {
    analyticsEvents: analyticsEvent[];
}
