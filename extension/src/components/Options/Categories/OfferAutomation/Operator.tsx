import React from 'react';
import { operators } from 'utils/static/offers';

const Operator = ({ operator }) => {
    if (operator !== undefined) {
        return (
            <strong title={operators[operator].description}>{operators[operator].pretty}</strong>
        );
    }
    return null;
};

export default Operator;
