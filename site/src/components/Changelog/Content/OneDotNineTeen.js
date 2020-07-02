import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import {Link} from 'react-router-dom';
import GithubIssueLink from '../GithubIssueLink';

const OneDotNineTeen = () => {
  return (
    <ChangelogInstance version="1.19" date="2019-10-06">
      <li>Add option for users to add comments, comment patterns that they want automatically reported <GithubIssueLink issueNumber={54}/></li>
      <li>Fixes a bug that added the username twice when replying to comments</li>
      <li>Fixes a bug that made the bookmarks not show up if one of the bookmarked item was a vanilla</li>
      <li>Added a short page about the Extension's Steam Group at: <Link to='/group/'>csgotrader.app/group</Link></li>
      <li>Item float values in inventories, offers and on market get loaded automatically</li>
      <li>Removes the now redundant "Get Float Info" buttons from offers and market pages</li>
      <li>Market "float bars" are now wider, stickers are centered and sticker condition is shown on hover</li>
    </ChangelogInstance>
  );
}

export default OneDotNineTeen;