import React from 'react';
import { conditions } from 'utils/static/offers';
import AddConditionValue from 'components/Options/Categories/OfferAutomation/AddConditionValue';

const Options = () => {
    const optionsArr = [];
    for (const [key, value] of Object.entries(conditions)) {
        optionsArr.push({
            key,
            name: value.pretty,
            desc: value.description,
        });
    }
    return optionsArr.map((option) => {
        return (
            <option key={option.key} value={option.key} title={option.desc}>
                {option.name}
            </option>
        );
    });
};

const AddCondition = ({ type, value, index, onChange }) => {
    const onConditionChange = (event) => {
        const conditionType = event.target.value;
        onChange(index, {
            type: conditionType,
            value: conditions[conditionType].with_value
                ? conditions[conditionType].default_value
                : null,
        });
    };

    const onValueChange = (event) => {
        onChange(index, {
            type,
            value: event.target.value,
        });
    };

    return (
        <>
            <select className='select-theme' onChange={onConditionChange} defaultValue={type}>
                <Options />
            </select>
            <AddConditionValue type={type} value={value} onValueChange={onValueChange} />
        </>
    );
};

export default AddCondition;
