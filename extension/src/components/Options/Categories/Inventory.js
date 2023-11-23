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
        name="Load RealTime prices"
        id="realTimePricesAutoLoadInventory"
        type="flipSwitchStorage"
        description="When on, the extension adds RealTime prices to items automatically"
      />
      <Row
        name="Get float values automatically"
        id="autoFloatInventory"
        type="flipSwitchStorage"
        description="Loads float values to each item when on."
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
      <Row
        name="Show Instant and Quick sell buttons"
        id="inventoryInstantQuickButtons"
        type="flipSwitchStorage"
        description="Adds Instant Sell and Quick Sell buttons by the normal Sell button for the active inventory item"
      />
      <Row
        name="Safe Instant and Quick sell"
        id="safeInstantQuickSell"
        type="flipSwitchStorage"
        description="Instant and Quick sell actions require another layer of confirmation via a popup (to prevent misclicks)"
      />
      <Row
        name="Show duplicate count"
        id="inventoryShowDuplicateCount"
        type="flipSwitchStorage"
        description="Shows the number of duplicates on the selected item (same market name)"
      />
      <Row
        name="Show Selected items table"
        id="showSelectedItemsTable"
        type="flipSwitchStorage"
        description="Shows the selected items table in other people's inventory"
      />
      <Row
        name="Show copy item id/name/link buttons on active items"
        id="inventoryShowCopyButtons"
        type="flipSwitchStorage"
        description="Show copy item id/name/link buttons on active items in inventories."
      />
      <Row
        name="Show pricempire.com links in inventories"
        id="showPriceEmpireLinkInInventory"
        type="flipSwitchStorage"
        description="Show pricempire.com links in inventories"
      />
      <Row
        name="Show lookup on buff link"
        id="showBuffLookupInInventory"
        type="flipSwitchStorage"
        description="Show lookup on buff link in inventories"
      />
      <Row
        name="Show lookup on Float DB link"
        id="showFloatDBLookupInInventory"
        type="flipSwitchStorage"
        description="Show lookup on FloatDB link in inventories"
      />
      <Row
        name="Show View on CS2 STASH link"
        id="showCSGOSTASHLinkInInventory"
        type="flipSwitchStorage"
        description="Show View on CS2 STASH link in inventories"
      />
      <Row
        name="Show exteriors on items"
        id="showShortExteriorsInventory"
        type="flipSwitchStorage"
        description="Adds short exteriors to each item to the top right corner as well as marks them stattrak or souvenir"
      />
      <Row
        name="Show trade lock indicators on items"
        id="showTradeLockIndicatorInInventories"
        type="flipSwitchStorage"
        description="Adds small indicators to the top left of inventory items that either show the remaining trade cooldown."
      />
      <Row
        name="Move with arrow keys"
        id="moveWithArrowKeysInventory"
        type="flipSwitchStorage"
        description="Move the currently selected item with the arrow keys, or with CTRL + arrow keys to move the page instead"
      />
      <Row
        name="Show all exteriors"
        id="showAllExteriorsInventory"
        type="flipSwitchStorage"
        description="Show links to all exteriors on the selected item"
      />
    </Category>
  );
};

export default inventory;
