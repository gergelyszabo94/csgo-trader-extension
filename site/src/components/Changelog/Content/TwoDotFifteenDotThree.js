import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import NewTabLink from '../../NewTabLink/NewTabLink';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotFifteenDotThree = () => {
  return (
    <ChangelogInstance version="2.15.3" date="2022-11-12">
      <li>
        Added Case Hardened tiers (AK-47) and blue/gold values (knives), thanks <NewTabLink to="https://twitter.com/justBadAntal">Antal</NewTabLink>
      </li>
      <li>
        Fixed the extension not loading on other people's inventory pages <GithubIssueLink issueNumber={465}/>
      </li>
      <li>
        Made notification about being logged out more resilient (should be fewer false positives)
      </li>
      <li>
        Reduced number of concurrent inventory loads in the background (for friend request automation)
      </li>
      <li>
        Eliminated unnecessary requests when features turned off on market listing pages
      </li>
      <li>
        Now collecting inspect links for item tracking
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFifteenDotThree;