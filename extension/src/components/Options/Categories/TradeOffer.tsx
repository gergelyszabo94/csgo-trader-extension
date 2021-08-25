import Row, { Option } from 'components/Options/Row';
import { offersSortingModes, sortingModes } from 'utils/static/sortingModes';

import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from '../Category';
import React from 'react';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import SimpleSelect from '../Inputs/SimpleSelect';

const tradeOffer = () => {
    const transformSortingModes = (): Option[] => {
        const transformed: Option[] = [];
        for (const mode of Object.values(sortingModes)) {
            transformed.push({
                key: mode.key,
                text: mode.name,
            });
        }
        return transformed;
    };

    const transformOfferSortingModes = (): Option[] => {
        const transformed: Option[] = [];
        for (const mode of Object.values(offersSortingModes)) {
            transformed.push({
                key: mode.key,
                text: mode.name,
            });
        }
        return transformed;
    };

    return (
        <Category title='Trade Offer'>
            <Row name='Load RealTime prices' description='Adds RealTime prices to items on trade offer pages'>
                <FlipSwitchStorage id='realTimePricesAutoLoadOffer' />;
            </Row>
            <Row
                name='Quick decline offers'
                description='Clicking "decline trade" on the trade offers page declines the trade offer without the confirmation dialog popping up'
            >
                <FlipSwitchStorage id='quickDeclineOffer' />;
            </Row>
            <Row
                name='Open trade window as a tab'
                description='The trade window opens in a neat new tab instead of the annoying separate small window, especially useful when there is no mouse to middle-click (when on laptop or mobile)'
            >
                <FlipSwitchStorage id='openOfferInTab' />;
            </Row>
            <Row
                name='Make icons larger'
                description="Makes your own items' icon larger - making it the same size as the other party's items at the trade offers page. Recommended to have this on, so all additional info fits on them properly."
            >
                <FlipSwitchStorage id='tradeOffersLargerItems' />;
            </Row>
            <Row
                name='Default sorting mode'
                description='Specifies what method the items in an trade offer should be sorted by'
            >
                <SimpleSelect id='offerSortingMode' options={transformSortingModes()} />;
            </Row>
            <Row
                name='Switch to other inventory'
                description={
                    "When on, it makes the other party's inventory the active one by default when trade offers load"
                }
            >
                <FlipSwitchStorage id='switchToOtherInventory' />;
            </Row>
            <Row name='Get float values automatically' description='Loads float values to each item when on'>
                <FlipSwitchStorage id='autoFloatOffer' />;
            </Row>
            <Row
                name='Default offer sorting mode'
                description='Specifies the default trade offer sorting mode on the incoming trade offers page'
            >
                <SimpleSelect id='tradeOffersSortingMode' options={transformOfferSortingModes()} />;
            </Row>
            <Row
                name='Show partner history'
                description={
                    <>
                        Show the number of offers received from a user and how many was sent to them (on the tradeoffers
                        and the individual offer pages)
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='tradeHistoryOffers' />;
            </Row>
            <Row
                name='Mark items in other offers'
                description={
                    <>
                        Shows an indicator on the items if they are in present in other trade offers. Clicking the
                        indicator adds links to the other offers it is present in.
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='itemInOtherOffers' />;
            </Row>
            <Row
                name='Offer header to left'
                description='Moves the trade offer header to the left on wide screens, saving you some scrolling'
            >
                <FlipSwitchStorage id='tradeOfferHeaderToLeft' />;
            </Row>
            <Row
                name='Show exteriors on items'
                description='Adds short exteriors to each item to the top right corner as well as marks them stattrak or souvenir'
            >
                <FlipSwitchStorage id='showShortExteriorsOffers' />;
            </Row>
        </Category>
    );
};

export default tradeOffer;
