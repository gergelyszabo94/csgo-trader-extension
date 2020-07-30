import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotSeven = () => {
  return (
    <ChangelogInstance version="2.7" date="2020-07-30" releaseNotes={true} >
      <li>
        Added Trade Offer Automation (BETA) feature <GithubIssueLink issueNumber={152} />
      </li>
      <li>
        Added show all orders buttons to market listings <GithubIssueLink issueNumber={336} />
      </li>
      <li>
        Added option to mark already seen market listings <GithubIssueLink issueNumber={335} />
      </li>
      <li>
        Added option to mark moderation messages as read automatically <GithubIssueLink issueNumber={337} />
      </li>
      <li>
        Added option to set custom default values to the popup calculator <GithubIssueLink issueNumber={340} />
      </li>
      <li>
        Agent patches are handled correctly (value, market link) <GithubIssueLink issueNumber={339} />
      </li>
      <li>
        Awaiting confirmations now don't break the market main page features <GithubIssueLink issueNumber={342} />
      </li>
      <li>
        Rearranged options and created Safety options category.
      </li>
      <li>
        Fixed wallet currency appearing in trade offer totals instead of extension currency <GithubIssueLink issueNumber={338} />
      </li>
      <li>
        Fixed "place highest order" button only working for CSGO items <GithubIssueLink issueNumber={341} />
      </li>
      <li>
        Fixed an issue where granting access to CSGOTRADER.NET or csgolounge.com the extension would also ask for tabs api access
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSeven;