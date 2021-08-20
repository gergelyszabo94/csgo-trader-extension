import React, { useState, useEffect } from 'react';

const Number = ({ id }) => {
    const [state, setState] = useState(false);

    const onChangeHandler = (event) => {
        const value = event.target.value;
        chrome.storage.local.set({ [id]: value }, () => {
            setState(value);
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
            value={state}
            onChange={onChangeHandler}
        />
    );
};

export default Number;
