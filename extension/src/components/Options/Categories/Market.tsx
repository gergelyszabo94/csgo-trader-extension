import React from 'react';

import Row from 'components/Options/Row';
import { listingsSortingModes } from 'utils/static/sortingModes';
import Category from '../Category/Category';

const market = () => {
  const transformSortingModes = () => {
    const transformed = [];
    for (const mode of Object.values(listingsSortingModes)) {
      transformed.push({
        key: mode.key,
        text: mode.name,
      });
    }
    return transformed;
  };

  return (
    <Category title="Market">
      <Row
        name="Listings per page"
        id="numberOfListings"
        type="select"
        description="The number of market listings you want to see when you load the market page of an item"
        options={
                    [
                      {
                        key: 10,
                        text: 10,
                      },
                      {
                        key: 20,
                        text: 20,
                      },
                      {
                        key: 50,
                        text: 50,
                      },
                      {
                        key: 100,
                        text: 100,
                      },
                    ]
                }
      />
      <Row
        name="Get float values automatically"
        id="autoFloatMarket"
        type="flipSwitchStorage"
        description="Loads float values to each item when on. It does not load float values if the csgofloat extension is present to avoid interference."
      />
      <Row
        name="Always expand float technical data"
        id="marketAlwaysShowFloatTechnical"
        type="flipSwitchStorage"
        description="Always expands the float technical area on the float bar, making it easier to find exactly what you are looking for"
      />
      <Row
        name="Show float values only"
        id="marketShowFloatValuesOnly"
        type="flipSwitchStorage"
        description="Don't show the float bar and technical details, only a simple float value on listings"
      />
      <Row
        name="Market listings default order"
        id="marketListingsDefaultSorting"
        type="select"
        description="The order you want market listings to appear. Note: Floats will only be ordered once all values are loaded."
        options={transformSortingModes()}
      />
      <Row
        name="Original price"
        id="marketOriginalPrice"
        type="flipSwitchStorage"
        description={'Show the price of listings in the seller\'s currency too as well as what they will receive after fees.'}
      />
      <Row
        name="Reload listings on error"
        id="reloadListingOnError"
        type="flipSwitchStorage"
        description="Reloads listings pages 5 seconds after they load if they don't load properly (load with an error message instead of the listings)."
      />
      <Row
        name="Show Real money/other market links on listings"
        id="showRealMoneySiteLinks"
        type="flipSwitchStorage"
        description="Puts links to the Real Money marketplaces to market listings pages"
      />
      <Row
        name="Show instant buy button on market listings"
        id="marketListingsInstantBuy"
        type="flipSwitchStorage"
        description="Adds an instant buy button to each listing that allows you to skip the purchase dialog"
      />
      <Row
        name="Market history events to show"
        id="marketHistoryEventsToShow"
        type="select"
        description="The number of market history events you want to see when you open your market history"
        options={
          [
            {
              key: 10,
              text: 10,
            },
            {
              key: 20,
              text: 20,
            },
            {
              key: 50,
              text: 50,
            },
          ]
        }
      />
      <Row
        name="Highlight seen listings"
        id="highlightSeenListings"
        type="flipSwitchStorage"
        description="Highlights listings that you have already seen. Eliminates unnecessary work when looking for something."
      />
      <Row
        name={'Show "Buy and Sell Orders (cumulative)"'}
        id="marketShowBuySellNonCommodity"
        type="flipSwitchStorage"
        description={'Show "Buy and Sell Orders (cumulative)" chart for non-commodity items'}
      />
      <Row
        name="Recent activity on non-commmodity"
        id="marketShowRecentActivityNonCommodity"
        type="flipSwitchStorage"
        description="Show Recent activity on non-commodity items"
      />
      <Row
        name="Market outbid percentage"
        id="outBidPercentage"
        type="number"
        description="Set how much you want to outbid market orders by on the market pain page."
      />
    </Category>
  );
};

export default market;
