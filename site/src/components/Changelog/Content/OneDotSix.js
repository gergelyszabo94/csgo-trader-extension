import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotSix = () => {
  return (
    <ChangelogInstance version="1.6" date="2019-02-10">
      <li>Added this changelog page</li>
      <li>Users now receive notification when the extension updates</li>
      <li>Added "+rep" button to profiles</li>
      <li>Fixed a bug where users did not get their default options set when updating the extension</li>
    </ChangelogInstance>
  );
}

export default OneDotSix;