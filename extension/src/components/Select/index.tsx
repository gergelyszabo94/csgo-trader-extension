import React, { useEffect, useState } from 'react';

interface SelectProps {
    id: string;
    foreignChangeHandler: ((thisValue: string | number) => void) | ((thisValue: string | number, key: string) => void);
    foreignUseEffect: (() => Promise<string>) | ((key: string) => Promise<string>);
    options: object;
    
}

const Select = ({ options, foreignChangeHandler, foreignUseEffect, id }: SelectProps) => {
    const [value, setValue] = useState(options[0].key);

    const changeHandler = (e) => {
        const thisValue = e.target.value;
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
