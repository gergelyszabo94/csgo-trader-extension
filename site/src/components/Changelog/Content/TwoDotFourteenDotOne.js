import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFourteenDotOne = () => {
  return (
    <ChangelogInstance version="2.14.1" date="2022-03-10">
      <li>
        Fixed extension breaking for some users (for all who were not logged into Steam and some more).
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFourteenDotOne;