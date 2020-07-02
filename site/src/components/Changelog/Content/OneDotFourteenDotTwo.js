import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import NewTabLink from '../../NewTabLink/NewTabLink';

const OneDotFourteenDotTwo = () => {
  return (
    <ChangelogInstance version="1.14.2" date="2019-06-17">
      <li>Added Danish translation, thanks to <NewTabLink to='https://github.com/cjavad'> cjavad </NewTabLink></li>
      <li>Fixed ursus and talon rubies showing as unknowns</li>
      <li>Achieved feature parity with inventories on trade offers, features such as colorful items, exterior indicators and doppler phases are now available in trade offers as well
        <GithubIssueLink issueNumber={24}/></li>
    </ChangelogInstance>
  );
}

export default OneDotFourteenDotTwo;