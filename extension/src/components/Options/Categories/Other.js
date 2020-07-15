import React from 'react';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import Category from '../Category/Category';
import Row from '../Row';

const other = () => {
  return (
    <Category title="Other">
      <Row
        name="Lounge auto-bump"
        type="flipSwitchPermission"
        id="loungeBump"
        description={(
          <>
            Automatically bumps your trades every 30-40 minutes on csgolounge.com
            if you have the page
            <NewTabLink to="https://csgolounge.com/mytrades"> https://csgolounge.com/mytrades </NewTabLink>
            open.
            Note: Lounge is broken and it never disables the bump button,
            regardless trades do get bumped.
          </>
        )}
        permission="tabs"
        origins={['*://csgolounge.com/*', '*://old.csgolounge.com/*']}
      />
      <Row
        name="CSGOTraders.net auto-bump"
        type="flipSwitchPermission"
        id="tradersBump"
        description={(
          <>
            Automatically bumps your trades every 30-40 minutes on CSGOTraders.net
            if you have the page
            <NewTabLink to="https://csgotraders.net/mytrades"> https://csgotraders.net/mytrades </NewTabLink>
            open.
            Note: The way it works looks the bump buttons unpressed,
            but it does the bumping as you can see if you refresh the page.
          </>
        )}
        permission="tabs"
        origins={['*://csgotraders.net/*']}
      />
      <Row
        name="CSGOTraders.net auto-login and redirect"
        id="csgotradersAutoLogin"
        type="flipSwitchStorage"
        description="Automatically logs you back into CSGOTRADERS.NET, useful when auto bumping is used since the site logs you out fairly often"
      />
      <Row
        name="Auto OpenID login"
        id="autoOpenIDLogin"
        type="flipSwitchStorage"
        description='Go through the "Login with Steam" dialogs automatically, required for CSGOTRADERS.NET autologin'
      />
      <Row
        name="Hide other extensions"
        id="hideOtherExtensionPrices"
        type="flipSwitchStorage"
        description="Hides elements from other extensions that overlap with CSGO Trader's"
      />
      <Row
        name="Turn off Steam link filter"
        id="linkFilterOff"
        type="flipSwitchStorage"
        description="Turns off Steam's link filter that takes you to a page before you can proceed to external sites."
      />
      <Row
        name="Mark moderation messages as read"
        id="markModerationMessagesAsRead"
        type="flipSwitchStorage"
        description="If you use the report spam comments feature or report comments yourself then you often receive these messages from Steam. If you turn this on you won't."
      />
    </Category>
  );
};

export default other;
