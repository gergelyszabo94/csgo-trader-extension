import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import NewTabLink from '../../NewTabLink/NewTabLink';
import UserCredit from '../../Changelog/UserCredit';

const OneDotThirteenDotOne = () => {
  return (
    <ChangelogInstance version="1.13.1" date="2019-05-12">
      <li>Moved issue tracking from TODO file to
        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/issues'> Github issues</NewTabLink></li>
      <li>Stickers are now visible on community market listings without user hovering </li>
      <li>New logo, it's added to internal extension page navigation and pop-up too</li>
      <li>Fixed item names in inventories always appearing in English.
        <UserCredit to='https://steamcommunity.com/profiles/76561198291133191/'>B</UserCredit>
        <GithubIssueLink issueNumber={5}/></li>
      <li>Fixed "Don't Worry, I'm Pro" sticker breaking other stickers, if you encounter other stickers with commas in their name please let me know and I will apply the same fix
        <GithubIssueLink issueNumber={7}/></li>
      <li>Fixed Talon Sapphire showing up as "Unknown" <GithubIssueLink issueNumber={4}/></li>
      <li>"New operation" scam comments are getting auto-reported</li>
      <li>Fixed clicking inspect opening an unnecessary new tab
        <UserCredit to='https://steamcommunity.com/profiles/76561198335126703'>Antiim8♛</UserCredit>
        <GithubIssueLink issueNumber={3}/></li>
      <li>Fixed non-worn stickers condition showing up as "NAN%" <GithubIssueLink issueNumber={6}/></li>
      <li>Added an indication that an item was bookmarked when the user did not allow tabs api access to the extension
        <GithubIssueLink issueNumber={2}/></li>
      <li>Marking steamrep scammers' profile made optional <GithubIssueLink issueNumber={11}/></li>
    </ChangelogInstance>
  );
}

export default OneDotThirteenDotOne;