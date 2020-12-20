import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotTen = () => {
  return (
    <ChangelogInstance version="2.10" date="2020-12-20" releaseNotes={true}>
      <li>
        Added Discord notification option for Trade Offer Automation.
      </li>
      <li>
        Added an option to show "Lookup item on Buff" links on inventory items and trade offers.
      </li>
      <li>
        Added Incoming and Sent offer history menus inside the extension under Trade History (BETA).
      </li>
      <li>
        Now showing Profit/Loss percentages in the Incoming Trade offers page and inside trade offers.
      </li>
      <li>
        Added DMARKET, ItemHerald and Pricempire links to market pages.
      </li>
      <li>
        Rare and expensive items' prices are now pegged to BUFF for CSGOTRADER pricing.
      </li>
      <li>
        Fixed a SteamRep banned scammer background not showing on profiles with animated backgrounds.
      </li>
      <li>
        Fixed float values not loading on some inventory pages when quickly navigating between pages.
        <GithubIssueLink issueNumber={362}/>
      </li>
      <li>
        Fixed side navigation not being scrollable and therefore not all option categories being viewable on low resolution screens.
      </li>
      <li>
        Handles a rare case when missing user details break the Trade History page.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTen;