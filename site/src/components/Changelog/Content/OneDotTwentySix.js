import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import {Link} from 'react-router-dom';

const OneDotTwentySix = () => {
  return (
    <ChangelogInstance version="1.26" date="2020-02-03" releaseNotes={true}>
      <li>
        Added sticker prices to inventories, offers and market listings.
        <GithubIssueLink issueNumber={116}/>
      </li>
      <li>Added listing canceled even type to Market History Export</li>
      <li>The progress is properly reset after the Market History Export process finishes</li>
      <li>
        Simplified data export/import options, now the only options are backup and restore.
        <GithubIssueLink issueNumber={114}/>
      </li>
      <li>Mass selling starting at and instant sell price fetching now uses a queue to delay requests</li>
      <li>
        Removed the About page and added link the the <Link to='/faq/'> FAQ </Link> page
        <GithubIssueLink issueNumber={115}/>
      </li>
      <li>Fixed a bug that made the original listing prices show up as zero or NaN after sorting</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentySix;