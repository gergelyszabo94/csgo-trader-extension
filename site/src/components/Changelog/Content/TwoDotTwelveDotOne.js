import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotTwelveDotOne = () => {
  return (
    <ChangelogInstance version="2.12.1" date="2021-09-23">
      <li>
        Added option to be notified about being logged out of Steam.
      </li>
      <li>
        Added option to hide trade lock indicators in inventories.
      </li>
      <li>
        Added phase info for all new Gamma Doppler items.
      </li>
      <li>
        Removed skinport "instant" and "steam" prices as pricing modes.
      </li>
      <li>
        Fixed default WebChat message preset not being able to sent.
      </li>
      <li>
        Updated dependencies, fixed typos, other small fixes.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTwelveDotOne;