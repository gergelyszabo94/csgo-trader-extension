import React, { useState } from "react";
import Countdown from "./Countdown";
import NewTabLink from "components/NewTabLink/NewTabLink";
import CustomModal from "components/CustomModal/CustomModal";
import FlipSwitch from "components/FlipSwitch/FlipSwitch";
import Select from "components/Select/Select";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faChartLine,
    faTrash,
    faUser,
    faLink,
    faBell,
    faComment
} from "@fortawesome/free-solid-svg-icons";

const Bookmark = (props) => {
    console.log(props);
    const notificationTypes = [
        {
            key: 'chrome',
            text: 'Browser desktop notification'
        },
        {
            key: 'alert',
            text: 'Browser alert (to focus)'
        }
    ];

    const { itemInfo, notifTime, nofitType, notify, owner } = props.bookmarkData;
    const imageSRC = `https://steamcommunity.com/economy/image/${itemInfo.iconURL}/256x256`;
    const exterior = itemInfo.exterior ?  itemInfo.exterior.localized_name : '';
    const displayName = itemInfo.name.split('| ')[1] ? itemInfo.name.split('| ')[1] : itemInfo.name;

    const [comment, setComment] = useState(props.bookmarkData.comment);
    const [notification, setNotification] = useState({ notify, nofitType, notifTime});

    const commentChangeHandler = (event) => {
        setComment(event.target.value);
    };

    const onNotifyChange = () => {
        setNotification({...notification, notify: !notification.notify})
    };

    const getNotifType = () => {
        return new Promise((resolve, reject) => { // only done with promise because on other places where the select component is used data is returned from storage
            resolve(notification.nofitType === undefined ? 'chrome' : notification.nofitType);
        });
    };

    const onNotifTypeChange = (value) => {
        setNotification({...notification, nofitType: value});
    };

    const saveComment = (closeModal) => {
        const bookmarkData = {...props.bookmarkData, comment: comment};
        props.editBookmark(bookmarkData);
        closeModal();
    };

    const saveNotification = (closeModal) => {
        const bookmarkData = {...props.bookmarkData, ...notification};
        props.editBookmark(bookmarkData);
        closeModal();
    };

    const removeBookmark = () => {
        props.removeBookmark(itemInfo.assetid);
    };

    return (
        <div className='col-xl-2 col-lg-3 col-md-6 my-2'>
            <div className={`bookmark bookmark__${itemInfo.quality.name}`}>
                <h5 className='itemName' title={itemInfo.name}>{displayName}</h5>
                <span>{exterior}</span>
                <div className='bookmark__image-container'>
                <span className='STS'>
                    <STS st={itemInfo.isStatrack} s={itemInfo.isSouvenir}/>
                </span>
                    <img src={imageSRC} alt={itemInfo.name} title={itemInfo.name}/>
                </div>
                <div className='bookmark__controls'>
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
                        <Action title={'View the item in the owner\'s inventory'}>
                            <NewTabLink to={`https://steamcommunity.com/profiles/${owner}/inventory/#730_2_${itemInfo.assetid}`}>
                                <FontAwesomeIcon icon={faLink} />
                            </NewTabLink>
                        </Action>
                        <Action title={'Open the owner\'s profile'}>
                            <NewTabLink to={`https://steamcommunity.com/profiles/${owner}`}>
                                <FontAwesomeIcon icon={faUser} />
                            </NewTabLink>
                        </Action>
                        <Action title='Add or edit a comment'>
                            <CustomModal modalTitle='Add your comment' opener={<FontAwesomeIcon icon={faComment} />} validator={saveComment}>
                        <textarea
                            className="custom-modal__input"
                            placeholder="Type your comment here"
                            value={comment}
                            onChange={commentChangeHandler}
                        />
                            </CustomModal>
                        </Action>
                        <Action title='Edit notifications options'>
                            <CustomModal modalTitle='Edit notifications options' opener={<FontAwesomeIcon icon={faBell} />} validator={saveNotification}>
                                <div className='center'>
                                    <Tradability tradability={itemInfo.tradability}/>
                                </div>
                                <div>
                                    Notify: <FlipSwitch id='notify' checked={notification.notify} onChange={onNotifyChange}/>
                                </div>
                                <div className={notification.notify ? null : 'hidden'}>
                                    <div>
                                        How do you want to be notified?
                                        <Select
                                            id='notificationType'
                                            foreignChangeHandler={onNotifTypeChange}
                                            foreignUseEffect={getNotifType}
                                            options={notificationTypes}
                                        />
                                    </div>
                                    <div>
                                        When do you want to be notified?
                                        <Select
                                            id='notificationType'
                                            foreignChangeHandler={onNotifTypeChange}
                                            foreignUseEffect={getNotifType}
                                            options={notificationTypes}
                                        />
                                    </div>
                                    {`${notification.notifTime} ${notification.nofitType} ${notification.notify} ${owner}`}
                                </div>
                            </CustomModal>
                        </Action>
                        <Action title='Delete bookmark'>
                            <FontAwesomeIcon icon={faTrash} onClick={removeBookmark}/>
                        </Action>
                    </div>
                    <div className='center'>
                        <Tradability tradability={itemInfo.tradability}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tradability = (props) => {
    const { tradability } = props;

    if (tradability === 'Tradable') {
        return (<span>{tradability}</span>);
    }
    else if (tradability === 'Not Tradable') {
        return (
            <div className='countdown'>
                Untradable
            </div>
        );
    }
    else {
        return (
            <Countdown tradability={tradability}/>
        );
    }
};

const Action = (props) => {
    return (
        <span className='action' title={props.title}>
          {props.children}
      </span>
    )
};

const STS = (props) => {
    if (props.st) {
        return (
            <span className='statTrak'>
                StatTrak™
            </span>
        );
    }
    else if (props.s) {
        return (
            <span className='souvenir'>
                Souvenir
            </span>
        );
    }
    else return null
};

export default Bookmark;
