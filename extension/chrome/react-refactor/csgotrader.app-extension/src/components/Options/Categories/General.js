import React, { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

import NewTabLink from "components/NewTabLink/NewTabLink";

import Category from "components/Options/Category/Category";
import Row from "components/Options/Row";

const general = () => {
  return (
    <Category title="General">
      <Row
        name="Auto-set Steam API key"
        id="autoSetSteamAPIKey"
        type="flipSwitchStorage"
        description={
          <Fragment>
            Automatically generates and adds the Steam API key to the extension
            when visiting{" "}
            <NewTabLink to="https://steamcommunity.com/dev/apikey">
              steamcommunity.com/dev/apikey
            </NewTabLink>
          </Fragment>
        }
      />
      <Row
        name="Steam API key"
        id="steamAPIKey"
        type="modalTextBox"
        description={
          <Fragment>
            Allows the extension to make API requests to the{" "}
            <NewTabLink to="https://developer.valvesoftware.com/wiki/Steam_Web_API">
              Steam Web API
            </NewTabLink>, functions that need an API key will be tagged with
            this icon: <FontAwesomeIcon
              icon={faCode}
              className="apiIcon"
            />{" "}
            <br />
            You can get an API key by filling out
            <NewTabLink to="https://steamcommunity.com/dev/apikey">
              {" "}
              this form
            </NewTabLink>{" "}
            (you can put anything in as domain name).
          </Fragment>
        }
        modalTitle="Enter your Steam API key here"
      />
      <Row
        name="Tabs API access"
        id="tabsAPI"
        type="flipSwitchPermission"
        description={
          <Fragment>
            Grants the extension access to the
            <NewTabLink to="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Working_with_the_Tabs_API">
              {" "}
              browser.tabs API
            </NewTabLink>. It - for example - allows the extension to open a tab
            and put it in focus, allows notifications to be clickable, opens the
            bookmarks page when an item is bookmarked, etc. I am using it in
            this mode so it's also less likely to be buggy as well.
          </Fragment>
        }
        permission="tabs"
      />
      <Row
        name="Flag scam comments"
        id="flagScamComments"
        type="flipSwitchStorage"
        description="Reports obvious scam and spam comments like &quot;I will give my knife for all of your csgo graffitties&quot; and others. Helps to keep steamcommunity cleaner and safer."
      />
      {/*<Row*/}
      {/*  name="Your strings to report"*/}
      {/*  id="customCommentsToReport"*/}
      {/*  type="modalTextBox"*/}
      {/*  description="Make the extension report comments that includes one of the the strings you add here. These are additional to the built-in ones."*/}
      {/*/>*/}
      <Row
        name="Colorful items"
        id="colorfulItems"
        type="flipSwitchStorage"
        description="Makes inventories and offers pretty by changing the background color of items based on rarity or in case of doppler, phase"
      />
      <Row
        name="Collect usage data"
        id="telemetryOn"
        type="flipSwitchStorage"
        description={
          <Fragment>
            Sends anonymous usage data to the developers to help discover
            problems and better understand how the extension is used. Check the
            <NewTabLink to="https://csgotrader.app/privacy">
              {" "}
              Privacy{" "}
            </NewTabLink>{" "}
            page for more information on how your data in handled.
          </Fragment>
        }
      />
      <Row
        name="Hide other extensions"
        id="hideOtherExtensionPrices"
        type="flipSwitchStorage"
        description="Hides elements from other extensions that overlap with CSGO Trader's"
      />
      <Row
        name="Show sticker worth on items"
        id="showStickerPrice"
        type="flipSwitchStorage"
        description="When turned on it puts the total price of the stickers applied on a weapon under the exterior indicator in inventories, trade offers and no the incoming trade offers page."
      />
    </Category>
  );
};

export default general;
