import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import UserCredit from '../../Changelog/UserCredit';
import GithubIssueLink from '../GithubIssueLink';

const OneDotSeventeenDotOne = () => {
  return (
    <ChangelogInstance version="1.17.1" date="2019-09-01">
      <li>Fixed a bug that broke sorting if one of the items did not have a price</li>
      <li>Added "Inventory" and "Trade Offers" links to the extension popup and made popup links settable through options</li>
      <li>Fixed Stiletto Sapphire showing us as "Unknown"</li>
      <li>Fixed reoccuring message not getting removed if it includes steam style formatting tags <GithubIssueLink issueNumber={66}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</UserCredit>
      </li>
      <li>Added "take all from page", "take everything", "take x number of keys" functionality to trade offers</li>
      <li>Added "remove everything", "remove x amount of keys" to the in-trade side of the trade offer window</li>
      <li>Moved trade offer function bar slightly higher</li>
      <li>Added sorting to the in-trade side of the inventory</li>
    </ChangelogInstance>
  );
}

export default OneDotSeventeenDotOne;