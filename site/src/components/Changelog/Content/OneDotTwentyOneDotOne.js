import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotTwentyOneDotOne = () => {
  return (
    <ChangelogInstance version="1.21.1" date="2019-11-21" >
      <li>Fixed a bug where undefined would appear instead of the actual currency sign when Australian Dollars was the selected currency</li>
      <li>Fixed a bug where the extension would not function if the inventory contained an Agent skin (new item type)</li>
    </ChangelogInstance>
  );
}

export default OneDotTwentyOneDotOne;