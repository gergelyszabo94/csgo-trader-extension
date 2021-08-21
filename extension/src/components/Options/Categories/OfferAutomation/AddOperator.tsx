import { Operator } from '.';
import React from 'react';
import { operators } from 'utils/static/offers';

const Operators = (): JSX.Element => {
    const operatorsArr = [];
    for (const [key, value] of Object.entries(operators)) {
        operatorsArr.push({
            key,
            name: value.pretty,
            desc: value.description,
        });
    }
    return (
        <>
            {operatorsArr.map((option) => {
                return (
                    <option key={option.key} value={option.key} title={option.desc}>
                        {option.name}
                    </option>
                );
            })}
        </>
    );
};

interface AddOperatorProps {
    type: Operator;
    index: number;
    onChange: (index: number, operator: Operator) => void;
}

const AddOperator = ({ type, index, onChange }: AddOperatorProps) => {
    const onOperatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(index, event.target.value as Operator);
    };

    return (
        <select className='select-theme' onChange={onOperatorChange} defaultValue={type}>
            <Operators />
        </select>
    );
};

export default AddOperator;
