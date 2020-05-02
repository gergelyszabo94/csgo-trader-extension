import React from 'react';

import { currencies, pricingProviders } from 'utils/static/pricing';
import Category from '../Category/Category';
import Row from '../Row';

const pricing = () => {
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
    <Category
      title="Pricing"
      subTitle={(
        <>
          <span className="countdown">DISCLAIMER: </span>
          No pricing provider is 100% accurate all the time.
          Take these prices as advisory, always with a pinch of salt.
          You should not rely on them solely when doing your trades.
        </>
      )}
    >
      <Row
        name="Pricing"
        type="flipSwitchStorage"
        id="itemPricing"
        description="Shows item prices in inventories and trade offers"
      />
      <Row
        name="Show sticker worth on items"
        id="showStickerPrice"
        type="flipSwitchStorage"
        description="When turned on it puts the total price of the stickers applied on a weapon under the exterior indicator in inventories, trade offers and no the incoming trade offers page."
      />
      <Row
        name="Currency"
        type="currency"
        id="currency"
        description="The currency you want prices to show in for you"
        options={transformCurrencies()}
      />
      <Row
        name="Provider"
        type="pricingProvider"
        description="The pricing provider and pricing mode you want to get your prices from"
        options={pricingProviders}
      />
      <Row
        name="Refresh Prices"
        type="refresh"
        id="refreshPrices"
        description="Normally prices refresh every 24 hours in the back end and on are also refreshed daily by the client.
                    These two events are not synced so you might have a bit outdated prices.
                    Refreshing the prices makes sure that you have the latest. Refreshing multiple times in a short period of time is pointless."
      />
    </Category>
  );
};

export default pricing;
