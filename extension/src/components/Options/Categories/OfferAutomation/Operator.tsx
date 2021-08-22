import React from 'react';
import { operators } from 'utils/static/offers';
import { Operator } from '.';

interface OperatorProps {
    operator: Operator;
}

const Operator = ({ operator }: OperatorProps) => {
    if (operator !== undefined) {
        return <strong title={operators[operator].description}>{operators[operator].pretty}</strong>;
    }
    return null;
};

export default Operator;
