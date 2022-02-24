import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFourteen = () => {
  return (
    <ChangelogInstance version="2.14" date="2022-02-25">
      <li>
        Added quantity to multisell links.
      </li>
      <li>
        Added doppler phases to inventory list generation, optionally including item links, changed defaults.
      </li>
      <li>
        Changed itemherald market links to <NewTabLink to="https://gamerpay.gg/partner/okn9go3r">GamerPay.gg</NewTabLink>.
      </li>
      <li>
        Added more properties to market history export.
      </li>
      <li>
        Trade links are now opened in new tab in discussions as well (groups, trade forum).
      </li>
      <li>
        Added CS.TRADE as a pricing provider.
      </li>
      <li>
        Added user nickname to the Discord notification about being logged out of Steam.
      </li>
      <li>
        Added confirmation to the cancellation of all buy orders.
      </li>
      <li>
        Price loading for selected items in inventories is now optional.
      </li>
      <li>
        Fixed typos, updated dependencies.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFourteen;