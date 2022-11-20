import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotFifteenDotFive = () => {
  return (
    <ChangelogInstance version="2.15.5" date="2022-11-20">
      <li>
        Not making additional inventory requests when loading other people's inventories
      </li>
      <li>
        Fixing NaNd instead of L in trade lock indication
      </li>
      <li>
        Only requesting group invites page when "Ignore group invites" is enabled
      </li>
      <li>
        "Load prices on my listings and orders" is also applied to buy orders
      </li>
      <li>
        "Load prices for" checkboxed are now unchecked by default
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotFive;