import React from 'react';
import { conditions } from 'utils/static/offers';

const Condition = ({ type, value }) => {
    return (
        <span title={conditions[type].description}>
            {conditions[type].pretty}
            <span className='offerConditionValue'>{value !== undefined ? ` ${value}` : ''}</span>
        </span>
    );
};

export default Condition;
