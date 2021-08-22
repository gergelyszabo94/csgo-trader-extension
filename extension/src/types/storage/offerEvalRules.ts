export interface OfferEvalRule {
    action: string;
    active: boolean;
    conditions: Condition[];
    operators: string[];
}

export interface OfferEvalRules {
    offerEvalRules: OfferEvalRule[];
}

interface Condition {
    type: string;
    value?: any;
    valueType?: any;
}
