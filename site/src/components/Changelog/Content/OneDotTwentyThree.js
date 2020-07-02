import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotTwentyThree = () => {
  return (
    <ChangelogInstance version="1.23" date="2019-12-17" releaseNotes={true}>
      <li>Added feature to show received and sent offer history summary per user on the incoming trade offers page, in trade offers, profiles and inventories. <GithubIssueLink issueNumber={99}/>
      </li>

      <li>Fade percentages and Marble Fade patterns are shown on market listing pages <GithubIssueLink issueNumber={94}/></li>
      <li>Added feature to automatically log you in on CSGOTRADERS.NET a separate one to complete all Open ID logins automatically (when logging in to a site with Steam)
        <GithubIssueLink issueNumber={93}/>
      </li>
      <li>Added Georgian Lari as currency <GithubIssueLink issueNumber={105}/></li>
      <li>Mass Market Listing is out of BETA with some improvements, like selecting the starting at price if that is the highest and retry logic for loading prices</li>
      <li>Float values are automatically loaded on the incoming offers page. <GithubIssueLink issueNumber={100}/></li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyThree;