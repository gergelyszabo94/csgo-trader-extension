import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotFourteen = () => {
  return (
    <ChangelogInstance version="1.14" date="2019-05-19">
      <li>Fixed market listings script breaking on commodity items' pages <GithubIssueLink issueNumber={48}/></li>
      <li>You can copy someone's profile permanent link to clipboard from the profile dropdown menu <GithubIssueLink issueNumber={15}/></li>
      <li>Added option to load customizable (in the options menu) number of market listings on market pages <GithubIssueLink issueNumber={46}/></li>
      <li>Added duplicate count to items on inventory (visible when item is in focus) <GithubIssueLink issueNumber={23}/></li>
      <li>Added a reply icon to comments on profiles and groups that puts the name of the commenter in the text box like: <b>@GeRy | gery.dev</b>,
        makes replying to comments more swift <GithubIssueLink issueNumber={40}/></li>
    </ChangelogInstance>
  );
}

export default OneDotFourteen;