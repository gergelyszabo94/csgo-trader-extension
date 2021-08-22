import './PricingProvider.css';

import React, { useState } from 'react';

import NewTabLink from 'components/NewTabLink';
import Select from 'components/Select';
import { updatePrices } from 'utils/pricing';

interface PricingProviderProps {
    options: object
}

const PricingProvider = ({ options }: PricingProviderProps) => {
    const [aboutProvider, setAboutProvider] = useState({
        description: options.csgotrader.description,
        link: options.csgotrader.url,
    });
    const [aboutMode, setAboutMode] = useState(
        options.csgotrader.pricing_modes.csgotrader.description,
    );

    const selectOptions = [];

    for (const [providerKey, provider] of Object.entries(options)) {
        for (const [modeKey, mode] of Object.entries(provider.pricing_modes)) {
            const textModePart = providerKey === mode ? '' : ` -  ${mode.long}`;
            selectOptions.push({
                key: `${providerKey}.${modeKey}`,
                text: `${provider.long} ${textModePart}`,
            });
        }
    }

    const setStorage = (thisValue) => {
        const pricingProvider = thisValue.split('.')[0];
        const pricingMode = thisValue.split('.')[1];

        setAboutProvider({
            description: options[pricingProvider].description,
            link: options[pricingProvider].url,
        });
        setAboutMode(options[pricingProvider].pricing_modes[pricingMode].description);

        chrome.storage.local.set({ pricingProvider, pricingMode }, () => {
            updatePrices();
        });
    };

    const getStorage = (): Promise<string> => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['pricingProvider', 'pricingMode'], (result) => {
                const { pricingProvider, pricingMode } = result;

                setAboutProvider({
                    description: options[pricingProvider].description,
                    link: options[pricingProvider].url,
                });
                setAboutMode(options[pricingProvider].pricing_modes[pricingMode].description);

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
                options={selectOptions}
            />
            <div className='about'>
                <NewTabLink to={aboutProvider.link}>
                    <b>About the provider:</b>
                </NewTabLink>{' '}
                <span>{aboutProvider.description}</span>
            </div>
            <div>
                <b>About the pricing mode:</b> <span>{aboutMode}</span>
            </div>
        </>
    );
};

export default PricingProvider;
