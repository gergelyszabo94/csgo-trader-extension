import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import UserCredit from '../UserCredit';

const Two = () => {
  return (
    <ChangelogInstance version="2.0" date="2020-03-18" releaseNotes={true} >
      <li>
        The extension popup, the options and the bookmarks pages received a new look
        <GithubIssueLink issueNumber={122}/>
      </li>
      <li>
        Fixed a bug that made the Market History Export not appear for users who did not have market listings and buy orders.
        <GithubIssueLink issueNumber={123}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198024029179'>hellgaet</UserCredit>
      </li>
      <li>
        Price loading now retried when failed for Market mass selling
        <GithubIssueLink issueNumber={128}/>
      </li>
      <li>
        Fixed a bug that made the same kind of item on both sides show the same float value on the incoming offers page.
        <GithubIssueLink issueNumber={129}/>
      </li>
      <li>
        Spam/scam comments are now reported silently (no page jerk) and an explanation is added to reported comments
        <GithubIssueLink issueNumber={125}/>
      </li>
      <li>
        Added an option to only include selected items when exporting list of inventory items.
        <GithubIssueLink issueNumber={118}/>
      </li>
      <li>
        Market listing sticker tooltips now always shown in their full length
        <GithubIssueLink issueNumber={127}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198285371555'>UwU danto OwO</UserCredit>
      </li>
    </ChangelogInstance>
  );
}

export default Two;