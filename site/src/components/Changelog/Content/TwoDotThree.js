import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotFive = () => {
  return (
    <ChangelogInstance version="2.3" date="2020-05-15" releaseNotes={true}>
      <li>
        Added
        <NewTabLink to='https://skincay.com/?r=gery'> Skincay.com </NewTabLink>
        as a pricing provider
      </li>
      <li>
        Added links to
        <NewTabLink to='https://skincay.com/?r=gery'> Skincay.com </NewTabLink>
        to market listing pages (can be turned off)
      </li>
      <li>
        Fixed an issue where after currency change the exchange rates did not update in the background immediately
      </li>
      <li>
        For new users (new installations) the extension currency will be set to match their Steam Wallet currency.
        <GithubIssueLink issueNumber={161}/>
      </li>
      <li>Added a disclaimer to the discussion auto-bumping feature</li>
      <li>
        Made numerous improvements to the Steam Market Mass Listing feature
        <GithubIssueLink issueNumber={201}/>
      </li>
      <li>Added new scam/spam comment patterns to report (mostly "join our team" like ones)</li>
      <li>
        Made numerous improvements to the the incoming trade offers page and to trade offers
        <GithubIssueLink issueNumber={215}/>
      </li>
      <li>Improvements to the friend request evaluation feature, including new conditions, request summary, other niceties
        <GithubIssueLink issueNumber={195}/>
      </li>
      <li>Even users with capitalized "CSGOTRADER.APP" in their name will be highlighted in gold colors</li>
    </ChangelogInstance>
  );
}

export default TwoDotFive;