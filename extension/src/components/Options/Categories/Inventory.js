import React from 'react';

import Row from 'components/Options/Row';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import { sortingModes } from 'utils/static/sortingModes';
import Category from '../Category/Category';


const inventory = () => {
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

  return (
    <Category title="Inventory">
      <Row
        name="Default sorting mode"
        id="inventorySortingMode"
        type="select"
        description="Specifies what method the items in an inventory should be sorted by"
        options={transformSortingModes()}
      />
      <Row
        name="Get float values automatically"
        id="autoFloatInventory"
        type="flipSwitchStorage"
        description="Loads float values to each item when on"
      />
      <Row
        name="Show partner history"
        id="tradeHistoryInventory"
        type="flipSwitchStorage"
        description={(
          <>
            Show the number of offers received from a user and how many was sent to them
            <ApiKeyIndicator />
          </>
         )}
      />
      <Row
        name="Mark items in offer"
        id="itemInOffersInventory"
        type="flipSwitchStorage"
        description={(
          <>
            Shows an indicator on the items if they are in trade offers.
            Making an item the active item in the inventory
            adds links to the offers it is present in.
            <ApiKeyIndicator />
          </>
        )}
      />
    </Category>
  );
};

export default inventory;
