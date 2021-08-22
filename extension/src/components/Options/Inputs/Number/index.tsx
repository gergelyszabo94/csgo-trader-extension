import React, { useEffect, useState } from 'react';

interface NumberProps {
    id: string;
}

const Number = ({ id }: NumberProps) => {
    const [state, setState] = useState(false);

    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        chrome.storage.local.set({ [id]: value }, () => {
            setState(value.toLowerCase() === 'true');
        });
    };

    useEffect(() => {
        chrome.storage.local.get(id, (result) => {
            setState(result[id]);
        });
    }, [id]);

    return (
        <input
            type='number'
            id={id}
            className='numberInput numberInput__wide'
            value={String(state)}
            onChange={onChangeHandler}
        />
    );
};

export default Number;
