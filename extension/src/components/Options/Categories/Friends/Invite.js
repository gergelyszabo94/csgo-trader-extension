import React, { useEffect, useState } from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { prettyPrintPrice } from 'utils/pricing';
import {
  acceptRequest, ignoreRequest, blockRequest, getBansSummaryText, updateFriendRequest,
} from 'utils/friendRequests';
import { prettyTimeAgo } from 'utils/dateTime';
import { faUserSlash, faUserPlus, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const Invite = ({
  details, currency, index, remove,
}) => {
  const [offerHistory, setOfferHistory] = useState({
    offers_received: 0,
    offers_sent: 0,
    last_received: 0,
    last_sent: 0,
  });

  const onAcceptFriend = () => {
    acceptRequest(details.steamID);
    remove(index);
    updateFriendRequest();
  };

  const onIgnoreFriend = () => {
    ignoreRequest(details.steamID);
    remove(index);
    updateFriendRequest();
  };

  const onBlockFriend = () => {
    blockRequest(details.steamID);
    remove(index);
    updateFriendRequest();
  };

  useEffect(() => {
    chrome.storage.local.get([`offerHistory_${details.steamID}`], (result) => {
      const offerHistoryFromStorage = result[`offerHistory_${details.steamID}`];
      if (offerHistoryFromStorage) setOfferHistory(offerHistoryFromStorage);
    });
  }, []);

  const invValue = details.csgoInventoryValue && details.csgoInventoryValue !== 'private'
    ? prettyPrintPrice(currency.short, parseInt(details.csgoInventoryValue))
    : '-';

  return (
    <tr>
      <td>
        <NewTabLink to={`https://steamcommunity.com/profiles/${details.steamID}`}>
          {details.name}
        </NewTabLink>
      </td>
      <td>
        {details.level}
      </td>
      <td>
        {
          details.summary && details.summary.loccountrycode
            ? (
              <img
                src={`https://steamcommunity-a.akamaihd.net/public/images/countryflags/${details.summary.loccountrycode.toLowerCase()}.gif`}
                alt={`${details.summary.loccountrycode} flag`}
                title={`${details.summary.loccountrycode} flag`}
              />
            )
            : ''
        }
      </td>
      <td>
        {
          details.commonFriends !== undefined
            ? details.commonFriends.length
            : '-'
        }
      </td>
      <td>
        {
          details.summary
            ? details.summary.profilestate === 1
              ? 'Public'
              : 'Private'
            : ''
        }
      </td>
      <td>
        <NewTabLink to={`https://steamcommunity.com/profiles/${details.steamID}/inventory/`}>
          {invValue}
        </NewTabLink>
      </td>
      <td>
        <span title={`Last: ${prettyTimeAgo(offerHistory.last_received)}`}>
          Received:&nbsp;
          {offerHistory.offers_received}
        </span>
        &nbsp;
        <span title={`Last: ${prettyTimeAgo(offerHistory.last_sent)}`}>
          Sent:&nbsp;
          {offerHistory.offers_sent}
        </span>
      </td>
      <td>
        {getBansSummaryText(details.bans, details.steamRepInfo)}
      </td>
      <td>
        <CustomA11yButton action={onAcceptFriend} title="Accept friend request" className="mx-1">
          <FontAwesomeIcon icon={faUserPlus} />
        </CustomA11yButton>
        <CustomA11yButton action={onIgnoreFriend} title="Ignore friend request" className="mx-1">
          <FontAwesomeIcon icon={faUserMinus} />
        </CustomA11yButton>
        <CustomA11yButton action={onBlockFriend} title="Block friend request" className="mx-1">
          <FontAwesomeIcon icon={faUserSlash} />
        </CustomA11yButton>
      </td>
      <td>{details.evalTries}</td>
    </tr>
  );
};

export default Invite;
