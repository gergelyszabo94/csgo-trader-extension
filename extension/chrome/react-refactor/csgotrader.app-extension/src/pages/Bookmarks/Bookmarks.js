/* globals trackEvent*/

import React, { useEffect, useState } from "react";

import Bookmark from "components/Bookmarks/Bookmark/Bookmark";

const Bookmarks = () => {
    trackEvent({
        type: 'pageview',
        action: 'ExtensionBookmarksView'
    });

    const saveBookmarks = (bookmarks) => {
        chrome.storage.local.set({bookmarks: bookmarks}, () => {
            setBookmarks(bookmarks);
        });
    };

    const removeBookmark = (assetID) => {
        const bookmarksToKeep = bookmarks.filter(bookmark => bookmark.itemInfo.assetid !== assetID);
        saveBookmarks(bookmarksToKeep);
    };

    const editBookmark = (bookmarkData) => {
        const newBookmarks = bookmarks.map(bookmark => {
            return bookmark.itemInfo.assetid === bookmarkData.itemInfo.assetid ? bookmarkData : bookmark;
        });
        saveBookmarks(newBookmarks);
    };

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
                    return (
                        <Bookmark
                            key={index}
                            bookmarkData={bookmark}
                            removeBookmark={removeBookmark}
                            editBookmark={editBookmark}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Bookmarks;
