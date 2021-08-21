import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from '../Category';
import React from 'react';
import Row from 'components/Options/Row';
import { sortingModes } from 'utils/static/sortingModes';

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
        <Category title='Inventory'>
            <Row
                name='Default sorting mode'
                id='inventorySortingMode'
                type='select'
                description='Specifies what method the items in an inventory should be sorted by'
                options={transformSortingModes()}
            />
            <Row
                name='Load RealTime prices'
                id='realTimePricesAutoLoadInventory'
                type='flipSwitchStorage'
                description='When on, the extension adds RealTime prices to items automatically'
            />
            <Row
                name='Get float values automatically'
                id='autoFloatInventory'
                type='flipSwitchStorage'
                description='Loads float values to each item when on. It does not load float values if the csgofloat extension is present to avoid interference.'
            />
            <Row
                name='Show partner history'
                id='tradeHistoryInventory'
                type='flipSwitchStorage'
                description={
                    <>
                        Show the number of offers received from a user and how many was sent to them
                        <ApiKeyIndicator />
                    </>
                }
            />
            <Row
                name='Mark items in offer'
                id='itemInOffersInventory'
                type='flipSwitchStorage'
                description={
                    <>
                        Shows an indicator on the items if they are in trade offers. Making an item
                        the active item in the inventory adds links to the offers it is present in.
                        <ApiKeyIndicator />
                    </>
                }
            />
            <Row
                name='Notify me about new items'
                id='notifyAboutNewItems'
                type='flipSwitchStorage'
                description='Send me a browser notification when I receive new inventory items'
            />
            <Row
                name='Show Instant and Quick sell buttons'
                id='inventoryInstantQuickButtons'
                type='flipSwitchStorage'
                description='Adds Instant Sell and Quick Sell buttons by the normal Sell button for the active inventory item'
            />
            <Row
                name='Show Selected items table'
                id='showSelectedItemsTable'
                type='flipSwitchStorage'
                description="Shows the selected items table in other people's inventory"
            />
            <Row
                name='Show copy item id/name/link buttons on active items'
                id='inventoryShowCopyButtons'
                type='flipSwitchStorage'
                description='Show copy item id/name/link buttons on active items in inventories.'
            />
            <Row
                name='Show pricempire.com links in inventories'
                id='showPriceEmpireLinkInInventory'
                type='flipSwitchStorage'
                description='Show pricempire.com links in inventories'
            />
            <Row
                name='Show lookup on buff link'
                id='showBuffLookupInInventory'
                type='flipSwitchStorage'
                description='Show lookup on buff link in inventories'
            />
            <Row
                name='Use alternative CS:GO inventory endpoint'
                id='useAlternativeCSGOInventoryEndpoint'
                type='flipSwitchStorage'
                description="CS:GO inventories often don't load at all, when this setting is on the extension forces Steam to load the inventory from a more reliable endpoint."
            />
            <Row
                name='Show exteriors on items'
                id='showShortExteriorsInventory'
                type='flipSwitchStorage'
                description='Adds short exteriors to each item to the top right corner as well as marks them stattrak or souvenir'
            />
        </Category>
    );
};

export default inventory;
