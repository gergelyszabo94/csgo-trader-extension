import React from 'react';

import FlipSwitchPermission from '../Inputs/FlipSwitchPermission';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import ModalTextBox from '../Inputs/ModalTextBox';

import NewTabLink from 'components/NewTabLink';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from 'components/Options/Category';
import Row from 'components/Options/Row';

const general = () => {
    return (
        <Category title='General'>
            <Row
                name='Auto-set Steam API key'
                description={
                    <>
                        Automatically generates and adds the Steam API key to the extension when visiting&nbsp;
                        <NewTabLink to='https://steamcommunity.com/dev/apikey'>
                            steamcommunity.com/dev/apikey
                        </NewTabLink>
                    </>
                }
            >
                <FlipSwitchStorage id='autoSetSteamAPIKey' />
            </Row>
            <Row
                name='Steam API key'
                description={
                    <>
                        Allows the extension to make API requests to the&nbsp;
                        <NewTabLink to='https://developer.valvesoftware.com/wiki/Steam_Web_API'>
                            Steam Web API
                        </NewTabLink>
                        , functions that need an API key will be tagged with this icon
                        <ApiKeyIndicator />
                        <br />
                        You can get an API key by filling out&nbsp;
                        <NewTabLink to='https://steamcommunity.com/dev/apikey'>this form</NewTabLink>
                        &nbsp;(you can put anything in as domain name).
                        <br />
                        <NewTabLink to='https://csgotrader.app/faq/#steamapikey'>
                            Why does it need Steam API key? Explained in more detail.
                        </NewTabLink>
                    </>
                }
            >
                <ModalTextBox id='steamAPIKey' modalTitle='Enter your Steam API key here' />
            </Row>
            <Row
                name='Tabs API access'
                description={
                    <>
                        Grants the extension access to the&nbsp;
                        <NewTabLink to='https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API'>
                            browser.tabs API
                        </NewTabLink>
                        . It - for example - allows the extension to open a tab and put it in focus, allows
                        notifications to be clickable, opens the bookmarks page when an item is bookmarked, etc. I am
                        using it in this mode so it&apos;s also less likely to be buggy as well.
                    </>
                }
            >
                <FlipSwitchPermission id='tabsAPI' permission='tabs' />
            </Row>
            <Row
                name='Colorful items'
                description='Makes inventories and offers pretty by changing the background color of items based on rarity or in case of doppler, phase'
            >
                <FlipSwitchStorage id='colorfulItems' />
            </Row>
            <Row
                name='Useful titles'
                description='Changes inventory, profile, offer, market page titles to more apparent and readable ones'
            >
                <FlipSwitchStorage id='usefulTitles' />
            </Row>
            <Row
                name='Collect usage data'
                description={
                    <>
                        Sends anonymous usage data to the developers to help discover problems and better understand how
                        the extension is used. Check the
                        <NewTabLink to='https://csgotrader.app/privacy'> Privacy </NewTabLink>
                        page for more information on how your data in handled.
                    </>
                }
            >
                <FlipSwitchStorage id='telemetryOn' />
            </Row>
        </Category>
    );
};

export default general;
