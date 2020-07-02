import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotEighteen = () => {
  return (
    <ChangelogInstance version="1.18" date="2019-09-16">
      <li>Resizes trade offers in the trade offers page so when an offer is declined it does not jerk the page <GithubIssueLink issueNumber={18}/></li>
      <li>Generate list of inventory items (copy to clipboard, download as .csv) - for posting in groups, trade sites, etc.  <GithubIssueLink issueNumber={21}/></li>
      <li>Fixed bug that did not allow the "colorful items" feature to apply in non-english Steam</li>
      <li>Fixed bug where Doppler prices were not converted when a non-USD currency was selected</li>
      <li>Extension preferences and bookmarks can now be imported and exported <GithubIssueLink issueNumber={53}/></li>
    </ChangelogInstance>
  );
}

export default OneDotEighteen;