import React, { useEffect, useState } from "react";

import Bookmark from "components/Bookmarks/Bookmark/Bookmark";
import { trackEvent } from 'js/utils/analytics';

const Bookmarks = () => {
    trackEvent({
        type: 'pageview',
        action: 'ExtensionBookmarksView'
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.alert !== undefined){
            alert(`${request.alert} is now tradable!`);
            sendResponse({alert: request.alert})
        }
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
        <div className='px-3'>
            <div className='container-fluid'>
                <h1>Bookmark and Notify</h1>
                <div className='row'>
                    <BookmarkContent bookmarks={bookmarks}/>
                </div>
            </div>
        </div>
    );
};

const BookmarkContent = (props) => {
    if (props.bookmarks.length === 0) return 'You don\'t have any bookmarks yet. You can bookmark items from user inventories!'
    else {
        props.bookmarks.map((bookmark, index) => {
            return (
                <Bookmark
                    key={index}
                    bookmarkData={bookmark}
                    removeBookmark={removeBookmark}
                    editBookmark={editBookmark}
                />
            );
        })
    }
};

export default Bookmarks;
