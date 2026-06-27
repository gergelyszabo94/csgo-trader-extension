import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotSixDotOne = () => {
  return (
    <ChangelogInstance version="3.6.1" date="2026-06-27">
      <li>
        Added buyer info to Steam market history <GithubIssueLink issueNumber={588}/>
      </li>
      <li>
        Fixed tradability countdowns, indicators <GithubIssueLink issueNumber={590}/>
      </li>
      <li>
        Reworked Steam price fetching and fixed price loading breaking <GithubIssueLink issueNumber={592}/>
      </li>
      <li>
        Fixed breaking in own inventory
      </li>
      <li>
        Fixed inspect links in trade offers
      </li>
      <li>
        Adjustments for new Steam Community Market
      </li>
      <li>
        Removed gamerpay and bitskins market links
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotSixDotOne;