import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotFourteenDotOne = () => {
  return (
    <ChangelogInstance version="1.14.1" date="2019-05-25">
      <li>Added the newest spam comments for flagging and extended the feature to include comments in groups, guides, screenshots, etc.</li>
      <li>If the number of market listings you want to load is the default (10), the page does not scroll automatically</li>
      <li>Comment replies feature now available under screenshots, guides and groups. It also puts the cursor to the right place to save time.
        <GithubIssueLink issueNumber={40}/></li>
      <li>Inventory items got a cleaner look with the border being the same color as the background</li>
      <li>Fixed a bug where fully worn stickers would show as not worn at all <GithubIssueLink issueNumber={52}/></li>
      <li>Fixed bookmarks not gettings saved because of chrome.storage.sync limits <GithubIssueLink issueNumber={51}/></li>
    </ChangelogInstance>
  );
}

export default OneDotFourteenDotOne;