import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import NewTabLink from '../../NewTabLink/NewTabLink';
import {Link} from 'react-router-dom';

const OneDotTwentyFive = () => {
  return (
    <ChangelogInstance version="1.25" date="2020-01-27" releaseNotes={true}>
      <li>Added price highlighting for sell listings and buy orders, remove/cancel all or selected, as well as totals, history type highlighting and market history export on the Community Market page.
        Thanks to <NewTabLink to='https://steamcommunity.com/profiles/76561198085748819'> Wiesenmeister </NewTabLink> and
        <NewTabLink to='https://www.reddit.com/user/timgotpaper'> /u/timgotpaper </NewTabLink>
        for the ideas.
        <GithubIssueLink issueNumber={88}/>
      </li>
      <li>Added <Link to='/faq/'> Frequently Asked Questions (FAQ) page</Link></li>
      <li>Removed unused activeTab permission</li>
      <li>Updated the <Link to='/privacy/'> Privacy page </Link> with more detailed information</li>
      <li>NSFW mode now removes "holiday cheer" as well</li>
      <li>CSGOLounge bumping now works on old.csgolounge.com/mytrades as well</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyFive;