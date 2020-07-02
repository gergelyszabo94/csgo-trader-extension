import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';
import UserCredit from '../../Changelog/UserCredit';

const OneDotThirteen = () => {
  return (
    <ChangelogInstance version="1.13" date="2019-04-15">
      <li>Fixed "inspect in browser" not pointing to the correct link on market pages when steam inventory helper was set to load more than 10 items
        <UserCredit to='https://steamcommunity.com/profiles/76561198261548996'>A.S.H</UserCredit>
      </li>
      <li>Fixed ruby knives and unknown dopplers' names not changing when selected in inventories
        <UserCredit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</UserCredit>
      </li>
      <li>Added the phases for the new doppler knives (thanks so much for
        <NewTabLink to='https://steamcommunity.com/profiles/76561198103971634'> Dᴊᴇɴᴛ </NewTabLink>
        for collecting them)</li>
      <li>Added further localization support (market pages)</li>
      <li>Added partial Hungarian translation</li>
      <li>Added partial Bulgarian translation (thanks
        <NewTabLink to='https://steamcommunity.com/profiles/76561198900346137'> Flu0z </NewTabLink>
        for being the first translator to volunteer</li>
      <li>Stickers in inventories:</li>
      <ul>
        <li>Repositioned beside the weapon</li>
        <li>Zoom on hover</li>
        <li>Condition on hover</li>
        <li>Click opens market page</li>
      </ul>
      <li>Fixed bugs in inventory pages in non-english language browsers</li>
      <li>Fixed "other exteriors" not working in non-english language browsers</li>
      <li>Added float bar and detailed technical float info to market pages</li>
      <li>Repositions nametags in inventories (above weapon)</li>
      <li>Repositioned default nametag icon so it does not cover the tradability indicator
        <UserCredit to='https://steamcommunity.com/profiles/76561198013607021'>Oliver</UserCredit>
      </li>
      <li>Other minor bug fixes</li>
    </ChangelogInstance>
  );
}

export default OneDotThirteen;