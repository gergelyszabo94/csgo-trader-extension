import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotSixteenDotThree = () => {
  return (
    <ChangelogInstance version="2.16.3" date="2023-06-23">
      <li>
        Fixes inventory layout breaking after Steam changed styling. <GithubIssueLink issueNumber={492} />
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSixteenDotThree;