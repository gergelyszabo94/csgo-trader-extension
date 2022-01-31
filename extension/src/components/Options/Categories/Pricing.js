import React from 'react';

import { currencies, pricingProviders, realTimePricingModes } from 'utils/static/pricing';
import NewTabLink from 'components/NewTabLink/NewTabLink';
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

  const transformRealTimeModes = () => {
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
        description="When turned on it puts the total price of the stickers applied on a weapon under the exterior indicator in inventories, trade offers and on the incoming trade offers page."
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
        description={(
          <>
            The pricing provider and pricing mode you want to get your prices from.
            Learn more about pricing and price on the
            <NewTabLink to="https://csgotrader.app/prices/"> prices page</NewTabLink>
          </>
        )}
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
      <Row
        name="RealTime pricing mode"
        type="realtimepricingmode"
        id="realTimePricesMode"
        options={transformRealTimeModes()}
        description="The RealTime pricing mode you want the extension to show prices in."
      />
      <Row
        name="RealTime price fetching frequency"
        type="number"
        id="realTimePricesFreqSuccess"
        description="The frequency to fetch RealTime prices at from Steam in milliseconds.
                     The default is 3000, which is 3 seconds, if you set it too low then the requests will start failing often."
      />
      <Row
        name="RealTime price fetching failure delay"
        type="number"
        id="realTimePricesFreqFailure"
        description="The extension will wait this much to start loading RealTime prices again if it fails once.
                     It's in milliseconds, the default value is 15000, which is 15 seconds.
                     If you set it too low then the extension will keep retrying too often and you risk getting a temporary ip ban from Steam."
      />
    </Category>
  );
};

export default pricing;
