import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotSixteen = () => {
  return (
    <ChangelogInstance version="2.16" date="2023-04-27">
      <li>
        Switched from CSGOFloat to <NewTabLink to="https://pricempire.com/">Pricempire</NewTabLink> for float fetching.
      </li>
      <li>
        Option to include float values when generating inventory items list.
      </li>
      <li>
        Official site bots are highlighted if they are in the site's Steam group (bitskins, skinport, tradeit).
      </li>
      <li>
        Now removing all pictures from profile pages when NSFW filter mode is enabled.
      </li>
      <li>
        Loading real-time prices for market history is now optional.
      </li>
      <li>
        Inventory duplicate count made optional.
      </li>
      <li>
        Fixed displaying of extremely low float values.
      </li>
      <li>
        Handling more sticker names that include commas.
      </li>
      <li>
        Changed market chart date formatting.
      </li>
      <li>
        Removed alternative iventory option since it no longer worked.
      </li>
      <li>
        Removed scam comment flagging since it's no longer needed.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSixteen;