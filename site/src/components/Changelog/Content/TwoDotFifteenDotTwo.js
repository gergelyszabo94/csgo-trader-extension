import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFifteenDotOne = () => {
  return (
    <ChangelogInstance version="2.15.2" date="2022-10-17">
        <li>
        Added option to fix broken trade urls (amp;token)
      </li>
        <li>
        Added option to show CSGOFLOAT DB lookup links for inventory items
      </li>
      <li>
        Added option to show years on Steam Market charts, thanks <NewTabLink to="https://twitter.com/cantryde">cantry</NewTabLink>
      </li>
      <li>
        Added "Select Everything" button for inventory selection
      </li>
      <li>
        Contrasting look also applied to Real Time Prices, off by default
      </li>
      <li>
        Added fade percentage support for trade-up fades (paint seed 1000)
      </li>
      <li>
        Fixed Webchat header removal feature
      </li>
      <li>
        Fixed keep old bump comment option for bumping
      </li>
      <li>
        Additional small fixes and dependency security updates
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotOne;