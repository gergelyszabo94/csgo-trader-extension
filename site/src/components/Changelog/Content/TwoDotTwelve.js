import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotTwelve = () => {
  return (
    <ChangelogInstance version="2.12" date="2021-08-27">
      <li>
        Added customizable preset chat messages and trade offer messages.
      </li>
      <li>
        Added new trade offer automation conditions related to total giving/receiving value.
      </li>
      <li>
        Added click "change offer" automatically option.
      </li>
      <li>
        Reworked Discord trade offer notifications, now using embeds, better formatting, sender's avatar showing, profit percentage, floats, doppler phases, duplicate items stacked.
        (mostly done by  <NewTabLink to="https://github.com/Hexiro">Hexiro</NewTabLink>)
      </li>
      <li>
        Added Skinwallet as a pricing provider.
      </li>
      <li>
        Buff lookup links are now directly pointed to the items' page instead of a search result page.
      </li>
      <li>
        Made item collection texts a link to the collection skins on csgostash.com in inventories.
      </li>
      <li>
        Added market search links to the contents sticker capsules' market pages.
      </li>
      <li>
        Added waxpeer market links to market pages, removed pricempire market links.
      </li>
      <li>
        Fixed not being able to turn of the "Show Original Price" feature on market listing pages.
      </li>
      <li>
        Fixed "Select All Page" not working beyond the first page in inventories.
      </li>
      <li>
        Fixed outbidding from the market main page not keeping the correct quantity.
      </li>
      <li>
        Updated dependencies, fixed typos, other small fixes.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTwelve;