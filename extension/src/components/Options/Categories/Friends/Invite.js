import React from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { prettyPrintPrice } from 'utils/pricing';

const Invite = ({ details, currency }) => {
  console.log(details);
  return (
    <tr>
      <td>
        <NewTabLink to={`https://steamcommunity.com/profiles/${details.steamID}`}>
          {details.name}
        </NewTabLink>
      </td>
      <td>
        Pic
      </td>
      <td>
        {details.level}
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
            ? prettyPrintPrice(currency.short, details.csgoInventoryValue)
            : '-'
        }
      </td>
    </tr>
  );
};

export default Invite;
