import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotEightDotTwo = () => {
  return (
    <ChangelogInstance version="1.8.2" date="2019-03-02">
      <li>Removed webRequest and webRequestBlocking permissions - should be rightfully less scary for new users</li>
      <li>Fixed bug where loading private inventories would result in breakage</li>
      <li>Added more scam comment patterns for flagging</li>
      <li>"Bookmark and notify" improved styling, added link to item owner's profile</li>
    </ChangelogInstance>
  );
}

export default OneDotEightDotTwo;