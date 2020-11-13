import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotNineDotTwo = () => {
  return (
    <ChangelogInstance version="2.9.2" date="2020-11-13">
      <li>
        Added safeguard against corrupted offer data from the Steam API when evaluating offers.
      </li>
      <li>
       Added select/autofill offers based on query parameters (for P2P delivery).
      </li>
      <li>
        Added support to sending/selecting multiple items based on query parameters.
      </li>
      <li>
        Fixed sticker search links having the incorrect "Patch" tag for non-english languages.
    </li>

    </ChangelogInstance>
  );
}

export default TwoDotNineDotTwo;