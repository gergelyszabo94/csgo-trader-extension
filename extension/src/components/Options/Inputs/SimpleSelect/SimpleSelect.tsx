import React from 'react';
import Select from 'components/Select/Select';

const SimpleSelect = ({ id, options }) => {
    const setStorage = (thisValue) => {
        chrome.storage.local.set({ [id]: thisValue }, () => {});
    };

    const getStorage = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(id, (result) => {
                resolve(result[id]);
            });
        });
    };

    return (
        <Select
            id={id}
            foreignChangeHandler={setStorage}
            foreignUseEffect={getStorage}
            options={options}
        />
    );
};

export default SimpleSelect;
