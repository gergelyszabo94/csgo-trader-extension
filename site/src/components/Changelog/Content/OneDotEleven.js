import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotEleven = () => {
  return (
    <ChangelogInstance version="1.11" date="2019-04-01">
      <li>Added "Get Float Value" button to items in trade offers</li>
      <li>When clicked item names open the items' market page in inventories</li>
      <li>Added doppler phases to item names in inventories (instead of notes)</li>
      <li>Fixed a bug that misplaced item exteriors on doppler knives</li>
      <li>Items background and borders are now colored based on rarity or doppler phase</li>
      <li>Performance improvements when changing inventory pages</li>
    </ChangelogInstance>
  );
}

export default OneDotEleven;