import React from 'react';
import { conditions } from 'utils/static/friendRequests';
import { Condition } from '.';

const Condition = ({ type, value }: Condition) => {
    return (
        <span title={conditions[type].description}>
            {conditions[type].pretty}
            {value !== undefined ? ` ${value}` : ''}
        </span>
    );
};

export default Condition;
