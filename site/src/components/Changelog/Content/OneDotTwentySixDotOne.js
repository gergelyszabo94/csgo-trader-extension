import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotTwentySixDotOne = () => {
  return (
    <ChangelogInstance version="1.26.1" date="2020-02-10">
      <li>Fixed some very rare items showing no price when pricing is set to CSGOTRADER</li>
      <li>Fixed a bug that made bookmarked items not to show</li>
      <li>Fixed a bug that created an infinite loop during float info fetching  <GithubIssueLink issueNumber={120}/></li>
      <li>Fixed functionalities breaking on the incoming trade offers page when the steam api returned incomplete data</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentySixDotOne;