import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotSixDotThree = () => {
  return (
    <ChangelogInstance version="2.6.3" date="2020-07-15">
      <li>
        Fixed a bug where users with no billing address form could not use the new instant buy and quick set buy order features.
        <GithubIssueLink issueNumber={329}/>
      </li>
      <li>
        Fixed turning off instant buy buttons not actually having any effect.
        <GithubIssueLink issueNumber={333}/>
      </li>
      <li>
        Fixed the new buy order menu overlapping with the recent activity menu on commodity items
        <GithubIssueLink issueNumber={332}/>
      </li>
      <li>
        NSFW mode now removes animated backgrounds too
        <GithubIssueLink issueNumber={334}/>
      </li>
      <li>
        Fixed some items not getting added to the mass listings table when selected
        <GithubIssueLink issueNumber={330}/>
      </li>
      <li>
        Added option to stop selected items table from appearing in other people's inventory.
        <GithubIssueLink issueNumber={331}/>
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSixDotThree;