import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotNine = () => {
  return (
    <ChangelogInstance version="1.9" date="2019-03-10">
      <li>You can now add your Steam API key in the option - needed for some future functions</li>
      <li>Fixed bug where clicking on notifications would open multiple windows</li>
      <li>The options page got a more refined look with:</li>
      <ul>
        <li>Flip switches instead of checkboxes</li>
        <li>Editable text fields now pop up for better editing</li>
        <li>Icons</li>
      </ul>
      <li>"Bookmark and notify" is out of preview with:</li>
      <ul>
        <li>Improved design</li>
        <li>Notification options</li>
        <li>Links to: the owner's profile, the item's market page, the owner's trade link</li>
        <li>Icons</li>
      </ul>
    </ChangelogInstance>
  );
}

export default OneDotNine;