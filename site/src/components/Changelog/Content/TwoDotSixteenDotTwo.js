import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const TwoDotSixteenDotTwo = () => {
  return (
    <ChangelogInstance version="2.16.2" date="2023-05-25">
      <li>
        Added optional arrow key navigation to inventories. Use the arrow keys to move the active inventory item, CTRL + Arrow keys to navigate between pages.
      </li>
      <li>
        Added multisell link to the selected items menu <GithubIssueLink issueNumber={488} />
      </li>
      <li>
        Added SkinBid links to market.
      </li>
      <li>
        The float precision option is now applied to float bars too.
      </li>
      <li>
        Fixed cancelling market trades adding checkboxes <GithubIssueLink issueNumber={489} />
      </li>
      <li>
        Fixed inventory values in trade offers not appearing for large inventories and certain currencies.
      </li>
      <li>
        Fixed some compatiblity issues with other extensions, fixed typos.
      </li>
    </ChangelogInstance>
  );
}

export default TwoDotSixteenDotTwo;