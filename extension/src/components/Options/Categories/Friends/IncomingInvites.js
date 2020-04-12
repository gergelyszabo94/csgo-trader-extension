import React, { useState, useEffect } from 'react';
import Invite from 'components/Options/Categories/Friends/Invite';
import { currencies } from 'utils/static/pricing';

const IncomingInvites = () => {
  const [invites, setInvites] = useState([]);
  const [curr, setCurr] = useState(currencies.USD);
  const [sortingMode, setSortingMode] = useState('invent_value_desc');

  const removeInvite = (indexToRemove) => {
    const newInvites = invites.filter((invite, index) => {
      return index !== indexToRemove;
    });
    setInvites(newInvites);
  };

  const sortInvites = (sortBy, invitesToSort = invites) => {
    let sorted = [];
    if (sortBy === 'level_asc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite1.level - invite2.level;
      });
    } else if (sortBy === 'level_desc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite2.level - invite1.level;
      });
    } else if (sortBy === 'name_asc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        const name1 = invite1.name.toLowerCase();
        const name2 = invite2.name.toLowerCase();
        if (name1 < name2) return -1;
        if (name1 > name2) return 1;
        return 0;
      });
    } else if (sortBy === 'name_desc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        const name1 = invite1.name.toLowerCase();
        const name2 = invite2.name.toLowerCase();
        if (name1 > name2) return -1;
        if (name1 < name2) return 1;
        return 0;
      });
    } else if (sortBy === 'friends_asc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite1.commonFriends.length - invite2.commonFriends.length;
      });
    } else if (sortBy === 'friends_desc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite2.commonFriends.length - invite1.commonFriends.length;
      });
    } else if (sortBy === 'invent_value_asc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite1.csgoInventoryValue - invite2.csgoInventoryValue;
      });
    } else if (sortBy === 'invent_value_desc') {
      sorted = invitesToSort.sort((invite1, invite2) => {
        return invite2.csgoInventoryValue - invite1.csgoInventoryValue;
      });
    }
    setSortingMode(sortBy);
    setInvites(sorted);
  };

  const loadInvites = () => {
    chrome.storage.local.get(['friendRequests', 'currency'], ({ friendRequests, currency }) => {
      setCurr(currencies[currency]);
      sortInvites(sortingMode, friendRequests.inviters);
    });
  };

  useEffect(() => {
    loadInvites();
    setInterval(() => {
      loadInvites();
    }, 60000);
  }, []);

  return (
    <div className="my-5">
      <h5>Incoming Friend Requests</h5>
      <table className="spacedTable">
        <thead>
          <tr>
            <th
              title="Order by Steam username of requester at the time of the extension noticing the invite"
              className="clickAbleColumnHeader"
              onClick={() => {
                if (sortingMode !== 'name_asc') sortInvites('name_asc');
                else sortInvites('name_desc');
              }}
            >
              Username
            </th>
            <th
              title="Order by the user's Steam profile level"
              className="clickAbleColumnHeader"
              onClick={() => {
                if (sortingMode !== 'level_desc') sortInvites('level_desc');
                else sortInvites('level_asc');
              }}
            >
              Steam Level
            </th>
            <th title="The country the user has set on their Steam profile">Country</th>
            <th
              title="Order by how many common friends you and this user has"
              className="clickAbleColumnHeader"
              onClick={() => {
                if (sortingMode !== 'friends_desc') sortInvites('friends_desc');
                else sortInvites('friends_asc');
              }}
            >
              Common Friends
            </th>
            <th title="The user's Steam community profile's privacy state">Profile</th>
            <th
              title="Sort by the user's CS:GO inventory value"
              className="clickAbleColumnHeader"
              onClick={() => {
                if (sortingMode !== 'invent_value_desc') sortInvites('invent_value_desc');
                else sortInvites('invent_value_asc');
              }}
            >
              Inventory Value
            </th>
            <th title="Your trade offer history with the user">Offers</th>
            <th title="The summary fo the users's bans">Bans</th>
            <th title="Accept, ignore or block the user's request">Actions</th>
            <th title="The extension retries to gather all information for the friend request to be evaluated, this is the count of the retries">Evaluations</th>
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
                  remove={removeInvite}
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
