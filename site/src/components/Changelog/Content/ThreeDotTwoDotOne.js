import React from 'react'
import ChangelogInstance from '../ChangelogInstance';
import GithubIssueLink from '../GithubIssueLink';

const ThreeDotTwoDotOne = () => {
  return (
    <ChangelogInstance version="3.2.1" date="2024-12-05">
      <li>
        Added pattern ids to attached charms in inventories
      </li>
      <li>
        Added sorting by Charm price in inventories and offers
      </li>
      <li>
        Added more detailed error message to market price loading
        <GithubIssueLink issueNumber={541} />
      </li>
      <li>
        Fixed in-browser, on-server inspect, sticker price and sticker wear on market pages
      </li>
      <li>
        Fixed applied stickers and attached charms not showing in inventories and offers
      </li>
      <li>
        Fixed some Pricempire lookup links
      </li>
    </ChangelogInstance>
  );
}

export default ThreeDotTwoDotOne;