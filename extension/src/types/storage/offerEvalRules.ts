export interface OfferEvalRule {
    action: string;
    active: boolean;
    conditions: Condition[];
    operators: string[];
}

interface Condition {
    type: string;
    value?: any;
    valueType?: any;
}
