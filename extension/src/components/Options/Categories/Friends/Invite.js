import React, { useEffect, useState } from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { prettyPrintPrice } from 'utils/pricing';
import { getBansSummaryText } from 'utils/friendRequests';
import { prettyTimeAgo } from 'utils/dateTime';

const Invite = ({ details, currency }) => {
  const [offerHistory, setOfferHistory] = useState({
    offers_received: 0,
    offers_sent: 0,
    last_received: 0,
    last_sent: 0,
  });

  useEffect(() => {
    chrome.storage.local.get([`offerHistory_${details.steamID}`], (result) => {
      const offerHistoryFromStorage = result[`offerHistory_${details.steamID}`];
      if (offerHistoryFromStorage) setOfferHistory(offerHistoryFromStorage);
    });
  }, []);

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
          details.summary
            ? details.summary.profilestate === 1
              ? 'Public'
              : 'Private'
            : ''
        }
      </td>
      <td>
        {
          details.csgoInventoryValue && details.csgoInventoryValue !== 'private'
            ? prettyPrintPrice(currency.short, parseInt(details.csgoInventoryValue))
            : '-'
        }
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
      <td>{details.evalTries}</td>
    </tr>
  );
};

export default Invite;
