import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const OneDotSixteenDotOne = () => {
  return (
    <ChangelogInstance version="1.16.1" date="2019-07-30" >
      <li>Fixed extension breaking if the pricing info was not successfully set for the first time</li>
      <li>Fixed quick decline trader offers option not being settable through the options page</li>
      <li>Fixed API key modal not hiding when successfully set</li>
    </ChangelogInstance>
  );
}

export default OneDotSixteenDotOne;