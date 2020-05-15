import React from 'react';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from 'components/Options/Category/Category';
import Row from 'components/Options/Row';

const general = () => {
  return (
    <Category title="General">
      <Row
        name="Auto-set Steam API key"
        id="autoSetSteamAPIKey"
        type="flipSwitchStorage"
        description={(
          <>
            Automatically generates and adds the Steam API key to the extension
            when visiting&nbsp;
            <NewTabLink to="https://steamcommunity.com/dev/apikey">
              steamcommunity.com/dev/apikey
            </NewTabLink>
          </>
        )}
      />
      <Row
        name="Steam API key"
        id="steamAPIKey"
        type="modalTextBox"
        description={(
          <>
            Allows the extension to make API requests to the&nbsp;
            <NewTabLink to="https://developer.valvesoftware.com/wiki/Steam_Web_API">
              Steam Web API
            </NewTabLink>
            , functions that need an API key will be tagged with this icon
            <ApiKeyIndicator />
            <br />
            You can get an API key by filling out&nbsp;
            <NewTabLink to="https://steamcommunity.com/dev/apikey">
              this form
            </NewTabLink>
            &nbsp;(you can put anything in as domain name).
            <br />
            <NewTabLink to="https://csgotrader.app/faq/#steamapikey">
              Why does it need Steam API key explained in more detail.
            </NewTabLink>
          </>
        )}
        modalTitle="Enter your Steam API key here"
      />
      <Row
        name="Tabs API access"
        id="tabsAPI"
        type="flipSwitchPermission"
        description={(
          <>
            Grants the extension access to the&nbsp;
            <NewTabLink to="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API">
              browser.tabs API
            </NewTabLink>
            . It - for example - allows the extension to open a tab and put it
            in focus, allows notifications to be clickable, opens the bookmarks
            page when an item is bookmarked, etc. I am using it in this mode so
            it&apos;s also less likely to be buggy as well.
          </>
        )}
        permission="tabs"
      />
      <Row
        name="Flag scam comments"
        id="flagScamComments"
        type="flipSwitchStorage"
        description='Reports obvious scam and spam comments like "I will give my knife for all of your csgo graffitties" and others. Helps to keep steamcommunity cleaner and safer.'
      />
      <Row
        name="Your strings to report"
        id="customCommentsToReport"
        type="modalCustomComments"
        description="Make the extension report comments that includes one of the the strings you add here. These are additional to the built-in ones."
        modalTitle="Add or remove your strings to report"
      />
      <Row
        name="Colorful items"
        id="colorfulItems"
        type="flipSwitchStorage"
        description="Makes inventories and offers pretty by changing the background color of items based on rarity or in case of doppler, phase"
      />
      <Row
        name="Useful titles"
        id="usefulTitles"
        type="flipSwitchStorage"
        description="Changes inventory, profile, offer, market page titles to more apparent and readable ones"
      />
      <Row
        name="Collect usage data"
        id="telemetryOn"
        type="flipSwitchStorage"
        description={(
          <>
            Sends anonymous usage data to the developers to help discover
            problems and better understand how the extension is used. Check the
            <NewTabLink to="https://csgotrader.app/privacy"> Privacy </NewTabLink>
            page for more information on how your data in handled.
          </>
        )}
      />
    </Category>
  );
};

export default general;
