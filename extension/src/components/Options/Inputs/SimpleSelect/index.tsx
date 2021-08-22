import { Option } from '../../Row';
import React from 'react';
import Select from 'components/Select';

interface SimpleSelectProps {
    id: string;
    options: Option[];
}

const SimpleSelect = ({ id, options }: SimpleSelectProps) => {
    const setStorage = (thisValue: string | number) => {
        chrome.storage.local.set({ [id]: thisValue }, () => {});
    };

    const getStorage = (): Promise<string> => {
        return new Promise((resolve) => {
            chrome.storage.local.get(id, (result) => {
                resolve(result[id]);
            });
        });
    };

    return <Select id={id} foreignChangeHandler={setStorage} foreignUseEffect={getStorage} options={options} />;
};

export default SimpleSelect;
