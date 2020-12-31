import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const TwoDotTenDotOne = () => {
  return (
    <ChangelogInstance version="2.10.1" date="2020-12-31">
      <li>
        Added an option to load CS:GO inventories from an alternative endpoint.
      </li>
      <li>
        Added retry to offer sending based on query params.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTenDotOne;