import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotFifteen = () => {
  return (
    <ChangelogInstance version="1.15" date="2019-06-24">
      <li>Added fade percentage info to fade knives and glock fade in inventories <GithubIssueLink issueNumber={49}/></li>
      <li>Added marble fade pattern info to guts, flips, m9s and bayos in inventories <GithubIssueLink issueNumber={49}/></li>
    </ChangelogInstance>
  );
}

export default OneDotFifteen;