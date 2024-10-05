import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotOneDotThree = () => {
  return (
    <ChangelogInstance version="3.1.3" date="2024-10-05">
      <li>
        Buff and Pricempire links in trade offers made optional
      </li>
      <li>
        Fixed Trade lock indicators and countdowns <GithubIssueLink issueNumber={528} />
      </li>
      <li>
        Fixed Pricempire lookup links
      </li>
      <li>
        Added support for Charm item type
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotOneDotThree;