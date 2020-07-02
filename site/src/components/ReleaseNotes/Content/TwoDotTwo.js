import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotTwo = () => {
  return  (
    <ReleaseNote
      version="2.2"
      title="Discussion bumping - security improvements"
    >
      <div className="text-danger">
        It was brought to my attention that bumping discussions is against Steam's
        <NewTabLink to="https://support.steampowered.com/kb_article.php?ref=4045-USHJ-3810&l=english"> Rules and Guidelines For Steam: Discussions, Reviews, and User Generated Content </NewTabLink>
        so use it at your own risk!
      </div>
      <p>
        After publishing the version before this I got the results of a code review form Mozilla.
        They flagged some security issues that I spent most of the work addressing.
        I did manage to include a simple, yet potentially powerful feature, let me show you what it is and how it works.
        If you are someone who advertises trades in Steam groups or on the trading forum this is for you!
        You might have seen people who keep commenting under their own posts to make it appear before others' or you might have done it yourself manually.
        You don't have to anymore! CSGOTrader adds a checkbox to discussion pages that if you check your problem is solved!
        The extension will keep posting new bumping comments under these posts for you every 30 minutes while removing older ones.
        All you have to do is to keep the page that you want this to happen on open.
        On the screenshot below you can see the checkbox mentioned above.
        Also notice the deleted comment and the new bumping comment, all done automatically!
        And don't worry, others don't see you removed comments, only the last one!
      </p>
      <ShowcaseImage src='/img/release-notes/discussion_autobumping.png' title='Autobumping example screenshot'/>
      <p>
        I hope you like it and as usual, let me know if you find any problems with it!
      </p>
    </ReleaseNote>
  );
};

export default TwoDotTwo;