import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotEight = () => {
  return (
    <ChangelogInstance version="3.8" date="2026-11-22">
      <li>
        Added composite pricing options that combine multiple sources for more accurate item pricing.
      </li>
      <li>
        Added custom pricing, allowing users to set persistent prices for inventory items. Prices remain until changed or the item is traded, avoiding repeated price lookups.
      </li>
      <li>
        Added an edit-price feature, allowing users to adjust an item's price in a trade for easier valuation of illiquid or special items.
      </li>
      <li>
        Added Doppler phase support for Youpin and C5game pricing.
      </li>
      <li>
        Inventory item images no longer include stickers and charms. Instead, pricing information is shown in the page's accessories section.
      </li>
      <li>
        Accessory prices are shown in item previews, such as when hovering over an item in a trade offer.
      </li>
      <li>
        Added CSFloat market lookup to inventories.
      </li>
      <li>
        Added 3D inspection of stickers and charms via <a href="https://cs2inspects.com">CS2INSPECTS.com</a>
      </li>
      <li>
        The 3D inspection modal can now be closed by clicking outside it.
      </li>
      <li>
        The 3D inspection modal's search now includes stickers and charms, not just item names.
      </li>
      <li>
        Updated the 3D inspection button style (thanks to <a href="https://twitter.com/Epidemic">Epidemic</a>).
      </li>
      <li>
        Added an instant-buy button to the new market layout <GithubIssueLink issueNumber={594}/>
      </li>
      <li>
        Fixed Steam and CS2Trader prices not updating <GithubIssueLink issueNumber={601}/>
      </li>
      <li>
        Fixed an issue with removing the Webchat page header.
      </li>
      <li>
        Fixed market lookup links on market listing pages.
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotEight;