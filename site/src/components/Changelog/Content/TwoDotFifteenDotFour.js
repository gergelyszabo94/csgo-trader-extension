import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotFifteenDotFour = () => {
  return (
    <ChangelogInstance version="2.15.4" date="2022-11-13">
      <li>
        Loading other people's inventories through a new endpoint, removing detailed trade lock indicators
      </li>
      <li>
        Added option to disable Real Time prices loading on the market main page (for our own listings)
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotFour;