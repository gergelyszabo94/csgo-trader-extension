import React from 'react';

import { currencies } from 'utils/static/pricing';
import Category from '../Category/Category';
import Row from '../Row';

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
    <Category title="Popup">
      <Row
        name="Links to show"
        type="linksToShow"
        id="popupLinks"
        description="Choose which links you want to see in the popup. 'Options' will always be there so you can come back and see this page. Links to be shown are in gold, links to be hidden are in white. Click it to switch visibility. You can also delete those that you have created before."
      />
      <Row
        name="Default converter currencies"
        type="doubleSelect"
        id={['defaultConverterCurrency1', 'defaultConverterCurrency2']}
        description="The currencies to be selected by default in the currency converter"
        options={transformCurrencies()}
      />
      <Row
        name="Default currency conversion value"
        type="number"
        id="calculatorConversionPlaceholder"
        description="The default placeholder value that appears in the currency conversion input"
      />
      <Row
        name="Default percentage in the percentage calculator"
        type="number"
        id="calculatorPercentagePercentage"
        description="The default placeholder value that appears as the percentage in the percentage calculator"
      />
      <Row
        name={'Default "percentage of" in the percentage calculator'}
        type="number"
        id="calculatorPercentageOf"
        description={'The default placeholder value that appears as the "percentage of" in the percentage calculator'}
      />
      <Row
        name="Default percentage in the reverse percentage calculator"
        type="number"
        id="calculatorReversePercentage"
        description="The default placeholder value that appears as the percentage in the reverse percentage calculator"
      />
      <Row
        name={'Default "percentage of" in the reverse percentage calculator'}
        type="number"
        id="calculatorReverseValue"
        description={'The default placeholder value that appears as the "percentage of" in the reverse percentage calculator'}
      />
      <Row
        name="Default percentage in the Increment/Decrement calculator"
        type="number"
        id="calculatorIncDecPercentage"
        description="The default placeholder value that appears as the percentage in the Increment/Decrement calculator"
      />
      <Row
        name={'Default "result" in the Increment/Decrement calculator'}
        type="number"
        id="calculatorIncDecResult"
        description={'The default placeholder value that appears as the "result" in the Increment/Decrement calculator'}
      />
    </Category>
  );
};

export default popup;
