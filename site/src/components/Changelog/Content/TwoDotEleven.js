import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotEleven = () => {
  return (
    <ChangelogInstance version="2.11" date="2021-04-23">
      <li>
        Added steamrep.com and csgo-rep.com profile links to Steam profile context menus.
      </li>
      <li>
        Added logic that keeps refreshing trade offers until they properly load.
      </li>
      <li>
        The trade offer message is now included in the Discord message when notifying about trade offers.
      </li>
      <li>
        Added an option to customize the market buy order outbid percentage.
      </li>
      <li>
        Added an option to remove animated profile backgrounds.
      </li>
      <li>
        Added Profit/Loss summary to offer and trade history.
      </li>
      <li>
        Added an option to add buttons to inventory items that allow for copying item ids, market names and inventory links.
      </li>
      <li>
        Added an option to hide exterior indicators in inventories/offers.
      </li>
      <li>
        Market outbidding now respects buy order quantities.
      </li>
      <li>
        Fixed trade offer Discord notification when one side of the offer is empty or the offer includes non-csgo items.
      </li>
      <li>
        The extension does not show stickers on items on market listings when the csgofloat extension is installed.
      </li>
      <li>
        Fixed stickers with comas in their name breaking sticker displaying.
      </li>
      <li>
        Updated dependencies, fixed typos
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotEleven;