import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotFour = () => {
  return (
    <ChangelogInstance version="2.4" date="2020-05-28" releaseNotes={true}>
      <li>
        RealTime price loading was added to offers/inventories.
        <GithubIssueLink issueNumber={119}/>
      </li>
      <li>
        Added support for mass listing to other games and Steam items as well.
        <GithubIssueLink issueNumber={249}/>
      </li>
      <li>
        Skinbay was renamed everywhere in the extension to Skincay to reflect the company/domain name change
      </li>
      <li>
        Fixed a bug that removed tags from non-csgo items as well in inventories.
      </li>
      <li>
        Fixed quicksell price not getting selected automatically when it is higher than the extension price during mass listing
      </li>
      <li>
        Fixed unselected items not getting removed from he mass listing table
      </li>
      <li>
        Fixed a bug that broke the item actions menu for some rare games
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotFour;