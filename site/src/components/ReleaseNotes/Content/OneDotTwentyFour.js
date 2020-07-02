import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const OneDotTwentyFour = () => {
  return  (
    <ReleaseNote
      version="1.24"
      title="Highlighted profiles, trade offer Widescreen goodness"
    >
      <p>Along with many bug fixes and other improvements this update brought two small features.</p>
      <p>Profiles with "csgotrader.app" in their name are highlighted with golden coloring.
        Similarly to holiday profiles it makes profiles stand out. It's applied on profiles, comments, friend lists, group member lists.
        I though I would give a little incentive to anyone nice enough to want to spread the word about the extension.
        Illustration:
      </p>
      <ShowcaseImage src='/img/release-notes/highlighted_profile.jpg' title='Golden highlighted profile'/>
      <p>
        The other feature is being able to move trade offer headers to the left on Widescreens.
        It's on by default, it should activate for most people if they have offers open full screen.
        If you don't like this feature you can head over to the extension options and look for "Offer header to left" and turn it off.
        Illustration:
      </p>
      <ShowcaseImage src='/img/release-notes/trade_offer_header_left.jpg' title='Trade offer header on the left'/>
    </ReleaseNote>
  );
};

export default OneDotTwentyFour;