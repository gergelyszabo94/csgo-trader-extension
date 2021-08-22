import React, { useEffect, useState } from 'react';

import { Option } from '../Options/Row';

interface SelectProps {
    id: string;
    foreignChangeHandler: (thisValue: string | number, key?: string) => void;
    foreignUseEffect: (key?: string) => Promise<string>;
    options: Option[];
}

const Select = ({ options, foreignChangeHandler, foreignUseEffect, id }: SelectProps) => {
    const [value, setValue] = useState(options[0].key);

    const changeHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const thisValue = event.target.value;
        foreignChangeHandler(thisValue, id);
        setValue(thisValue);
    };

    useEffect(() => {
        foreignUseEffect(id).then((result) => {
            setValue(result);
        });
    }, []);

    return (
        <select className='select-theme' id={id} onChange={changeHandler} value={value}>
            {options.map((option) => {
                return (
                    <option
                        key={id + option.key}
                        value={option.key}
                        title={option.description ? option.description : ''}
                    >
                        {option.text}
                    </option>
                );
            })}
        </select>
    );
};

export default Select;
