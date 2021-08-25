import Row, { Option } from '../Row';
import { currencies, pricingProviders, realTimePricingModes } from 'utils/static/pricing';

import Category from '../Category';
import NewTabLink from 'components/NewTabLink';
import React from 'react';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import Currency from '../Inputs/Currency';
import PricingProvider from '../Inputs/PricingProvider';
import Refresh from '../Inputs/Refresh';
import RealTimePricingMode from '../Inputs/RealTimePricingMode';
import Number from '../Inputs/Number';

const pricing = () => {
    const transformCurrencies = (): Option[] => {
        const transformedCurrencies = [];
        for (const currency of Object.values(currencies)) {
            transformedCurrencies.push({
                key: currency.short,
                text: `${currency.short} - ${currency.long}`,
            });
        }

        return transformedCurrencies;
    };

    const transformRealTimeModes = (): Option[] => {
        const transformedModes = [];
        for (const mode of Object.values(realTimePricingModes)) {
            transformedModes.push({
                key: mode.key,
                text: mode.name,
                description: mode.description,
            });
        }

        return transformedModes;
    };

    return (
        <Category
            title='Pricing'
            subTitle={
                <>
                    <span className='countdown'>DISCLAIMER: </span>
                    No pricing provider is 100% accurate all the time. Take these prices as advisory, always with a
                    pinch of salt. You should not rely on them solely when doing your trades.
                </>
            }
        >
            <Row name='Pricing' description='Shows item prices in inventories and trade offers'>
                <FlipSwitchStorage id='itemPricing' />;
            </Row>
            <Row
                name='Show sticker worth on items'
                description='When turned on it puts the total price of the stickers applied on a weapon under the exterior indicator in inventories, trade offers and no the incoming trade offers page.'
            >
                <FlipSwitchStorage id='showStickerPrice' />;
            </Row>
            <Row name='Currency' description='The currency you want prices to show in for you'>
                <Currency id='currency' options={transformCurrencies()} />;
            </Row>
            <Row
                name='Provider'
                description={
                    <>
                        The pricing provider and pricing mode you want to get your prices from. Learn more about pricing
                        and price on the
                        <NewTabLink to='https://csgotrader.app/prices/'> prices page</NewTabLink>
                    </>
                }
            >
                <PricingProvider options={pricingProviders} />;
            </Row>
            <Row
                name='Refresh Prices'
                description='Normally prices refresh every 24 hours in the back end and on are also refreshed daily by the client.
                    These two events are not synced so you might have a bit outdated prices.
                    Refreshing the prices makes sure that you have the latest. Refreshing multiple times in a short period of time is pointless.'
            >
                <Refresh />;
            </Row>
            <Row
                name='RealTime pricing mode'
                description='The RealTime pricing mode you want the extension to show prices in.'
            >
                <RealTimePricingMode id='realTimePricesMode' options={transformRealTimeModes()} />;
            </Row>
            <Row
                name='RealTime price fetching frequency'
                description='The frequency to fetch RealTime prices at from Steam in milliseconds.
                     The default is 3000, which is 3 seconds, if you set it too low then the the requests will start failing often.'
            >
                <Number id='realTimePricesFreqSuccess' />
            </Row>
            <Row
                name='RealTime price fetching failure delay'
                description="The extension will wait this much to start loading RealTime prices again if it fails once.
                     It's in milliseconds, the default value is 15000, which is 15 seconds.
                     If you set it too low then the extension will keep retrying too often and you risk getting a temporary ip ban from Steam."
            >
                <Number id='realTimePricesFreqFailure' />
            </Row>
        </Category>
    );
};

export default pricing;
