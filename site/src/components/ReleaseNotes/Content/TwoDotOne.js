import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const TwoDotOne = () => {
  return  (
    <ReleaseNote
      version="2.1"
      title="Friend request evaluation, items present in other offers indicated"
      video="https://www.youtube.com/embed/XeXiAItf5s4"
    >
      <div className="text-danger">
        There was a bug identified in this update that causes features to break.
        If you are facing issues and are still on this version you can work around it:
        Make sure you have your Steam API key set in the options the  go to your inventory, click "Trade offers".
        This opens the incoming trade offers page and the extension updates the active offer information, fixing the problem.
      </div>
      <p>
        Two new features, several bug fixes and smaller improvements were made in this update.
        It's easier to show the changes in a video format so I made one of those too this time:
      </p>
      <p>
        The feature I put a lot of work in is what I call "Friend request evaluation automation".
        You can find it in the options under "Friends, Groups and Invites".
        This is personally a huge help and time saver for me so I am very happy that it's out now.
        I have been testing it on my account the past week or so and it probably saved me hours of work already.
        I personally get around 100 friend requests a day.
        If I were to talk to everyone who adds me than that would be the only thing I ever do.
        This is why I have to limit who I accept to my friend list and allocate time to talk to.
        I trade for profit so I have been trying to accept people who are good prospects.
        I set certain rules who I accept to make my life easier.
        I was using these rules manually up to this point, but now my extension does it for me automatically.
        I have the above rules set myself:
      </p>
      <ShowcaseImage src='/img/release-notes/invite_rules.png' title='The rules I have set.'/>
      <p>
        There are a bunch of conditions and 3 actions so plenty of combinations to play with, be creative!
      </p>
      <p>
        You can check your friend request history and what actions the extension has taken if any for the last week.
        Here is a snippet of mine:
      </p>
      <ShowcaseImage src='/img/release-notes/request_history.png' title='My friend request history'/>
      <p>
        The list of incoming friend requests is also available with detailed information about each user.
      </p>
      <ShowcaseImage src='/img/release-notes/incoming_requests_table.png' title='My incoming friend requests'/>
      <p>
        The other major new feature is to be able to see if an items is present in other offers (in case of trade offers).
        Or if it is in any offers (indicated in inventories).
        Here is how it looks in practice. The M9 in question has an indicator as it is present in two other offers.
        Clicking that indicator adds links to the other offers.
      </p>
      <ShowcaseImage src='/img/release-notes/in_offer_indicator.png' title='Item in-offer indicator'/>
    </ReleaseNote>
  );
};

export default TwoDotOne;