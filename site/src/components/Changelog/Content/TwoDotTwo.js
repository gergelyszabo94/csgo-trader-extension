import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotTwo = () => {
  const disclaimer = "It was brought to my attention that bumping discussions is against Steam's Rules and Guidelines For Steam: Discussions, Reviews, and User Generated Content so use it at your own risk!";

  return (
    <ChangelogInstance version="2.2" date="2020-04-19" releaseNotes={true} disclaimer={disclaimer}>
      <li>
        Discussion posts (group, trading, forum) can now be set to be automatically bumped by the extension.
        <GithubIssueLink issueNumber={187}/>
      </li>
      <li>Added an option to remove the header in Steam Web Chat</li>
      <li>Tweaked the appearance the the warning message that gets added to scammers' profiles</li>
      <li>Security improvements that fix issues flagged by Mozilla</li>
      <li>Added usage data collection consent prompt for new Firefox users</li>
      <li>Fixed a bug that broke float value loading on market listings when a non-default number of listings were set to load per page</li>
    </ChangelogInstance>
  );
}

export default TwoDotTwo;