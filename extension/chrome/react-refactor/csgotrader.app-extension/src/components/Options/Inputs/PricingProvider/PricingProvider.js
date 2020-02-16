/* globals updatePrices */
import React, { Fragment } from "react";
import Select from "components/Options/Inputs/Select/Select";

const PricingProvider = props => {
    const options = [];

    for (const provider in props.options) {
        for (const mode in props.options[provider]['pricing_modes']) {
            const textModePart = provider === mode ? '' : ` -  ${props.options[provider]['pricing_modes'][mode].long}`;
            options.push({
                key: `${provider}.${mode}`,
                text: `${props.options[provider].long} ${textModePart}`
            });
        }
    }

    const setStorage = thisValue => {
        chrome.storage.local.set({
            pricingProvider: thisValue.split('.')[0],
            pricingMode: thisValue.split('.')[1]
        }, () => {
            updatePrices();
        });
    };

    const getStorage = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['pricingProvider', 'pricingMode'], result => {
                resolve(`${result.pricingProvider}.${result.pricingMode}`);
            });
        });
    };

    return (
        <Fragment>
            <Select
                id='pricingProvider'
                foreignChangeHandler={setStorage}
                foreignUseEffect={getStorage}
                options={options}
            />
            <div>
                About:
            </div>
        </Fragment>
    );
};

export default PricingProvider;
