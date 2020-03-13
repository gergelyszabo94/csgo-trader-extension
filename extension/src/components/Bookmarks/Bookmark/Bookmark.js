import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell, faChartLine, faComment, faEye, faLink, faTrash, faUser, faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import Modal from 'components/Modal/Modal';
import FlipSwitch from 'components/FlipSwitch/FlipSwitch';
import { determineNotificationDate, reverseWhenNotifDetails } from 'utils/notifications';
import { getOfferStyleSteamID } from 'utils/steamID';
import Countdown from './Countdown';

const Bookmark = ({
  bookmarkData, editBookmark, removeBookmark,
}) => {
  const {
    itemInfo, notifTime, notifType, notify, owner,
  } = bookmarkData;
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
    const newNotifTime = determineNotificationDate(itemInfo.tradability,
      minutesOrHours.current.value, numberOfMinutesOrHours.current.value,
      beforeOrAfter.current.value).toString();

    const newBookmarkData = {
      ...bookmarkData,
      notify: doNotify,
      notifType: notifTypeSelect.current.value,
      notifTime: newNotifTime,
    };

    editBookmark(newBookmarkData);

    if (doNotify) {
      chrome.runtime.sendMessage({
        setAlarm: {
          name: itemInfo.assetid,
          when: newNotifTime,
        },
      }, () => {
        closeModal();
      });
    } else {
      chrome.alarms.clear(
        itemInfo.assetid, () => {
          closeModal();
        },
      );
    }
  };

  const removeBookmarkFunction = () => {
    removeBookmark(itemInfo.assetid);
  };

  return (
    <div className="col-xl-2 col-lg-3 col-md-6 my-2">
      <div className={`bookmark bookmark__${itemInfo.quality.name}`}>
        <h5 className="itemName" title={itemInfo.name}>{displayName}</h5>
        <span>{exterior}</span>
        <div className="bookmark__image-container">
          <span className="STS">
            <STS st={itemInfo.isStatrack} s={itemInfo.isSouvenir} />
          </span>
          <img src={imageSRC} alt={itemInfo.name} title={itemInfo.name} />
        </div>
        <div className="bookmark__controls">
          <div className="actions">
            <Action title="Inspect the item in-game">
              <NewTabLink to={itemInfo.inspectLink}>
                <FontAwesomeIcon icon={faEye} />
              </NewTabLink>
            </Action>
            <Action title="Open the market listings page of the item">
              <NewTabLink to={itemInfo.marketlink}>
                <FontAwesomeIcon icon={faChartLine} />
              </NewTabLink>
            </Action>
            <Action title={'View the item in the owner\'s inventory'}>
              <NewTabLink to={`https://steamcommunity.com/profiles/${owner}/inventory/#730_2_${itemInfo.assetid}`}>
                <FontAwesomeIcon icon={faLink} />
              </NewTabLink>
            </Action>
            <Action title="Send a trade offer to the owner (if on friend list)">
              <NewTabLink to={`https://steamcommunity.com/tradeoffer/new/?partner=${getOfferStyleSteamID(owner)}`}>
                <FontAwesomeIcon icon={faExchangeAlt} />
              </NewTabLink>
            </Action>
            <Action title={'Open the owner\'s profile'}>
              <NewTabLink to={`https://steamcommunity.com/profiles/${owner}`}>
                <FontAwesomeIcon icon={faUser} />
              </NewTabLink>
            </Action>
            <Action title="Add or edit a comment">
              <Modal modalTitle="Add your comment" opener={<FontAwesomeIcon icon={faComment} />} validator={saveComment}>
                <div
                  contentEditable="true"
                  className="modalTextArea"
                  placeholder="Type your comment here"
                  onChange={commentChangeHandler}
                >
                  {comment}
                </div>
              </Modal>
            </Action>
            <Action title="Edit notifications options" className={(itemInfo.tradability === 'Tradable' || itemInfo.tradability === 'Not Tradable') ? 'hidden' : null}>
              <Modal modalTitle="Edit notifications options" opener={<FontAwesomeIcon icon={faBell} />} validator={saveNotification}>
                <div className="center">
                  <Tradability tradability={itemInfo.tradability} />
                </div>
                <div>
                  Notify:
                  {' '}
                  <FlipSwitch id="notify" checked={doNotify} onChange={onNotifyChange} />
                </div>
                <div className={doNotify ? null : 'hidden'}>
                  How do you want to be notified?
                  <div>
                    <select ref={notifTypeSelect} defaultValue={notifType} className="select">
                      <option value="chrome">Browser desktop notification</option>
                      <option value="alert">Browser alert (to focus)</option>
                    </select>
                  </div>
                  When do you want to be notified?
                  <div>
                    <input
                      type="number"
                      ref={numberOfMinutesOrHours}
                      defaultValue={whenDetails.numberOfMinutesOrHours}
                      className="numberPicker"
                    />
                    <select ref={minutesOrHours} defaultValue={whenDetails.minutesOrHours} className="select">
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                    </select>
                    <select ref={beforeOrAfter} defaultValue={whenDetails.beforeOrAfter} className="select">
                      <option value="before">before</option>
                      <option value="after">after</option>
                    </select>
                  </div>
                </div>
              </Modal>
            </Action>
            <Action title="Delete bookmark">
              <FontAwesomeIcon icon={faTrash} onClick={removeBookmarkFunction} />
            </Action>
          </div>
          <div className="center">
            <Tradability tradability={itemInfo.tradability} />
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
  if (tradability === 'Not Tradable') {
    return (
      <div className="countdown">
        Untradable
      </div>
    );
  }

  return (
    <Countdown tradability={tradability} />
  );
};

const Action = ({
  children, className, title,
}) => (
  <span className={`action ${className}`} title={title}>
    {children}
  </span>
);

const STS = ({
  st, s,
}) => {
  if (st) {
    return (
      <span className="statTrak">
                StatTrak™
      </span>
    );
  }
  if (s) {
    return (
      <span className="souvenir">
                Souvenir
      </span>
    );
  }
  return null;
};

export default Bookmark;
