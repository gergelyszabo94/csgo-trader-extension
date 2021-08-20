import React from 'react';
import { conditions } from 'utils/static/friendRequests';

const Condition = ({ type, value }) => {
    return (
        <span title={conditions[type].description}>
            {conditions[type].pretty}
            {value !== undefined ? ` ${value}` : ''}
        </span>
    );
};

export default Condition;
