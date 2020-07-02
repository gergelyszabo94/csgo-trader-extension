import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotEight = () => {
  return (
    <ChangelogInstance version="1.8" date="2019-02-25">
      <li>Added navigation to the internal sites</li>
      <li>Added about page</li>
      <li>Added "Bookmark and notify" page and function - in preview for now</li>
      <li>Style changes</li>
      <li>"Tradable after" dates are now more compact in inventories</li>
      <li>Added more scam comment patterns for flagging</li>
    </ChangelogInstance>
  );
}

export default OneDotEight;