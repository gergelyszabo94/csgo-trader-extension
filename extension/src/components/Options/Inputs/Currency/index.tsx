import { ExchangeRates } from 'types';
import React from 'react';
import Select from 'components/Select';

interface CurrencyProps {
    id: string;
    options: object;
}

const Currency = ({ id, options }: CurrencyProps) => {
    const setStorage = (thisValue: string | number) => {
        chrome.storage.local.get(['exchangeRates'], ({ exchangeRates }: ExchangeRates) => {
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

    return (
        <Select
            id={id}
            foreignChangeHandler={setStorage}
            foreignUseEffect={getStorage}
            options={options}
        />
    );
};

export default Currency;
