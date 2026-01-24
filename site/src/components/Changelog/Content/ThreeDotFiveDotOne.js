import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotFiveDotOne = () => {
  return (
    <ChangelogInstance version="3.5.1" date="2026-01-24">
      <li>
        Displaying charm template ids on market listing pages <GithubIssueLink issueNumber={575}/>
      </li>
      <li>
        Instant float loading for own inventory
      </li>
      <li>
        Fixed listing to market from inventory <GithubIssueLink issueNumber={576}/>
      </li>
      <li>
        Fixed item image overlapping item name and stickers in inventory
      </li>
      <li>
        Fixed market listing page breakage due to Steam UI changes <GithubIssueLink issueNumber={573}/>
      </li>
      <li>
        Fixed duplicating item counts on inventory game switching <GithubIssueLink issueNumber={574}/>
      </li>
      <li>
        Fixed broken csv export
      </li>
      <li>
        Removed Skinbid links
      </li>
      <li>
        Fixed other minor bugs and updated dependencies
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotFiveDotOne;