import React from 'react';
import Select from 'components/Select';

const Currency = ({ id, options }) => {
    const setStorage = (thisValue) => {
        chrome.storage.local.get(['exchangeRates'], ({ exchangeRates }) => {
            chrome.storage.local.set(
                {
                    currency: thisValue,
                    exchangeRate: exchangeRates[thisValue],
                },
                () => {},
            );
        });
    };

    const getStorage = () => {
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
