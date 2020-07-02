import React from 'react';
import NewTabLink from '../NewTabLink/NewTabLink';

const GithubIssueLink = ({issueNumber}) => {
  return <NewTabLink to={`https://github.com/gergelyszabo94/csgo-trader-extension/issues/${issueNumber}`}> #{issueNumber} </NewTabLink>
};

export default GithubIssueLink;