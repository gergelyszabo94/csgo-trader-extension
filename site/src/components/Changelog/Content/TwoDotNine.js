import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotNine = () => {
  return (
    <ChangelogInstance version="2.9" date="2020-09-21" releaseNotes={true}>
      <li>
        Added option/capability to auto-send items in trade offers based on query parameters
        <GithubIssueLink issueNumber={352}/>
      </li>
      <li>
        In-browser inspecting provider was changed from CS.DEAL to SWAP.GG
        <GithubIssueLink issueNumber={41}/>
      </li>
      <li>
        Added retry logic to offer auto-accepting and sending.
      </li>
      <li>
        Added Bitskins.com and CS.MONEY referral links to market listings pages
      </li>
      <li>
        Fixed a bug where the selected item name/link stuck on the previously selected item in inventories
      </li>
      <li>
        Navaja Black Pearls now correctly identified
      </li>
      <li>
        Added more spam comment patterns to report.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotNine;