import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotSeven = () => {
  return (
    <ChangelogInstance version="3.7" date="2026-09-07">
      <li>
        Added integrated 3D inspect via <a href="https://cs2inspects.com">CS2INSPECTS.com</a>
      </li>
      <li>
        Float values added to trade offers page
      </li>
      <li>
        Added new pricing providers/modes: Youpin Buy order price, Csfloat buy order price, C5Game listing and buy order prices via <a href="https://cs2.sh">cs2.sh</a>
      </li>
      <li>
        Added Youpin lookup links
      </li>
      <li>
        Added doppler phase support for Youpin prices <GithubIssueLink issueNumber={595}/>
      </li>
      <li>
        Fixed mass listing price loading <GithubIssueLink issueNumber={592}/>
      </li>
      <li>
        Fixed buy outbid by % pricing issue <GithubIssueLink issueNumber={592}/>
      </li>
      <li>
        Fixed extension breaking item layout for non-cs2 items <GithubIssueLink issueNumber={599}/>
      </li>
      <li>
        Added fallback to a search link when the item buff id is missing
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotSeven;