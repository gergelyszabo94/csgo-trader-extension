import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import UserCredit from '../UserCredit';

const TwoDotTwo = () => {
  const disclaimer = ` There was a bug identified in this update that causes features to break.
                    If you are facing issues and are still on this version you can work around it:
                    Make sure you have your Steam API key set in the options the  go to your inventory, click "Trade offers".
                    This opens the incoming trade offers page and the extension updates the active offer information, fixing the problem.`;

  return (
    <ChangelogInstance version="2.1" date="2020-04-13" releaseNotes={true} disclaimer={disclaimer}>
      <li>
        Items that are present in multiple offers are highlighted and on click reveal in which ones.
        <GithubIssueLink issueNumber={78}/>
      </li>
      <li>
        Added feature to make the extension act on incoming friend requests by user set rules.
        <GithubIssueLink issueNumber={134}/>
      </li>
      <li>
        CSGOTraders.net autobumping now navigates away from error page.
      </li>
      <li>
        Fixed a bug that made opening a link to a sent offer not showing the correct offer on the page after sorting.
      </li>
      <li>
        Added more spam comment patterns.
      </li>
      <li>
        A ribbon is added to Steam pages after the a new version of the extension was installed.
        It can be dismissed until the next update.
      </li>
      <li>
        Added an option to auto-ignore Steam group invites.
      </li>
      <li>
        Changed how partner trade offer history information is shown on profiles to be consistent with offers and inventories.
      </li>
      <li>
        Fixed a small bug that made "Favorite" buttons on artworks have a visible border.
      </li>
      <li>
        Fixed a select element styling and calculator layout in Firefox.
        <GithubIssueLink issueNumber={132}/>
      </li>
      <li>
        Fixed a bug that sometimes showed a buy order as not the highest if the highest's price was lower.
        <GithubIssueLink issueNumber={174}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198104585268'>caluo</UserCredit>
      </li>
      <li>
        Fixed a bug that made items in an offer disappear when the user tried to remove them.
        <GithubIssueLink issueNumber={168}/>
        <UserCredit to='https://steamcommunity.com/profiles/76561198103971634'>⸸ Dᴊᴇɴᴛ ⸸</UserCredit>
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotTwo;