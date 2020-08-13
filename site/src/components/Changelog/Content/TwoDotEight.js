import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotEight = () => {
  return (
    <ChangelogInstance version="2.8" date="2020-08-13" >
      <li>
        Added new pricing providers: Buff, Exo, swapp.gg and csgoempire <GithubIssueLink issueNumber={347} />
      </li>
      <li>
        Trade Offer Automation is out of BETA, added incoming offers summary <GithubIssueLink issueNumber={152} />
      </li>
      <li>
        Added sound notifications and related options
      </li>
      <li>
        Added options to get notifications about friend request, comments and new inventory items
      </li>
      <li>
        Added option to show the buy and sell orders chart for non-commodity items
      </li>
      <li>
        Added option to show the recent activity menu for non-commodity items
      </li>
      <li>
        Added option to show the number of incoming trade offers on the extension badge
      </li>
      <li>
        Added default market listing sorting mode <GithubIssueLink issueNumber={345} />
      </li>
      <li>
        Added links to container (cases and capsules) contents linking to community market searches
      </li>
      <li>
        Added a "Look up similar stickers" link to Sticker market pages linking to community market searches
      </li>
      <li>
        Added "Go to" a specific community market search page
      </li>
      <li>
        Added a refresh button to the Trade Offer History page
      </li>
      <li>
        Fixed a bug where offers were not always successfully accepted per the automation rules
      </li>
      <li>
        Fixed a bug where mass listing price would change to lowest listing price even if user price was selected
      </li>
      <li>
        Added Twitch giveaway spam patterns to report
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotEight;