import React, { useEffect, useState } from 'react';

import Bookmark from 'components/Bookmarks/Bookmark';
import { bookmark } from 'types';
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

    const [bookmarks, setBookmarks] = useState<bookmark[]>([]);

    const saveBookmarks = (bookmarksToSave) => {
        chrome.storage.local.set({ bookmarks: bookmarksToSave }, () => {
            setBookmarks(bookmarksToSave);
        });
    };

    const removeBookmark = (bookmarkData: bookmark) => {
        const bookmarksToKeep = bookmarks.filter((bookmark) => {
            return bookmark != bookmarkData;
        });

        saveBookmarks(bookmarksToKeep);
    };

    const editBookmark = (bookmarkData: bookmark) => {
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

export interface BookmarkContentProps {
    bookmarks: bookmark[];
    remove: (bookmarkData: bookmark) => void;
    edit: (bookmarkData: bookmark) => void;
}

const BookmarkContent = ({ bookmarks, remove, edit }: BookmarkContentProps): JSX.Element => {
    if (bookmarks.length === 0)
        return (
            <>{"You don't have any bookmarks yet. You can bookmark items from user inventories!"}</>
        );

    return (
        <>
            {bookmarks.map((bookmark) => (
                <Bookmark
                    key={`${bookmark.itemInfo.appid}_${bookmark.itemInfo.contextid}_${bookmark.itemInfo.assetid}_${bookmark.added}`}
                    bookmarkData={bookmark}
                    removeBookmark={remove}
                    editBookmark={edit}
                />
            ))}
        </>
    );
};

export default Bookmarks;
