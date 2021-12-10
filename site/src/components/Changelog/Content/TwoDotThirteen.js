import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotThirteen = () => {
  return (
    <ChangelogInstance version="2.13" date="2021-12-10">
      <li>
        Added inspect on server feature (available in inventories, offers and on the market (works when float loading works)).
      </li>
      <li>
        Added csgostash links to inventories and market pages.
      </li>
      <li>
        Added links to the market multisell pages to inventory items and to market listings (built-in ability to sell commodity items in bulk).
      </li>
      <li>
        More robust automated trade offer accepting and delay between requests to avoid temporary ban.
      </li>
      <li>
        Added phase support for ft, ww and bs Glock Gamma Dopplers.
      </li>
      <li>
        Removed all analytics / data collection
      </li>
      <li>
        Removed quick trade offer accepting from the tradeoffers page from Firefox due to technical limitation.
      </li>
      <li>
        Moved webchat message presets to the right.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotThirteen;