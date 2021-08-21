import React, { useEffect, useState } from 'react';

import Bookmark from 'components/Bookmarks/Bookmark';
import { trackEvent } from 'utils/analytics';

const Bookmarks = () => {
    trackEvent({
        type: 'pageview',
        action: 'ExtensionBookmarksView',
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.alert !== undefined) {
            // eslint-disable-next-line no-alert
            alert(`${request.alert} is now tradable!`);
            sendResponse({ alert: request.alert });
        }
    });

    const [bookmarks, setBookmarks] = useState([]);

    const saveBookmarks = (bookmarksToSave) => {
        chrome.storage.local.set({ bookmarks: bookmarksToSave }, () => {
            setBookmarks(bookmarksToSave);
        });
    };

    const removeBookmark = (appID, contextID, assetID, added) => {
        const bookmarksToKeep = bookmarks.filter((bookmark) => {
            return (
                bookmark.itemInfo.appid !== appID ||
                bookmark.itemInfo.contextid !== contextID ||
                bookmark.itemInfo.assetid !== assetID ||
                bookmark.added !== added
            );
        });

        saveBookmarks(bookmarksToKeep);
    };

    const editBookmark = (bookmarkData) => {
        const newBookmarks = bookmarks.map((bookmark) =>
            bookmark.itemInfo.assetid === bookmarkData.itemInfo.assetid &&
            bookmark.itemInfo.appid === bookmarkData.itemInfo.appid &&
            bookmark.itemInfo.contextid === bookmarkData.itemInfo.contextid &&
            bookmark.added === bookmarkData.added
                ? bookmarkData
                : bookmark,
        );
        saveBookmarks(newBookmarks);
    };

    useEffect(() => {
        document.title = 'Bookmarks';

        chrome.storage.local.get('bookmarks', (result) => {
            setBookmarks(result.bookmarks);
        });
    }, []);

    return (
        <div>
            <h1>Bookmark and Notify</h1>
            <div className='bookmarks'>
                <BookmarkContent
                    bookmarks={bookmarks}
                    remove={removeBookmark}
                    edit={editBookmark}
                />
            </div>
        </div>
    );
};

const BookmarkContent = (props) => {
    if (props.bookmarks.length === 0)
        return "You don't have any bookmarks yet. You can bookmark items from user inventories!";

    return props.bookmarks.map((bookmark) => (
        <Bookmark
            key={`${bookmark.itemInfo.appid}_${bookmark.itemInfo.contextid}_${bookmark.itemInfo.assetid}_${bookmark.added}`}
            bookmarkData={bookmark}
            removeBookmark={props.remove}
            editBookmark={props.edit}
        />
    ));
};

export default Bookmarks;
