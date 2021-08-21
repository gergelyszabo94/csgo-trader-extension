import React from 'react';
import { conditions } from 'utils/static/friendRequests';

interface ConditionProps {
    type: string;
    value?: 
}

const Condition = ({ type, value }) => {
    return (
        <span title={conditions[type].description}>
            {conditions[type].pretty}
            {value !== undefined ? ` ${value}` : ''}
        </span>
    );
};

export default Condition;
