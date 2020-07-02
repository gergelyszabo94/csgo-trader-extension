import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const Two = () => {
  return  (
    <ReleaseNote
      version="2.0"
      title="UI Refresh, Project Restructure"
    >
      <p>
        The major version bump might be a bit misleading since there were no significant new features added this time.
        The Popup, Options and Bookmarks pages were rewritten in React and thw whole project was modernized (now using modules, webpack, linting, etc.).
        Hopefully all this work will allow us to implement new features more quickly in the future.
        Enough of the technical crap, let me show you some of the new things!
        The small calculator included in the extension popup should now be easier to use.
      </p>
      <ShowcaseImage src='/img/release-notes/popup_calculator.png' title='New extension popup calculator'/>
      <p>
        The options page was tidied up and broken up into categories instead of a single long scrolling page:
      </p>
      <ShowcaseImage src='/img/release-notes/options_subnav.png' title='New categorized options menu'/>
      <p>
        Bookmarks became cards:
      </p>
      <ShowcaseImage src='/img/release-notes/bookmarks.png' title='Bookmark cards'/>
    </ReleaseNote>
  );
};

export default Two;