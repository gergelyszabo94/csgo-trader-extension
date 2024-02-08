import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotOne = () => {
  return (
    <ChangelogInstance version="3.1" date="2024-02-08">
      <li>
        Added Case Hardened blue percentages by <a href="https://csbluegem.com/">CSBlueGem.com</a>
      </li>
      <li>
        Fixed Doppler Phase detection (was broken due to new icons by Steam)
      </li>
      <li>
        Now directly linking to buff when possible, item buff ids from <a href="https://github.com/ModestSerhat/buff163-ids">ModestSerhat/buff163-ids</a>
      </li>
      <li>
        Fixed csgostash links. <GithubIssueLink issueNumber={513} />
      </li>
      <li>
        Handling| "Run T, Run"  stickers correctly <GithubIssueLink issueNumber={512} />
        Thanks <a href="https://github.com/atalantus">atalantus</a>
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotOne;