import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import UserCredit from '../../Changelog/UserCredit';

const OneDotTwentyDotOne = () => {
  return (
    <ChangelogInstance version="1.20.1" date="2019-11-12">
      <li>Fixed Ursus Sapphire showing up as unknown phase.</li>
      <li>Added the same functionality to the Sent Offers page that the last update added to the Incoming Offers page</li>
      <li>Fixed a bug that made all the incoming offers disappear on the Incoming offers page if there wasn't at least one inactive offer.
        <UserCredit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</UserCredit>
      </li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyDotOne;