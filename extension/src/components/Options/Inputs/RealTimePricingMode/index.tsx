import { Option } from '../../Row';
import React from 'react';
import Select from 'components/Select';

interface RealTimePricingModeProps {
    id: string;
    options: Option[];
}

const RealTimePricingMode = ({ id, options }: RealTimePricingModeProps) => {
    const setStorage = (thisValue: string | number) => {
        chrome.storage.local.set(
            {
                realTimePricesMode: thisValue,
            },
            () => {},
        );
    };

    const getStorage = (): Promise<string> => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['realTimePricesMode'], ({ realTimePricesMode }) => {
                resolve(realTimePricesMode);
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

export default RealTimePricingMode;
