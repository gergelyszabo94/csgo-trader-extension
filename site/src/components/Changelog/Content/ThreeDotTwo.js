import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotTwo = () => {
  return (
    <ChangelogInstance version="3.2" date="2024-10-19">
      <li>
        Added Inventory Full Screen Screenshot view feature
      </li>
      <li>
        Re-added support for Firefox, the Firefox version will receive updates too now.
      </li>
      <li>
        Added charm price indicators to inventory items
      </li>
      <li>
        Added fade percentage support for M4A1-S Fade
      </li>
      <li>
        Added accept trade offer button to trade offers page on Firefox
      </li>
      <li>
        Fixed lookup links for commodity items in trade offers and moved lookup links to the bottom
      </li>
      <li>
        "Hide other extensions" feature now applies to the market.csgo extension
      </li>
      <li>
        Fixed trade locked items not getting added to selected items list
      </li>
      <li>
        Fixed broken pricempire lookup links
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotTwo;