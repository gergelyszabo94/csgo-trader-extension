/* globals trackEvent*/

import React, { useEffect } from "react";

const Bookmarks = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionBookmarksView'
  });

  useEffect(() => {
    document.title = 'Bookmarks';
  }, []);

  return <div>Bookmarks</div>;
};

export default Bookmarks;
