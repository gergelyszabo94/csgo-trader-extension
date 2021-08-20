import React, { useState } from 'react';
import { determineNotificationDate, reverseWhenNotifDetails } from 'utils/notifications';
import {
    faBell,
    faChartLine,
    faComment,
    faExchangeAlt,
    faEye,
    faLink,
    faTrash,
    faUser,
} from '@fortawesome/free-solid-svg-icons';

import Action from 'components/Bookmarks/Bookmark/Action';
import FlipSwitch from 'components/FlipSwitch/FlipSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'components/Modal/Modal';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import STS from 'components/Bookmarks/Bookmark/STS';
import Tradability from 'components/Bookmarks/Bookmark/Tradability';
import { getItemInventoryLink } from 'utils/simpleUtils';
import { getOfferStyleSteamID } from 'utils/steamID';

const Bookmark = ({ bookmarkData, editBookmark, removeBookmark }) => {
    const { added, itemInfo, notifTime, notifType, notify, owner } = bookmarkData;
    const imageSRC = `https://steamcommunity.com/economy/image/${itemInfo.iconURL}/256x256`;
    const exterior = itemInfo.exterior ? itemInfo.exterior.localized_name : '';
    const displayName = itemInfo.name.split('| ')[1] ? itemInfo.name.split('| ')[1] : itemInfo.name;

    const [comment, setComment] = useState(bookmarkData.comment);
    const [doNotify, setDoNotify] = useState(notify);

    const whenDetails = reverseWhenNotifDetails(itemInfo.tradability, notifTime);

    const notifTypeSelect = React.createRef();
    const numberOfMinutesOrHours = React.createRef();
    const minutesOrHours = React.createRef();
    const beforeOrAfter = React.createRef();

    const commentChangeHandler = (event) => {
        setComment(event.target.value);
    };

    const onNotifyChange = () => {
        setDoNotify(!doNotify);
    };

    const saveComment = (closeModal) => {
        const newBookmarkData = { ...bookmarkData, comment };
        editBookmark(newBookmarkData);
        closeModal();
    };

    const saveNotification = (closeModal) => {
        const newNotifTime = determineNotificationDate(
            itemInfo.tradability,
            minutesOrHours.current.value,
            numberOfMinutesOrHours.current.value,
            beforeOrAfter.current.value,
        ).toString();

        const newBookmarkData = {
            ...bookmarkData,
            notify: doNotify,
            notifType: notifTypeSelect.current.value,
            notifTime: newNotifTime,
        };

        editBookmark(newBookmarkData);

        if (doNotify) {
            chrome.runtime.sendMessage(
                {
                    setAlarm: {
                        name: `${itemInfo.appid}_${itemInfo.contextid}_${itemInfo.assetid}_${added}`,
                        when: newNotifTime,
                    },
                },
                () => {
                    closeModal();
                },
            );
        } else {
            chrome.alarms.clear(
                `${itemInfo.appid}_${itemInfo.contextid}_${itemInfo.assetid}_${added}`,
                () => {
                    closeModal();
                },
            );
        }
    };

    const removeBookmarkFunction = () => {
        removeBookmark(itemInfo.appid, itemInfo.contextid, itemInfo.assetid, added);
    };

    const qualityClass =
        itemInfo.quality !== undefined && itemInfo.quality !== null
            ? `bookmark__${itemInfo.quality.name}`
            : '';

    return (
        <div className={`bookmark ${qualityClass}`}>
            <h5 className='itemName' title={itemInfo.name}>
                {displayName}
            </h5>
            <div className='exterior'>{exterior}</div>
            <div className='bookmark__image-container'>
                <span className='STS'>
                    <STS st={itemInfo.isStatrack} s={itemInfo.isSouvenir} />
                </span>
                <img src={imageSRC} alt={itemInfo.name} title={itemInfo.name} />
            </div>
            <div className='actions'>
                <Action title='Add or edit a comment'>
                    <Modal
                        modalTitle='Add your comment'
                        opener={<FontAwesomeIcon icon={faComment} />}
                        validator={saveComment}
                    >
                        <textarea
                            className='modalTextArea'
                            placeholder='Type your comment here'
                            onChange={commentChangeHandler}
                            value={comment}
                        />
                    </Modal>
                </Action>
                <Action
                    title='Edit notifications options'
                    className={
                        itemInfo.tradability === 'Tradable' ||
                        itemInfo.tradability === 'Not Tradable'
                            ? 'hidden'
                            : null
                    }
                >
                    <Modal
                        modalTitle='Edit notifications options'
                        opener={<FontAwesomeIcon icon={faBell} />}
                        validator={saveNotification}
                    >
                        <div className='center'>
                            <Tradability tradability={itemInfo.tradability} />
                        </div>
                        <div>
                            Notify:{' '}
                            <FlipSwitch id='notify' checked={doNotify} onChange={onNotifyChange} />
                        </div>
                        <div className={doNotify ? null : 'hidden'}>
                            <div className='mt-3'>
                                How do you want to be notified?
                                <div>
                                    <select
                                        ref={notifTypeSelect}
                                        defaultValue={notifType}
                                        className='select'
                                    >
                                        <option value='chrome'>Browser desktop notification</option>
                                        <option value='alert'>Browser alert (to focus)</option>
                                    </select>
                                </div>
                            </div>
                            <div className='mt-3'>
                                When do you want to be notified?
                                <div>
                                    <input
                                        type='number'
                                        ref={numberOfMinutesOrHours}
                                        defaultValue={whenDetails.numberOfMinutesOrHours}
                                        className='numberInput numberInput__narrow'
                                    />
                                    <select
                                        ref={minutesOrHours}
                                        defaultValue={whenDetails.minutesOrHours}
                                        className='select'
                                    >
                                        <option value='minutes'>minutes</option>
                                        <option value='hours'>hours</option>
                                    </select>
                                    <select
                                        ref={beforeOrAfter}
                                        defaultValue={whenDetails.beforeOrAfter}
                                        className='select'
                                    >
                                        <option value='before'>before</option>
                                        <option value='after'>after</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </Action>
                <Action title='Delete bookmark'>
                    <FontAwesomeIcon icon={faTrash} onClick={removeBookmarkFunction} />
                </Action>
            </div>
            <div className='actions'>
                <Action title='Inspect the item in-game'>
                    <NewTabLink to={itemInfo.inspectLink}>
                        <FontAwesomeIcon icon={faEye} />
                    </NewTabLink>
                </Action>
                <Action title='Open the market listings page of the item'>
                    <NewTabLink to={itemInfo.marketlink}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </NewTabLink>
                </Action>
                <Action title={"View the item in the owner's inventory"}>
                    <NewTabLink
                        to={getItemInventoryLink(
                            owner,
                            itemInfo.appid,
                            itemInfo.contextid,
                            itemInfo.assetid,
                        )}
                    >
                        <FontAwesomeIcon icon={faLink} />
                    </NewTabLink>
                </Action>
                <Action title='Send a trade offer to the owner (if on friend list)'>
                    <NewTabLink
                        to={`https://steamcommunity.com/tradeoffer/new/?partner=${getOfferStyleSteamID(
                            owner,
                        )}`}
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                    </NewTabLink>
                </Action>
                <Action title={"Open the owner's profile"}>
                    <NewTabLink to={`https://steamcommunity.com/profiles/${owner}`}>
                        <FontAwesomeIcon icon={faUser} />
                    </NewTabLink>
                </Action>
            </div>
            <div className='center'>
                <Tradability tradability={itemInfo.tradability} />
            </div>
        </div>
    );
};

export default Bookmark;
