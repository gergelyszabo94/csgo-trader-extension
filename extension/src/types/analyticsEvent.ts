export interface analyticsEvent {
    action: string;
    timestamp: number;
    type: string;
}

export interface analyticsEvents {
    analyticsEvents: analyticsEvent[];
}
