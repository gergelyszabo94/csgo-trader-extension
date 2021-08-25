import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from '../Category';
import React from 'react';
import Row, { Option } from 'components/Options/Row';
import { sortingModes } from 'utils/static/sortingModes';
import SimpleSelect from '../Inputs/SimpleSelect';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';

const inventory = () => {
    const transformSortingModes = (): Option[] => {
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
                description='Specifies what method the items in an inventory should be sorted by'
            >
                <SimpleSelect id='inventorySortingMode' options={transformSortingModes()} />
            </Row>
            <Row
                name='Load RealTime prices'
                description='When on, the extension adds RealTime prices to items automatically'
            >
                <FlipSwitchStorage id='realTimePricesAutoLoadInventory' />
            </Row>
            <Row
                name='Get float values automatically'
                description='Loads float values to each item when on. It does not load float values if the csgofloat extension is present to avoid interference.'
            >
                <FlipSwitchStorage id='autoFloatInventory' />
            </Row>
            <Row
                name='Show partner history'
                description={
                    <>
                        Show the number of offers received from a user and how many was sent to them
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='tradeHistoryInventory' />
            </Row>
            <Row
                name='Mark items in offer'
                description={
                    <>
                        Shows an indicator on the items if they are in trade offers. Making an item the active item in
                        the inventory adds links to the offers it is present in.
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='tradeHistoryInventory' />
            </Row>
            <Row
                name='Notify me about new items'
                description='Send me a browser notification when I receive new inventory items'
            >
                <FlipSwitchStorage id='notifyAboutNewItems' />
            </Row>
            <Row
                name='Show Instant and Quick sell buttons'
                description='Adds Instant Sell and Quick Sell buttons by the normal Sell button for the active inventory item'
            >
                <FlipSwitchStorage id='inventoryInstantQuickButtons' />
            </Row>
            <Row
                name='Show Selected items table'
                description="Shows the selected items table in other people's inventory"
            >
                <FlipSwitchStorage id='showSelectedItemsTable' />
            </Row>
            <Row
                name='Show copy item id/name/link buttons on active items'
                description='Show copy item id/name/link buttons on active items in inventories.'
            >
                <FlipSwitchStorage id='inventoryShowCopyButtons' />
            </Row>
            <Row name='Show pricempire.com links in inventories' description='Show pricempire.com links in inventories'>
                <FlipSwitchStorage id='showPriceEmpireLinkInInventory' />
            </Row>
            <Row name='Show lookup on buff link' description='Show lookup on buff link in inventories'>
                <FlipSwitchStorage id='showBuffLookupInInventory' />
            </Row>
            <Row
                name='Use alternative CS:GO inventory endpoint'
                description="CS:GO inventories often don't load at all, when this setting is on the extension forces Steam to load the inventory from a more reliable endpoint."
            >
                <FlipSwitchStorage id='useAlternativeCSGOInventoryEndpoint' />
            </Row>
            <Row
                name='Show exteriors on items'
                description='Adds short exteriors to each item to the top right corner as well as marks them stattrak or souvenir'
            >
                <FlipSwitchStorage id='showShortExteriorsInventory' />
            </Row>
        </Category>
    );
};

export default inventory;
