import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotTenDotOne = () => {
  return (
    <ChangelogInstance version="2.10.1" date="2020-12-31">
      <li>
        Added an option to load CS:GO inventories from an alternative endpoint.
        (inspired by and with the help of <NewTabLink to="https://twitter.com/cantryde">cantry</NewTabLink>)
      </li>
      <li>
        Added retry to offer sending based on query params.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTenDotOne;