import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotThree = () => {
  return (
    <ChangelogInstance version="3.3" date="2025-04-20">
      <li>
        Detecting new Doppler knives phases
      </li>
      <li>
        Bulk-loading float values for quicker float fetching
      </li>
      <li>
        Added CSFloat Market stall links to Steam profile pages
      </li>
      <li>
        Fixed extension features breaking in the trade offer window because of the new menu system when selecting games/inventories
        <GithubIssueLink issueNumber={548} />
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotThree;