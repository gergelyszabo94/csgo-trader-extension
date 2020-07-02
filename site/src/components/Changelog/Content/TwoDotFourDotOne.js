import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotFourDotOne = () => {
  return (
    <ChangelogInstance version="2.4.1" date="2020-06-02" subtitle="Firefox only">
      <li>
        Fixed mass selling not working and keep retrying to list items
      </li>
      <li>
        Fixed not being able to cancel market listings and buy orders en-masse.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFourDotOne;