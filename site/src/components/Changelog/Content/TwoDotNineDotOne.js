import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotNineDotOne = () => {
  return (
    <ChangelogInstance version="2.9.1" date="2020-11-02">
      <li>
        Added Doppler phase support to Buff prices.
      </li>
      <li>
        When trade offer monitoring is enabled, offers are checked at least every 2 minutes.
      </li>
      <li>
       Added pricempire.com links to inventory items (optional)
      </li>
      <li>
       Fixed Doppler Phases not showing in trade offers for Chinese, Russian, Korean and Bulgarian languages
      </li>
      <li>
       Handles displaying of high inventory values in offers
      </li>
      <li>
        Added SWAP.GG links to market pages
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotNineDotOne;