import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotTwelve = () => {
  return (
    <ChangelogInstance version="1.12" date="2019-04-07">
      <li>Added basic support for internationalization  - if you are willing to help me translate the extension to other languages please contact me</li>
      <li>Active inventory item is now highlighted when colorful inventory is enabled</li>
      <li>Added StatTrak and Souvenir indicators to items - placed before exterior</li>
      <li>Fixed "other exteriors" links not working on some items</li>
      <li>Steamrep.com banned scammers are marked on their profile and in the trade window with by a different background and a warning ribbon on top</li>
      <li>Users who uninstall the extension are now prompted to complete a survey on why they uninstalled - how it can be improved</li>
      <li>Added csgolounge.com auto-bumping</li>
      <li>Added CSGOTraders.net auto-bumping</li>
    </ChangelogInstance>
  );
}

export default OneDotTwelve;