import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import UserCredit from '../../Changelog/UserCredit';

const OneDotElevenDotOne = () => {
  return (
    <ChangelogInstance version="1.11.1" date="2019-04-03">
      <li>Fixed a bug that caused doppler phases not to appear correctly on market listings</li>
      <li>Made item coloring more robust</li>
      <li>Fixed float indicator moving out of visible area on high float items
        <UserCredit to='https://steamcommunity.com/profiles/76561198335126703'>Antiim8♛</UserCredit>
      </li>
      <li>Fixed unnecessary info appearing on non-csgo item
        <UserCredit to='https://steamcommunity.com/profiles/76561198290209584'>hypoCHRIDT♛</UserCredit>
      </li>
      <li>Added more scam comment patterns for flagging</li>
    </ChangelogInstance>
  );
}

export default OneDotElevenDotOne;