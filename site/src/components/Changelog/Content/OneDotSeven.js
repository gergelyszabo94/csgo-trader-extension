import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotSeven = () => {
  return (
    <ChangelogInstance version="1.7" date="2019-02-18">
      <li>Added NSFW filter mode that blocks profile backgrounds, artwork and avatars - against anime boobs</li>
      <li>Added "Reocc" button to your own profile</li>
      <li>Fixed a bug where Market links of other exteriors would not work on Souvenir items</li>
      <li>Added function that automatically flags scam comments on profiles</li>
      <li>Applied a dark gray and orange style to the Options, Changelog an popup pages</li>
      <li>Doppler phases are now visible on market pages</li>
    </ChangelogInstance>
  );
}

export default OneDotSeven;