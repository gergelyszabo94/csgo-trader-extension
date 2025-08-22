import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const ThreeDotFour = () => {
  return (
    <ChangelogInstance version="3.4" date="2025-07-22">
      <li>
        Added support for Trade Protected items
      </li>
      <li>
        Added option to resize and reposition the Trade Protection icon in one's own inventory
      </li>
      <li>
        Added links to incoming trade offers and a summary and ability to cancel sent offers when the trade offers page can't be loaded
      </li>
      <li>
        Fixed inventory totals only showing non-trade protected items
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotFour;