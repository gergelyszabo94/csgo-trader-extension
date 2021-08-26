import React from 'react';

import { currencies } from 'utils/static/pricing';

import Category from '../Category';
import DoubleSelect from '../Inputs/DoubleSelect';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import LinksToShow from '../Inputs/LinksToShow';
import Number from '../Inputs/Number';
import Row from '../Row';

import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';

const popup = () => {
    const transformCurrencies = () => {
        const transformedCurrencies = [];
        for (const currency of Object.values(currencies)) {
            transformedCurrencies.push({
                key: currency.short,
                text: `${currency.short} - ${currency.long}`,
            });
        }

        return transformedCurrencies;
    };
    return (
        <Category title='Popup'>
            <Row
                name='Links to show'
                description="Choose which links you want to see in the popup. 'Options' will always be there so you can come back and see this page. Links to be shown are in gold, links to be hidden are in white. Click it to switch visibility. You can also delete those that you have created before."
            >
                <LinksToShow id='popupLinks' />;
            </Row>
            <Row
                name='Show offers on badge'
                description={
                    <>
                        Shows the number of incoming offers you have on the extension badge
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='showNumberOfOfferOnBadge' />;
            </Row>
            <Row
                name='Default converter currencies'
                description='The currencies to be selected by default in the currency converter'
            >
                <DoubleSelect
                    id={['defaultConverterCurrency1', 'defaultConverterCurrency2']}
                    options={transformCurrencies()}
                />
                ;
            </Row>
            <Row
                name='Default currency conversion value'
                description='The default placeholder value that appears in the currency conversion input'
            >
                <Number id='calculatorConversionPlaceholder' />;
            </Row>
            <Row
                name='Default percentage in the percentage calculator'
                description='The default placeholder value that appears as the percentage in the percentage calculator'
            >
                <Number id='calculatorPercentagePercentage' />;
            </Row>
            <Row
                name='Default "percentage of" in the percentage calculator'
                description='The default placeholder value that appears as the "percentage of" in the percentage calculator'
            >
                <Number id='calculatorPercentageOf' />;
            </Row>
            <Row
                name='Default percentage in the reverse percentage calculator'
                description='The default placeholder value that appears as the percentage in the reverse percentage calculator'
            >
                <Number id='calculatorReversePercentage' />;
            </Row>
            <Row
                name='Default "percentage of" in the reverse percentage calculator'
                description='The default placeholder value that appears as the "percentage of" in the reverse percentage calculator'
            >
                <Number id='calculatorReverseValue' />;
            </Row>
            <Row
                name='Default percentage in the Increment/Decrement calculator'
                description='The default placeholder value that appears as the percentage in the Increment/Decrement calculator'
            >
                <Number id='calculatorIncDecPercentage' />;
            </Row>
            <Row
                name='Default "result" in the Increment/Decrement calculator'
                description='The default placeholder value that appears as the "result" in the Increment/Decrement calculator'
            >
                <Number id='calculatorIncDecResult' />;
            </Row>
        </Category>
    );
};

export default popup;
