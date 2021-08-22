import { Option } from '../../Row';
import React from 'react';
import Select from 'components/Select';

interface DoubleSelectProps {
    id: string[];
    options: Option[];
}

const DoubleSelect = ({ id, options }: DoubleSelectProps ) => {
    const setStorage = (thisValue: string | number, key: string) => {
        //@ts-ignore idk why this takes a stirng[] over a string :shrug:
        if (key === undefined) chrome.storage.local.set({ [id]: thisValue }, () => {});
        else chrome.storage.local.set({ [key]: thisValue }, () => {});
    };

    const getStorage = (key: string): Promise<string> => {
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
