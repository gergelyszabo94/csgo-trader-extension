export interface offerEvalRule {
    action: string;
    active: boolean;
    conditions: condition[];
    operators: string[];
}

interface condition {
    type: string;
    value?: any;
    valueType?: any;
}
