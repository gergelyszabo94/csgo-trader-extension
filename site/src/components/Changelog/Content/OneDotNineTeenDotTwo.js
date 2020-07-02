import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import {Link} from 'react-router-dom';
import UserCredit from '../../Changelog/UserCredit';
import GithubIssueLink from '../GithubIssueLink';

const OneDotNineTeenDotTwo = () => {
  return (
    <ChangelogInstance version="1.19.2" date="2019-10-21">
      <li>Made automatic float loading optional for offers, inventories and market listings <GithubIssueLink issueNumber={72}/></li>
      <li>Fixed market pages getting wider because of high float items <GithubIssueLink issueNumber={73}/></li>
      <li>Fixed Csgolounge autobumb option not getting saved <GithubIssueLink issueNumber={75}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198022761987'>de_nugget</UserCredit>
      </li>
      <li>Fixed a bug that caused users not being able to buy items from the market if they had SIH installed too <GithubIssueLink issueNumber={71}/>
        <UserCredit to='https://github.com/RonGokhale'>RonGokhale</UserCredit>
      </li>
      <li>Fixed a bug that made special patterns (marble fade, fade) to sometimes not to show <GithubIssueLink issueNumber={76}/></li>
      <li>Float values on items with 0.00 float not shown</li>
      <li>Float loading performance improvements</li>
      <li>Usage data reporting made optional</li>
      <li>Added <Link to='/privacy/'> Privacy </Link> page detailing how your data is handled</li>
    </ChangelogInstance>
  );
}

export default OneDotNineTeenDotTwo;