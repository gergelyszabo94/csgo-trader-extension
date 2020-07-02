import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import UserCredit from '../../Changelog/UserCredit';
import GithubIssueLink from '../GithubIssueLink';
import {Link} from 'react-router-dom';

const OneDotSeventeen = () => {
  return (
    <ChangelogInstance version="1.17" date="2019-08-20">
      <li>Created <Link to='/'>csgotrader.app</Link> site that showcases the features of the extension</li>
      <li>Moved the changelog pages from the extension to <Link to='/changelog/'>csgotrader.app/changelog</Link></li>
      <li>Created <Link to='/prices/'>csgotrader.app/prices</Link> page that explains how the extension calculates prices</li>
      <li>Added case keys, BTC, ETH and their denominations as currencies</li>
      <li>Adjusted the pricing algorithm to try to get a more accurate price for rare items and specify different prices for different Doppler phases</li>
      <li>Added feature to check the value of the items selected, the selection can be initiated by clicking the hand icon in inventories</li>
      <li>Added sorting feature to trade offers and inventories, items can be sorted by:</li>
      <ul>
        <li>Name (alphabetical)</li>
        <li>Tradability</li>
        <li>Price</li>
        <li>Position (default)</li>
        <li>And any of the mentioned reversed</li>
      </ul>
      <li>The default sorting mode can be set in the options menu</li>
      <li>All inventory items are loaded automatically to accommodate sorting and eliminate waiting when searching or filtering <GithubIssueLink issueNumber={47}/></li>
      <li>Bug fix: Turning off pricing has no effect in offers <GithubIssueLink issueNumber={62}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</UserCredit>
      </li>
      <li>Bug fix: Duplicate item count visible and broken in non-CS:GO inventories <GithubIssueLink issueNumber={57}/></li>
      <li>Receiving update notification is optional and off by default <GithubIssueLink issueNumber={58}/></li>
      <li>Made csgolounge and csgotraders permissions optional <GithubIssueLink issueNumber={31}/></li>
      <li>Pages where the extension adds features get reloaded when the extension updates <GithubIssueLink issueNumber={61}/></li>
      <li>Added option to make the other party's inventory active by default <GithubIssueLink issueNumber={25}/></li>
      <li>Applied compression to prices.json to save bandwidth and time</li>
    </ChangelogInstance>
  );
}

export default OneDotSeventeen;