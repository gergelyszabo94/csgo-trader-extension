import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotFifteenDotSix = () => {
  return (
    <ChangelogInstance version="2.15.6" date="2022-12-14">
      <li>
        Added CSMONEY P2P and CS.TRADE referral links
      </li>
      <li>
        Fixed ST indicators not appearing on vanilla stattrak knives
      </li>
      <li>
        Fixed sorting by position in other people's inventories
      </li>
      <li>
        Fixed inventory total being incremented on game switching <GithubIssueLink issueNumber={472} />
      </li>
      <li>
        Fixed the extension opening the user's Steam profile ocassionally <GithubIssueLink issueNumber={469} />
      </li>
      <li>
        Fixed CSGOFLOAT extension detection
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotSix;