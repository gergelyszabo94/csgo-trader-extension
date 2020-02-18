import React, { Fragment } from "react";

import Category from '../Category/Category';
import Row from '../Row';
import NewTabLink from 'components/NewTabLink/NewTabLink';

const other = () => {
    return (
        <Category title='Other'>
            <Row
                name='Lounge auto-bump'
                type='flipSwitchPermission'
                id='loungeBump'
                description={
                    <Fragment>
                        Automatically bumps your trades every 30-40 minutes on csgolounge.com if you have the page
                        <NewTabLink to='https://csgolounge.com/mytrades'> "https://csgolounge.com/mytrades" </NewTabLink> open.
                        Note: Lounge is broken and it never disables the bump button, regardless trades do get bumped.
                    </Fragment>
                }
                permission='tabs'
                origins={['*://csgolounge.com/*', '*://old.csgolounge.com/*']}
            />
            <Row
                name='CSGOTraders.net auto-bump'
                type='flipSwitchPermission'
                id='tradersBump'
                description={
                    <Fragment>
                        Automatically bumps your trades every 30-40 minutes on CSGOTraders.net if you have the page
                        <NewTabLink to='https://csgotraders.net/mytrades'> "https://csgotraders.net/mytrades" </NewTabLink> open.
                        Note: The way it works looks the bump buttons unpressed, but it does the bumping as you can see if you refresh the page.
                    </Fragment>
                }
                permission='tabs'
                origins={['*://csgotraders.net/*']}
            />
            <Row
                name='CSGOTraders.net auto-login and redirect'
                id='csgotradersAutoLogin'
                type='flipSwitchStorage'
                description='Automatically logs you back into CSGOTRADERS.NET, useful when auto bumping is used since the site logs you out fairly often'
            />
            <Row
                name='Auto OpenID login'
                id='autoOpenIDLogin'
                type='flipSwitchStorage'
                description='Go through the "Login with Steam" dialogs automatically, required for CSGOTRADERS.NET autologin'
            />
        </Category>
    );
};

export default other;
