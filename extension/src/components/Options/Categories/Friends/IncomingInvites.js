import React, { useState, useEffect } from 'react';
import Invite from 'components/Options/Categories/Friends/Invite';
import { currencies } from 'utils/static/pricing';

const IncomingInvites = () => {
  const [invites, setInvites] = useState([]);
  const [curr, setCurr] = useState(currencies.USD);

  useEffect(() => {
    chrome.storage.local.get(['friendRequests', 'currency'], ({ friendRequests, currency }) => {
      setCurr(currencies[currency]);
      setInvites(friendRequests.inviters);
    });
  }, []);


  return (
    <div>
      <h5>Incoming Friend Requests</h5>
      <table className="spacedTable">
        <thead>
          <tr>
            <th title="Steam username of requester at the time of the extension noticing the invite">Username</th>
            <th title="The user's steam avatar">Avatar</th>
            <th title="The user's Steam profile level">Steam Level</th>
            <th title="The user's Steam community profile's privacy state">Profile</th>
            <th title="The user's CS:GO inventory value">Inventory Value</th>
          </tr>
        </thead>
        <tbody>
          {
            invites.map((invite, index) => {
              return (
                <Invite
                  key={invite.steamID}
                  details={invite}
                  index={index}
                  currency={curr}
                />
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};

export default IncomingInvites;
