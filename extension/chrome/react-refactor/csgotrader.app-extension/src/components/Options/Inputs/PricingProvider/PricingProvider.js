/* globals updatePrices */
import React, { useState } from "react";
import Select from "components/Select/Select";

import './PricingProvider.css';

const PricingProvider = props => {
    const [aboutProvider, setAboutProvider] = useState(props.options.csgotrader.description);
    const [aboutMode, setAboutMode] = useState(props.options.csgotrader.pricing_modes.csgotrader.description);

    const options = [];

    for (const provider in props.options) {
        for (const mode in props.options[provider].pricing_modes) {
            const textModePart = provider === mode ? '' : ` -  ${props.options[provider].pricing_modes[mode].long}`;
            options.push({
                key: `${provider}.${mode}`,
                text: `${props.options[provider].long} ${textModePart}`
            });
        }
    }

    const setStorage = thisValue => {
        const pricingProvider = thisValue.split('.')[0];
        const pricingMode = thisValue.split('.')[1];

        setAboutProvider(props.options[pricingProvider].description);
        setAboutMode(props.options[pricingProvider].pricing_modes[pricingMode].description);

        chrome.storage.local.set({pricingProvider, pricingMode}, () => {
            updatePrices();
        });
    };

    const getStorage = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['pricingProvider', 'pricingMode'], result => {
                const { pricingProvider, pricingMode } = result;

                setAboutProvider(props.options[pricingProvider].description);
                setAboutMode(props.options[pricingProvider].pricing_modes[pricingMode].description);

                resolve(`${pricingProvider}.${pricingMode}`);
            });
        });
    };

    return (
        <>
            <Select
                id='pricingProvider'
                foreignChangeHandler={setStorage}
                foreignUseEffect={getStorage}
                options={options}
            />
            <div className='about'>
                <b>About the provider:</b> <span>{aboutProvider}</span>
            </div>
            <div>
                <b>About the pricing mode:</b> <span>{aboutMode}</span>
            </div>
        </>
    );
};

export default PricingProvider;
