import React, { useEffect, useState } from 'react';

import Bookmark from 'components/Bookmarks/Bookmark';
import { trackEvent } from 'utils/analytics';

export interface Bookmark {
    added: number;
    comment: string;
    itemInfo: ItemInfo;
    notifTime: string;
    notifType: string;
    notify: boolean;
    owner: string;
}

interface ItemInfo {
    appid: string;
    assetid: string;
    classid: string;
    contextid: string;
    dopplerInfo?: any;
    duplicates: Duplicates;
    exterior: Exterior;
    floatInfo: FloatInfo;
    iconURL: string;
    inspectLink: string;
    instanceid: string;
    isSouvenir: boolean;
    isStatrack: boolean;
    market_hash_name: string;
    marketable: number;
    marketlink: string;
    name: string;
    name_color: string;
    nametag?: any;
    owner: string;
    patternInfo?: any;
    position: number;
    price: Price;
    quality: Quality;
    starInName: boolean;
    stickerPrice?: any;
    stickers: any[];
    tradability: string;
    tradabilityShort: string;
    type: Type;
}

interface Type {
    float: boolean;
    internal_name: string;
    key: string;
    name: string;
}

interface Quality {
    backgroundcolor: string;
    color: string;
    name: string;
    prettyName: string;
}

interface Price {
    display: string;
    price: string;
}

interface FloatInfo {
    floatvalue: number;
    low_rank?: any;
    max: number;
    min: number;
    origin_name: string;
    paintindex: number;
    paintseed: number;
    stickers: any[];
}

interface Exterior {
    internal_name: string;
    localized_name: string;
    localized_short: string;
    name: string;
    short: string;
    type: string;
}

interface Duplicates {
    instances: string[];
    num: number;
}

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

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    const saveBookmarks = (bookmarksToSave) => {
        chrome.storage.local.set({ bookmarks: bookmarksToSave }, () => {
            setBookmarks(bookmarksToSave);
        });
    };

    const removeBookmark = (bookmarkData: Bookmark) => {
        const bookmarksToKeep = bookmarks.filter((bookmark) => {
            return bookmark != bookmarkData;
        });

        saveBookmarks(bookmarksToKeep);
    };

    const editBookmark = (bookmarkData: Bookmark) => {
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
    bookmarks: Bookmark[];
    remove: (bookmarkData: Bookmark) => void;
    edit: (bookmarkData: Bookmark) => void;
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
