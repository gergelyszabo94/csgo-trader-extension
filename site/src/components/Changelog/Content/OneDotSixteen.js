import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const OneDotSixteen = () => {
  return (
    <ChangelogInstance version="1.16" date="2019-07-27">
      <li>Added pricing function that is in BETA for now <GithubIssueLink issueNumber={8}/></li>
      <ul>
        <li>Prices shown in inventories</li>
        <li>Total inventory value shown in inventories</li>
        <li>Prices shown in trade offers</li>
        <li>Total tradable item's value shown in trade offers</li>
        <li>Total of items in offer shown</li>
        <li>Pricing provider can be chosen in Options, providers: CSGO Trader, CSGOBACKPACK, CS.MONEY, Bitskins, LOOT.FARM, CSGO.TM</li>
        <li>Changeable currency</li>
      </ul>
    </ChangelogInstance>
  );
}

export default OneDotSixteen;