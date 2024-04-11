import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotOneDotOne = () => {
  return (
    <ChangelogInstance version="3.1.1" date="2024-04-12">
      <li>
        Added "print" option to the Trade History page to surfice technical details to help "proof of trade" gathering.
      </li>
      <li>
        Added Fade percentage support to Kukri Knives
      </li>
      <li>
        Fixed several important Trade Offer related features that were broken by changes to the Steam API.
      </li>
      <li>
        Fixed blue percentages for M9 Bayonets <GithubIssueLink issueNumber={515} />
      </li>
      <li>
        Added <a href="https://skinvault.gg/">Skinvault.gg</a> market to to market listings
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotOneDotOne;