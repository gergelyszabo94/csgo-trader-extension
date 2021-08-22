import { Option } from '../../Row';
import React from 'react';
import Select from 'components/Select';
import { exchangeRates } from 'types';

interface CurrencyProps {
    id: string;
    options: Option[];
}

const Currency = ({ id, options }: CurrencyProps) => {
    const setStorage = (thisValue: string | number) => {
        chrome.storage.local.get(['exchangeRates'], ({ exchangeRates }: exchangeRates) => {
            chrome.storage.local.set(
                {
                    currency: thisValue,
                    exchangeRate: exchangeRates[thisValue],
                },
                () => {},
            );
        });
    };

    const getStorage = (): Promise<string> => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['currency'], ({ currency }) => {
                resolve(currency);
            });
        });
    };

    return <Select id={id} foreignChangeHandler={setStorage} foreignUseEffect={getStorage} options={options} />;
};

export default Currency;
