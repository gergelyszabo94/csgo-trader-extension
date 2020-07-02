import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import UserCredit from '../../Changelog/UserCredit';

const OneDotTwentyOne = () => {
  return (
    <ChangelogInstance version="1.21" date=" 2019-11-17" >
      <li>Added CSGOTrader prices to some items that had no price before <GithubIssueLink issueNumber={86}/></li>
      <li>Fixed Talon Black Pearl showing up as unknown phase.</li>
      <li>Added ability to sort listings based on float values and price on market pages <GithubIssueLink issueNumber={90}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198217161837'>Skjerve</UserCredit>
      </li>
      <li>Fixed a bug that made the "number of listings to show on market pages" option not save user input</li>
      <li>Added option to show the original currency and price of what an item was listed on as well as the amount the seller will receive <GithubIssueLink issueNumber={92}/></li>
      <li>All duplicate items can be selected in inventories by holding down the control key when the selection is active</li>
      <li>Added the same "starting at" and the number of items sold as well as link to the item's market page for items in not-own inventories</li>
      <li>Added option to set the Steam API key automatically when opening the apikey page</li>
      <li>Added option to remove the Steam API key in the options</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyOne;