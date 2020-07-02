import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import UserCredit from '../../Changelog/UserCredit';

const OneDotTwentyFour = () => {
  return (
    <ChangelogInstance version="1.24" date="2020-01-09" releaseNotes={true}>
      <li>Profiles with csgotrader.app in their name are highlighted with gold color </li>
      <li>Added option (on by default) to move trade offer headers to the left on wide screens.
        <GithubIssueLink issueNumber={108}/>
      </li>
      <li>Fixed a bug where Gamma Doppler phases were not showing in offers if the user used a language where the knives' names are capitalized differently.</li>
      <li>Fixed a bug that prevented PLN from being able to selected as a pricing currency</li>
      <li>Fixed item list generation</li>
      <li>Fixed a bug that made all bookmarks disappear if one of the bookmarked items was a vanilla item</li>
      <li>Fixed offer totals showing switched on the sent offer page
        <UserCredit to='https://steamcommunity.com/profiles/76561198275942728'>¡kFzo彡</UserCredit>
      </li>
      <li>Fixed a bug that caused items in trade offers to disappear (visually) sometimes completely when they should have gone back to the inventory
        <UserCredit to='https://steamcommunity.com/profiles/76561198275942728'>¡kFzo彡</UserCredit>
      </li>
      <li>Misc performance and usability improvements</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyFour;