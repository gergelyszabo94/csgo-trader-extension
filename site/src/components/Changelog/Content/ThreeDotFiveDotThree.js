import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotFiveDotThree = () => {
  return (
    <ChangelogInstance version="3.5.3" date="2026-01-27">
      <li>
        Fixed own inventory features breaking when the owner does not own and trade protected items <GithubIssueLink issueNumber={579}/>
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotFiveDotThree;