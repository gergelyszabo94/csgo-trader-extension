/* globals trackEvent*/

import React, { useEffect, useState } from "react";

import Bookmark from "components/Bookmarks/Bookmark/Bookmark";

const Bookmarks = () => {
    trackEvent({
        type: 'pageview',
        action: 'ExtensionBookmarksView'
    });

    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        document.title = 'Bookmarks';

        chrome.storage.local.get('bookmarks', (result) => {
            setBookmarks(result.bookmarks)
        });
    }, []);

    return (
        <div className='container'>
            <h1>Bookmark and Notify</h1>
            <div className='row'>
                {bookmarks.map((bookmark, index) => {
                    return ( <Bookmark key={index} bookmarkData={bookmark}/> );
                })}
            </div>
        </div>
    );
};

export default Bookmarks;
