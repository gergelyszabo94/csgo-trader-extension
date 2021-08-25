import Category from '../Category';
import NewTabLink from 'components/NewTabLink';
import React from 'react';
import Row from '../Row';
import FlipSwitchPermission from '../Inputs/FlipSwitchPermission';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';

const other = () => {
    return (
        <Category title='Other'>
            <Row
                name='Lounge auto-bump'
                description={
                    <>
                        Automatically bumps your trades every 30-40 minutes on csgolounge.com if you have the page
                        <NewTabLink to='https://csgolounge.com/mytrades'> https://csgolounge.com/mytrades </NewTabLink>
                        open. Note: Lounge is broken and it never disables the bump button, regardless trades do get
                        bumped.
                    </>
                }
            >
                <FlipSwitchPermission
                    id='loungeBump'
                    permission='tabs'
                    origins={['*://csgolounge.com/*', '*://old.csgolounge.com/*']}
                />
                ;
            </Row>
            <Row
                name='CSGOTraders.net auto-bump'
                description={
                    <>
                        Automatically bumps your trades every 30-40 minutes on CSGOTraders.net if you have the page
                        <NewTabLink to='https://csgotraders.net/mytrades'>https://csgotraders.net/mytrades</NewTabLink>
                        open. Note: The way it works looks the bump buttons unpressed, but it does the bumping as you
                        can see if you refresh the page.
                    </>
                }
            >
                <FlipSwitchPermission id='tradersBump' permission='tabs' origins={['*://csgotraders.net/*']} />
            </Row>
            <Row
                name='CSGOTraders.net auto-login and redirect'
                description='Automatically logs you back into CSGOTRADERS.NET, useful when auto bumping is used since the site logs you out fairly often'
            >
                <FlipSwitchStorage id='csgotradersAutoLogin' />;
            </Row>
            <Row
                name='Auto OpenID login'
                description='Go through the "Login with Steam" dialogs automatically, required for CSGOTRADERS.NET autologin'
            >
                <FlipSwitchStorage id='autoOpenIDLogin' />;
            </Row>
            <Row
                name='Hide other extensions'
                description="Hides elements from other extensions that overlap with CSGO Trader's"
            >
                <FlipSwitchStorage id='hideOtherExtensionPrices' />;
            </Row>
        </Category>
    );
};

export default other;
