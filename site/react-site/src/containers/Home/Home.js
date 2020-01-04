import React, {Fragment} from 'react';
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head'
import NewTabLink from '../../components/NewTabLink/NewTabLink'

const featureList = [
    'Pricing info in inventories and trade offers',
    'Total inventory value, trade offer value',
    'Show profit for incoming trade offers, order by most profitable first',
    '"Inspect in Browser..." button on market, inventories and trade offers',
    'Item mass listing/selling',
    'Shows when an item\'s trade lock will expire and adds a countdown',
    'Shows floats and other technical info like paint index, paint seed, pattern index in inventories, offers and on the market',
    'Order by float value on market pages, show more than the default 10 listings on the market',
    'Doppler phases, fade percentages, marble fade patterns (fire and ice, blue tip, red tip, etc.)',
    'Shows exterior on each item and adds links to other version to inventory and market pages',
    'NSFW filter mode to avoid showing anime boobs to your colleagues',
    'Bookmark an item and get a notification when it is ready to trade',
    'Real chat status on profiles (away, busy, snooze instead of just online)',
    'Colorful inventories, changes each items\' background based on its rarity',
    'Scammers are market on their profile and in trade offers (if they are SteamRep banned)',
    'CSGOLounge.com auto-bumping, make your trades more popular by keeping them on top',
    'CSGOTraders.net auto-bumping, make your trades more popular by keeping them on top',
    'Add or remove similar items from a trade, add whole page, add all similar items',
    'Pricing providers: CSGO Trader, CSGOBACKPACK, CS.MONEY, Bitskins, LOOT.FARM, CSGO.TM',
    'See the original currency and price an item was listed on the market',
    '"Starting at" price info and sales volume info in everyone]\'s inventory',
    'Instant accept trade offer and decline trade offer buttons on the incoming trade offers page',
    'Float rank (like 5th best in existence) data from csgofloat',
    'Currency converter, percentage calculator in the extension popup.',
    'Report known spam and scam comments automatically (like fake giveaway comments on profiles)',
    'Reply to comments by tagging the other user\'s name',
    'Generate a list of inventory items (to post advertisements, etc.)',
    '+rep button on profiles to post your reputation message after trade',
    'Check the value of multiple items in an inventory by selecting them',
    'Sort inventories and trade offers by price, tradability, name or position',
    'Set default sorting mode for inventories and trade offers',
    'All inventory items are loaded automatically, no need to wait for loading when searching or switching pages',
    'Sticker wear (condition percentage) in inventories and on the market',
    'Copy a user\'s permanent profile link (scammers often change their links automatically)',
    'Duplicate items count in inventories',
    'Other small features, automations, conveniences',
];

const home = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <Fragment>
            <Head
                description='CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading.'
                title='CSGO Trader - Steam Trading Enhancer Extension'
                path={window.location.pathname}
            />
            <h1>About CSGO Trader Extension</h1>
            <Container className='buildingBlock m-auto'>
                <p>
                    CSGO Trader is an <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension'>open source </NewTabLink>
                    browser extension for Chrome and Firefox that is designed to help with CS:GO trading.
                    I started by adding functionality that Steam Inventory Helper lacked, but it already has SIH's most important features and much more.
                </p>
                <h2>An incomplete list of current features:</h2>
                <ul>
                    {
                        featureList.map(feature => {
                            return <li>{feature}</li>
                        })
                    }
                </ul>
            </Container>
        </Fragment>
    );
};

export default home;