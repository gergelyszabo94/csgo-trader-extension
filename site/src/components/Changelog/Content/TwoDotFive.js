import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotFive = () => {
  return (
    <ChangelogInstance version="2.5" date="2020-06-10" releaseNotes={true}>
      <li>
        Added new Trade History and Trade History Export features. <GithubIssueLink issueNumber={104} />
      </li>
      <li>
        Added option to bypass Steam's link filtering. <GithubIssueLink issueNumber={265} />
      </li>
      <li>
        Added explanation and warning to the Steam Web API page <GithubIssueLink issueNumber={276} />
      </li>
      <li>
        Auto Float loading is now disabled in market and inventories pages when the CSGOFloat extension is present to avoid unnecessary requests.
      </li>
      <li>
        Skincay was renamed to Skinport across the extension. <GithubIssueLink issueNumber={278} />
      </li>
      <li>
        Improved pricing algorithm to avoid underpricing items when a really low sale happens.
      </li>
      <li>
        Fixed exchange rates not updating when the user changes extension currency from their inventory. <GithubIssueLink issueNumber={266} />
      </li>
      <li>
        Fixed Realtime prices showing up in the wrong currency <GithubIssueLink issueNumber={279} />
      </li>
      <li>
        Fixed items on own side of the trade not getting sorted if when the user switched to the other inventory during loading.
      </li>
      <li>
        Added new team recruitment scam messages to the patterns to report automatically.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFive;