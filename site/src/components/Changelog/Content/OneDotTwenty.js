import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import UserCredit from '../../Changelog/UserCredit';
import GithubIssueLink from '../GithubIssueLink';

const OneDotTwenty = () => {
  return (
    <ChangelogInstance version="1.20" date="2019-11-10" releaseNotes={true}>
      <li>Made float caching more efficient</li>
      <li>Added prices, exteriors, etc to items on the incoming offers page <GithubIssueLink issueNumber={77}/></li>
      <li>Clicking user avatars on the incoming offers page makes profiles open on new tab</li>
      <li>Added an "accept trade" button to trade offers on the incoming offers page</li>
      <li>Fixed a bug that made float values round up <GithubIssueLink issueNumber={82}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198879461125'>Seba.</UserCredit>
      </li>
      <li>Hides csgofloat extension elements in inventories when the "Hide other extensions" feature is enabled <GithubIssueLink issueNumber={84}/></li>
      <li>Adds float rank to technical float info <GithubIssueLink issueNumber={87}/></li>
      <li>Added currency converter and percentage calculator to popup <GithubIssueLink issueNumber={38}/></li>
    </ChangelogInstance>
  );
}

export default OneDotTwenty;