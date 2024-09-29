import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotOneDotTwo = () => {
  return (
    <ChangelogInstance version="3.1.2" date="2024-09-30">
      <li>
        Added csfloat and youpin as pricing providers
      </li>
      <li>
        Added bookmark deletion confirmation prompt
      </li>
      <li>
        Added Pricempire.com lookup links to trade offers
      </li>
      <li>
        Added <a href="https://skinswap.com/">Skinswap.com</a> trade site bots to trusted profiles and added referral links
      </li>
      <li>
        Added <a href="https://haloskins.com/">HaloSkins.com</a> referral links
      </li>
      <li>
        Fixed "Hide other extensions" feature that removes overlapping elements from other extensions
      </li>
      <li>
        Fixed name tags not being added to selected inventory items
      </li>
      <li>
        Fixed agent patch total price indicator <GithubIssueLink issueNumber={521} />
      </li>
      <li>
        Fixed Steam Market history export <GithubIssueLink issueNumber={520} />
      </li>
      <li>
        Fixed Market buy order tables getting added multiple times
      </li>
      <li>
        Removed Steamrep.com related features as the project has been discontinued
      </li>
      <li>
        Updated dependencies
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotOneDotTwo;