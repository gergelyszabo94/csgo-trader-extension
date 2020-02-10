import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons'

import NewTabLink from 'components/NewTabLink/NewTabLink';

const generalSchema = {
    title: 'General',
    options: [
        {
            name: 'Auto-set Steam API key',
            storageKey: 'autoSetSteamAPIKey',
            inputType: 'flipSwitch',
            description:
                <Fragment>
                     Automatically generates and adds the Steam API key to the extension when visiting <NewTabLink to='https://steamcommunity.com/dev/apikey'>steamcommunity.com/dev/apikey</NewTabLink>
                </Fragment>
        },
        {
            name: 'Steam API key',
            storageKey: 'steamAPIKey',
            inputType: 'modalTextBox',
            description:
                <Fragment>
                    Allows the extension to make API requests to the <NewTabLink to='https://developer.valvesoftware.com/wiki/Steam_Web_API'>Steam Web API</NewTabLink>,
                    functions that need an API key will be tagged with this icon: <FontAwesomeIcon icon={faCode} className='apiIcon'/> <br/>
                    You can get an API key by filling out
                    <NewTabLink to='https://steamcommunity.com/dev/apikey'> this form</NewTabLink> (you can put anything in as domain name).
                </Fragment>
        },
        {
            name: 'Tabs API access',
            storageKey: 'tabsAPI',
            inputType: 'flipSwitchSpecial',
            description:
                <Fragment>
                    Grants the extension access to the
                    <NewTabLink to='https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API'> browser.tabs API</NewTabLink>.
                    It - for example - allows the extension to open a tab and put it in focus, allows notifications to be clickable, opens the bookmarks page when an item is bookmarked, etc.
                    I am using it in this mode so it's also less likely to be buggy as well.
                </Fragment>
        },
        {
            name: 'Flag scam comments',
            storageKey: 'flagScamComments',
            inputType: 'flipSwitch',
            description: 'Reports obvious scam and spam comments like "I will give my knife for all of your csgo graffitties" and others. Helps to keep steamcommunity cleaner and safer.'
        },
        {
             name: 'Your strings to report',
             storageKey: 'customCommentsToReport',
             inputType: 'modalTextBox',
             description: 'Make the extension report comments that includes one of the the strings you add here. These are additional to the built-in ones.'
        },
        {
             name: 'Colorful items',
             storageKey: 'colorfulItems',
             inputType: 'flipSwitch',
             description: 'Makes inventories and offers pretty by changing the background color of items based on rarity or in case of doppler, phase'
        },
        {
             name: 'Collect usage data',
             storageKey: 'telemetryOn',
             inputType: 'flipSwitch',
             description:
                <Fragment>
                    Sends anonymous usage data to the developers to help discover problems and better understand how the extension is used. Check the
                    <NewTabLink to='https://csgotrader.app/privacy'> Privacy </NewTabLink> page for more information on how your data in handled.
                </Fragment>
        },
        {
             name: 'Hide other extensions',
             storageKey: 'hideOtherExtensionPrices',
             inputType: 'flipSwitch',
             description: 'Hides elements from other extensions that overlap with CSGO Trader\'s'
        },
        {
             name: 'Show sticker worth on items',
             storageKey: 'showStickerPrice',
             inputType: 'flipSwitch',
             description: 'When turned on it puts the total price of the stickers applied on a weapon under the exterior indicator in inventories, trade offers and no the incoming trade offers page.'
        }]
    }

export default generalSchema;