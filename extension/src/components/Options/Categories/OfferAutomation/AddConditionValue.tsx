import React from 'react';
import { conditions } from 'utils/static/offers';

const AddConditionValue = ({ type, value, onValueChange }) => {
    if (conditions[type].with_value) {
        if (conditions[type].value_type === 'number') {
            return (
                <input
                    type='number'
                    className='numberInput numberInput__narrow'
                    value={value}
                    onChange={onValueChange}
                />
            );
        }
        if (conditions[type].value_type === 'string') {
            return <input type='text' value={value} onChange={onValueChange} className='input' />;
        }
    }
    return null;
};

export default AddConditionValue;
