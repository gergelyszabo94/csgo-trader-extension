import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFifteen = () => {
  return (
    <ChangelogInstance version="2.15" date="2022-07-14">
      <li>
        Added Fade percentages to all fades, thanks to <NewTabLink to="https://skinport.com/blog/csgo-fade-percentage/">Skinport's CS:GO Fade Percentage Calculation Update</NewTabLink>
      </li>
      <li>
        Contrasting per-item indicators (new look)
      </li>
      <li>
        Added optional float rank and paint seed indicators to items
      </li>
      <li>
        Added option to set float value precision
      </li>
      <li>
        Added dynamic price percentage to user inventories for easy discounting calculations
      </li>
      <li>
        Added price update frequency as a user accessible option
      </li>
      <li>
        Added buff links to market listings
      </li>
      <li>
        Added "Remove All Active Listings" button to market listings pages
      </li>
      <li>
        Added option to keep previous Bump comment when auto-bumping Steam discussions
      </li>
      <li>
        The old trade offer message is now shown even after clicking "change offer"
      </li>
      <li>
        Showing nametags on market listings without hovering
      </li>
      <li>
        Added option to include sticker price in item list generation
      </li>
       <li>
        Added option to remove the "Cancel Escrowed Trades" button from the trade offers page
      </li>
      <li>
        Added <NewTabLink to="https://p2p.bitskins.com/affiliate#gery">p2p.bitskins.com</NewTabLink> and <NewTabLink to="https://tradeit.gg/?aff=gery">tradeit.gg</NewTabLink> affiliate links, removed swap.gg, changed csmoney logo
      </li>
      <li>
        Moved "Notify me about new items" option to Options/Notifications and it's now off by default
      </li>
      <li>
        Real-time prices loading off by default
      </li>
      <li>
        Copy item details buttons added to more games
      </li>
      <li>
        Handling more sticker names that include commas
      </li>
      <li>
        Fixed lots of Firefox specific bugs, like market actions not working
      </li>
      <li>
        Fixed market history export always exporting from latest
      </li>
      <li>
        Updated dependencies, fixed html formatting, other issues
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteen;