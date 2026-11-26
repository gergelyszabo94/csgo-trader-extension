import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotEightDotOne = () => {
  return (
    <ChangelogInstance version="3.8.1" date="2026-11-27">
      <li>
        Added seen listing highlighting to the new market layout, visually distinguishing items you have already viewed. <GithubIssueLink issueNumber={602}/>
      </li>
      <li>
        Fixed access token retrieval (broken due to changes by Steam).
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotEightDotOne;
