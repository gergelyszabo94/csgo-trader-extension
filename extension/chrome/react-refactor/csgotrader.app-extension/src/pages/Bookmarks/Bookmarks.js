/* globals trackEvent*/

import React, { useEffect, useState, Fragment } from "react";

import Bookmark from "components/Bookmark/Bookmark";

const Bookmarks = () => {
    trackEvent({
        type: 'pageview',
        action: 'ExtensionBookmarksView'
    });

    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        document.title = 'Bookmarks';

        chrome.storage.local.get('bookmarks', (result) => {
            console.log(result.bookmarks);
            setBookmarks(result.bookmarks)
        });
    }, []);

    return (
        <Fragment>
            <h1>Bookmark and Notify</h1>
            <div className='row'>
                {bookmarks.map((bookmark, index) => {
                    return ( <Bookmark key={index} bookmarkData={bookmark}/> );
                })}
            </div>
        </Fragment>
    );
};

export default Bookmarks;
