import React from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { prettyPrintPrice } from 'utils/pricing';
import { getBansSummaryText } from 'utils/friendRequests';

const Invite = ({ details, currency }) => {
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
        {getBansSummaryText(details.bans, details.steamRepInfo)}
      </td>
      <td>{details.evalTries}</td>
    </tr>
  );
};

export default Invite;
