import React from 'react';

import { currencies } from 'js/utils/static/pricing';
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
    </Category>
  );
};

export default popup;
