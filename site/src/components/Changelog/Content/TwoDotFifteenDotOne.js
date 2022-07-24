import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFifteenDotOne = () => {
  return (
    <ChangelogInstance version="2.15.1" date="2022-07-24">
      <li>
        Contrasting look made optional
      </li>
      <li>
        Added <NewTabLink to="https://buff.market/r/U1093423730">BUFF.MARKET</NewTabLink> referral links
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotOne;