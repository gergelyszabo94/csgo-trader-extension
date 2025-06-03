import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotThreeDotOne = () => {
  return (
    <ChangelogInstance version="3.3.1" date="2025-06-04">
      <li>
        Added Lookup on CSFloat trade action.
      </li>
      <li>
        Added Skin.Place referral link to market pages
      </li>
      <li>
        Fixed various extension features breaking in trade offers and inventories due to changes by Steam
          <GithubIssueLink issueNumber={550} />,
         <GithubIssueLink issueNumber={553} />
      </li>
      <li>
        Handling more sticker names with comas, other improvements
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotThreeDotOne;