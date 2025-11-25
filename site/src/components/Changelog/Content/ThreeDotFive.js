import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotFive = () => {
  return (
    <ChangelogInstance version="3.5" date="2025-11-25">
      <li>
        Added an option to combine commodity items in inventory view <GithubIssueLink issueNumber={564}/>
      </li>
      <li>
        Added instant float loading when opening other poeople's inventories
      </li>
      <li>
        Added Template numbers for Charms
      </li>
      <li>
        Added Lis-skins.com pricing provider
      </li>
      <li>
        Added skinflow.gg referall link
      </li>
      <li>
        Added missing fade percentages, updated buff ids
      </li>
      <li>
        Including itradegg bots in legitSiteBotGroup <GithubIssueLink issueNumber={561}/>
      </li>
      <li>
        Fixed breakage from Steam UI changes <GithubIssueLink issueNumber={570}/>
      </li>
      <li>
        Fixed inventory totals when switching between different Steam games <GithubIssueLink issueNumber={565}/>
      </li>
      <li>
        Fixed inventory links missing in cs exports <GithubIssueLink issueNumber={562}/>
      </li>
      <li>
        Fixed duplicate counts not accounting for both trade protected and normal items
      </li>
      <li>
        Fixed market float loading, unwanted elements appearing
      </li>
      <li>
        Fixed other minor bugs
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotFive;