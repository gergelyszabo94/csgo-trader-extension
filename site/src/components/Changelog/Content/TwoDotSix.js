import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotSix = () => {
  return (
    <ChangelogInstance version="2.6" date="2020-07-02" releaseNotes={true}>
      <li>
        Added option to customize the number of community market history items to show per page <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added market links and starting at prices to market history events <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added outbid and outbid by 1% buttons to existing buy orders <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added instant buy button to market listings to buy items without confirmation. <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added place highest order and quick place buy order button to market listings <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added instant and quicksell buttons to inventory items <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Quantity is now taken into consideration when calculating total buy orders value, also showing the amount of "free space" for orders<GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added <NewTabLink to="https://skinbaron.com/partner/gery">Skinbaron</NewTabLink> partner links to Real money sites<GithubIssueLink issueNumber={325} />
      </li>
      <li>
        Removed empty float bars from Agent listings <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added options to show only the float value or always expand the float technical menu on market listings <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added option to set a default market listing ordering mode <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added paint index and paint seed sorting modes <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Added tradability and bookmark/notify support to Dota 2 and Team Fortress 2 items <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        The selected items are also placed in a table in other users' inventories <GithubIssueLink issueNumber={249} />
      </li>
      <li>
        Performance improvements
      </li>
      <li>
        Added new team recruitment and giveaway spam patterns to report
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSix;