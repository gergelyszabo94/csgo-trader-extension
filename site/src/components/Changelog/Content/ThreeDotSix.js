import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotSix = () => {
  return (
    <ChangelogInstance version="3.6" date="2026-04-19">
      <li>
        Added support for sticker slabs
      </li>
      <li>
        Added resie and reposition "on-market" icons on inventory items
      </li>
      <li>
        Added option to show/hide multisell and exteriors on market pages <GithubIssueLink issueNumber={586}/>
      </li>
      <li> 
        Added missing "Show Buff Lookup links" option to settings <GithubIssueLink issueNumber={587}/>
      </li>
      <li>
        Added buff ids for newer items
      </li>
      <li>
        Fixed float loading
      </li>
      <li>
        Fixed inspect links
      </li>
      <li>
        Fixed message presets double sending
      </li>
      <li>
        Fixed csfloat db lookup links <GithubIssueLink issueNumber={582}/>
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotSix;