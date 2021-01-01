import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotTenDotOne = () => {
  const problem = `There was a problem identified with this update making some CS:GO items appear multiple times in inventories.
  If you have not updated to the latest version yet you can work around this by disabling the "Use alternative CS:GO inventory endpoint"`;
  
  return (
    <ChangelogInstance version="2.10.1" date="2020-12-31" disclaimer={problem}>
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