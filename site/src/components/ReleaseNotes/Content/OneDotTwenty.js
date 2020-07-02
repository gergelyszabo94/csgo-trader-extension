import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const OneDotTwenty = () => {
  return  (
    <ReleaseNote
      version="1.20"
      title="Incoming trade offers features"
    >
      <p>I have worked quite a bit on this and I think it ended up pretty nice and useful so I want as many
        people to use it as possible.
        Unfortunately to do so you have to add your Steam API key in the options first.
        I tried solving this without that but it's not really possible to do so while offering appropriate
        user experience.
        If you don't have your API key set then all you will notice is a note on top of the trade offers
        page advising to add your API key and linking to this page.</p>
      <p>These are the features that you are missing if you don't have it set:</p>
      <ul>
        <li>Incoming offers summary showing the number of profitable offers and potential profit</li>
        <li>Option to sort by profit, loss, received time, etc.</li>
        <li>Prices, total per side, profit or loss per trade shown</li>
        <li>Exteriors, doppler phases, colors, etc.</li>
        <li>Float values in case they were loaded for those items previously</li>
      </ul>
      Illustrated in the bellow screenshot:
      <ShowcaseImage src='/img/release-notes/incomingoffersfeaturesfull_annotated.jpg' title='Incoming offers features'/>
    </ReleaseNote>
  );
};

export default OneDotTwenty;