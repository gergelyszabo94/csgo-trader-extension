import React from 'react';

import { listingsSortingModes } from 'utils/static/sortingModes';

import Category from '../Category';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import Number from '../Inputs/Number';
import SimpleSelect from '../Inputs/SimpleSelect';

import Row, { Option } from 'components/Options/Row';

const market = () => {
    const transformSortingModes = (): Option[] => {
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
        <Category title='Market'>
            <Row
                name='Listings per page'
                description='The number of market listings you want to see when you load the market page of an item'
            >
                <SimpleSelect
                    id='numberOfListings'
                    options={[
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
                    ]}
                />
            </Row>
            <Row
                name='Get float values automatically'
                description='Loads float values to each item when on. It does not load float values if the csgofloat extension is present to avoid interference.'
            >
                <FlipSwitchStorage id='autoFloatMarket' />
            </Row>
            <Row
                name='Always expand float technical data'
                description='Always expands the float technical area on the float bar, making it easier to find exactly what you are looking for'
            >
                <FlipSwitchStorage id='marketAlwaysShowFloatTechnical' />
            </Row>
            <Row
                name='Show float values only'
                description="Don't show the float bar and technical details, only a simple float value on listings"
            >
                <FlipSwitchStorage id='marketShowFloatValuesOnly' />
            </Row>
            <Row
                name='Market listings default order'
                description='The order you want market listings to appear. Note: Floats will only be ordered once all values are loaded.'
            >
                <SimpleSelect id='marketListingsDefaultSorting' options={transformSortingModes()} />
            </Row>
            <Row
                name='Original price'
                description="Show the price of listings in the seller's currency too as well as what they will receive after fees."
            >
                <FlipSwitchStorage id='marketOriginalPrice' />
            </Row>
            <Row
                name='Reload listings on error'
                description="Reloads listings pages 5 seconds after they load if they don't load properly (load with an error message instead of the listings)."
            >
                <FlipSwitchStorage id='reloadListingOnError' />
            </Row>
            <Row
                name='Show Real money/other market links on listings'
                description='Puts links to the Real Money marketplaces to market listings pages'
            >
                <FlipSwitchStorage id='showRealMoneySiteLinks' />
            </Row>
            <Row
                name='Show instant buy button on market listings'
                description='Adds an instant buy button to each listing that allows you to skip the purchase dialog'
            >
                <FlipSwitchStorage id='marketListingsInstantBuy' />
            </Row>
            <Row
                name='Market history events to show'
                description='The number of market history events you want to see when you open your market history'
            >
                <SimpleSelect
                    id='marketHistoryEventsToShow'
                    options={[
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
                    ]}
                />
            </Row>
            <Row
                name='Highlight seen listings'
                description='Highlights listings that you have already seen. Eliminates unnecessary work when looking for something.'
            >
                <FlipSwitchStorage id='highlightSeenListings' />
            </Row>
            <Row
                name='Show "Buy and Sell Orders (cumulative)'
                description='Show "Buy and Sell Orders (cumulative)" chart for non-commodity items'
            >
                <FlipSwitchStorage id='marketShowBuySellNonCommodity' />
            </Row>
            <Row name='Recent activity on non-commmodity' description='Show Recent activity on non-commodity items'>
                <FlipSwitchStorage id='marketShowRecentActivityNonCommodity' />
            </Row>
            <Row
                name='Market outbid percentage'
                description='Set how much you want to outbid market orders by on the market pain page.'
            >
                <Number id='outBidPercentage' />
            </Row>
        </Category>
    );
};

export default market;
