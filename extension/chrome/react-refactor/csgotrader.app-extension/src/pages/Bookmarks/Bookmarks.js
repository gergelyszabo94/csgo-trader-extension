import React, { useEffect } from "react";

const Bookmarks = () => {
  useEffect(() => {
    document.title = 'Bookmarks';
  }, []);

  return <div>Bookmarks</div>;
};

export default Bookmarks;
