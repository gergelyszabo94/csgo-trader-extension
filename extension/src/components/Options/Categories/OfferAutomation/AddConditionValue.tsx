import React from 'react';
import { conditions } from 'utils/static/offers';

interface AddConditionValueProps {
    type: string;
    value: string | number;
    onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddConditionValue = ({ type, value, onValueChange }: AddConditionValueProps) => {
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
