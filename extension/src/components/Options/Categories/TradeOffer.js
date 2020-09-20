import React from 'react';
import Row from 'components/Options/Row';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';

import { sortingModes, offersSortingModes } from 'utils/static/sortingModes';

import Category from '../Category/Category';

const tradeOffer = () => {
  const transformSortingModes = () => {
    const transformed = [];
    for (const mode of Object.values(sortingModes)) {
      transformed.push({
        key: mode.key,
        text: mode.name,
      });
    }
    return transformed;
  };

  const transformOfferSortingModes = () => {
    const transformed = [];
    for (const mode of Object.values(offersSortingModes)) {
      transformed.push({
        key: mode.key,
        text: mode.name,
      });
    }
    return transformed;
  };

  return (
    <Category title="Trade Offer">
      <Row
        name="Load RealTime prices"
        id="realTimePricesAutoLoadOffer"
        type="flipSwitchStorage"
        description="Adds RealTime prices to items on trade offer pages"
      />
      <Row
        name="Quick decline offers"
        id="quickDeclineOffer"
        type="flipSwitchStorage"
        description='Clicking "decline trade" on the trade offers page declines the trade offer without the confirmation dialog popping up'
      />
      <Row
        name="Open trade window as a tab"
        id="openOfferInTab"
        type="flipSwitchStorage"
        description="The trade window opens in a neat new tab instead of the annoying separate small window, especially useful when there is no mouse to middle-click (when on laptop or mobile)"
      />
      <Row
        name="Make icons larger"
        id="tradeOffersLargerItems"
        type="flipSwitchStorage"
        description="Makes your own items' icon larger - making it the same size as the other party's items at the trade offers page. Recommended to have this on, so all additional info fits on them properly."
      />
      <Row
        name="Default sorting mode"
        id="offerSortingMode"
        type="select"
        description="Specifies what method the items in an trade offer should be sorted by"
        options={transformSortingModes()}
      />
      <Row
        name="Switch to other inventory"
        id="switchToOtherInventory"
        type="flipSwitchStorage"
        description={'When on, it makes the other party\'s inventory the active one by default when trade offers load'}
      />
      <Row
        name="Get float values automatically"
        id="autoFloatOffer"
        type="flipSwitchStorage"
        description="Loads float values to each item when on"
      />
      <Row
        name="Default offer sorting mode"
        id="tradeOffersSortingMode"
        type="select"
        description="Specifies the default trade offer sorting mode on the incoming trade offers page"
        options={transformOfferSortingModes()}
      />
      <Row
        name="Show partner history"
        id="tradeHistoryOffers"
        type="flipSwitchStorage"
        description={(
          <>
            Show the number of offers received from a user and how many was
            sent to them (on the tradeoffers and the individual offer pages)
            <ApiKeyIndicator />
          </>
        )}
      />
      <Row
        name="Mark items in other offers"
        id="itemInOtherOffers"
        type="flipSwitchStorage"
        description={(
          <>
            Shows an indicator on the items if they are in present in other trade offers.
            Clicking the indicator adds links to the other offers it is present in.
            <ApiKeyIndicator />
          </>
        )}
      />
      <Row
        name="Offer header to left"
        id="tradeOfferHeaderToLeft"
        type="flipSwitchStorage"
        description="Moves the trade offer header to the left on wide screens, saving you some scrolling"
      />
    </Category>
  );
};

export default tradeOffer;
