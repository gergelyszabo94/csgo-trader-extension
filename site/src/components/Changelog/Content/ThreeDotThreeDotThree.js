import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotThreeDotThree = () => {
  return (
    <ChangelogInstance version="3.3.3" date="2025-07-04">
      <li>
        Fixed Doppler phase detection that broke due to Valve changing the image urls
         <GithubIssueLink issueNumber={555} />
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotThreeDotThree;