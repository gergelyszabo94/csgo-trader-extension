import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotTen = () => {
  return (
    <ChangelogInstance version="1.10" date="2019-03-17">
      <li>Fixed a bug where notes of doppler phases stayed behind on other items</li>
      <li>Emoticon swastikas in profile comments are now flagged</li>
      <li>Real chat status is shown on profiles - not just online, away, snooze, etc. (needs API key)</li>
      <li>Float values are now visible in inventories (among other technical details)</li>
      <li>Icons got a nice tooltip instead of the plain title</li>
      <li>Use of chrome.tabs api made optional - it show a scary warning when the extension was installed. You can and should turn it on in the options for better user experience</li>
    </ChangelogInstance>
  );
}

export default OneDotTen;