import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import UserCredit from '../../Changelog/UserCredit';

const OneDotTwentyTwo = () => {
  return (
    <ChangelogInstance version="1.22" date="2019-12-01" releaseNotes={true}>
      <li>Added Mass Listing feature that is now in Beta.
        <GithubIssueLink issueNumber={69}/>
      </li>
      <li>
        Added support for all Steam currencies <GithubIssueLink issueNumber={101}/>
        The newly added currencies are:
        <ul>
          <li>United Arab Emirates Dirham</li>
          <li>Argentine Peso"</li>
          <li>Chilean Peso</li>
          <li>Colombian Peso</li>
          <li>Costa Rican Colón</li>
          <li>Kuwaiti Dinar</li>
          <li>Kazakhstani Tenge</li>
          <li>Peruvian Nuevo Sol</li>
          <li>Qatari Riyal</li>
          <li>Saudi Riyal</li>
          <li>New Taiwan Dollar</li>
          <li>Ukrainian Hryvnia</li>
          <li>Uruguayan Peso</li>
          <li>Vietnamese Dong</li>
        </ul>
      </li>
      <li>Added a feature that allows you to select a specified number of copies of the select item.
        You can select an item by holding down the control key and right clicking on them.
        <GithubIssueLink issueNumber={98}/>
        <UserCredit to='https://github.com/Jason-Tam4'>Jason Tam</UserCredit>
      </li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyTwo;