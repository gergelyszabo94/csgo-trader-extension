export interface OfferEvalRule {
    action: string;
    active: boolean;
    conditions: Condition[];
    operators: string[];
}

export interface OfferEvalRules {
    offerEvalRules: OfferEvalRule[];
}

export interface Condition {
    type: string;
    value?: number | string;
    valueType?: any;
}

export interface FriendRequestEvalRule {
    action: string;
    active: boolean;
    condition: Condition;
}

export interface FriendRequestEvalRules {
    friendRequestEvalRule: FriendRequestEvalRule[];
}
