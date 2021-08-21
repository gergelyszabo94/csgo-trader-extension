import React from 'react';
import Select from 'components/Select';

const DoubleSelect = ({ id, options }) => {
    const setStorage = (thisValue, key) => {
        if (key === undefined) chrome.storage.local.set({ [id]: thisValue }, () => {});
        else chrome.storage.local.set({ [key]: thisValue }, () => {});
    };

    const getStorage = (key) => {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (result) => {
                resolve(result[key]);
            });
        });
    };

    return (
        <>
            <Select
                id={id[0]}
                foreignChangeHandler={setStorage}
                foreignUseEffect={getStorage}
                options={options}
            />
            <Select
                id={id[1]}
                foreignChangeHandler={setStorage}
                foreignUseEffect={getStorage}
                options={options}
            />
        </>
    );
};

export default DoubleSelect;
