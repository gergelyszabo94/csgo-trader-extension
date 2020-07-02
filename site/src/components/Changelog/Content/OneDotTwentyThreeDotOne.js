import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import {Link} from 'react-router-dom';

const OneDotTwentyThreeDotOne = () => {
  return (
    <ChangelogInstance version="1.23.1" date="2019-12-23" >
      <li>Changes to the <Link to='/prices/'>pricing algorithm</Link>.</li>
      <li>User experience improvements by making clickable elements more apparent and added explanatory titles</li>
      <li>Steam API key is set automatically when the user installs the extension (if the user has one generated)</li>
      <li>Added the highest buy order price as "instant sale price" pricing option for Mass Listing and made item names in the table a link to market.
        <GithubIssueLink issueNumber={106}/>
      </li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyThreeDotOne;