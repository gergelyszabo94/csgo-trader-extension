import React from 'react';
import { conditions } from 'utils/static/offers';
import { Condition } from '.';

const Condition = ({ type, value }: Condition) => {
    return (
        <span title={conditions[type].description}>
            {conditions[type].pretty}
            <span className='offerConditionValue'>{value !== undefined ? ` ${value}` : ''}</span>
        </span>
    );
};

export default Condition;
