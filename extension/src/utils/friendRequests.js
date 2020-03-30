import { getPlayerBans } from 'utils/utilsModular';

const getFriendRequests = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/my/friends/pending');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response);
      return null;
    }
    return response.text();
  }).then((body) => {
    if (body !== null) {
      const html = document.createElement('html');
      html.innerHTML = body;
      const receivedInvitesElement = html.querySelector('#search_results');
      const inviters = [];

      // TODO handle cases where the page does not load properly
      if (receivedInvitesElement !== null) {
        receivedInvitesElement.querySelectorAll('.invite_row').forEach((inviteRow) => {
          inviters.push({
            steamID: inviteRow.getAttribute('data-steamid'),
            accountID: inviteRow.getAttribute('data-accountid'),
            name: inviteRow.querySelector('.invite_block_name').firstElementChild.innerText,
            level: inviteRow.querySelector('.friendPlayerLevelNum').innerText,
          });
        });
      }
      resolve(inviters);
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const getGroupInvites = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/my/groups/pending');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response);
      return null;
    }
    return response.text();
  }).then((body) => {
    if (body !== null) {
      const html = document.createElement('html');
      html.innerHTML = body;
      const receivedInvitesElement = html.querySelector('#search_results');
      const invitedTo = [];

      if (receivedInvitesElement !== null) {
        receivedInvitesElement.querySelectorAll('.invite_row').forEach((inviteRow) => {
          const groupID = inviteRow.querySelector(
            '.linkStandard.btnv6_white_transparent.btn_small_tall',
          ).getAttribute('href').split('\', \'')[1];
          invitedTo.push({
            steamID: groupID,
            name: inviteRow.querySelector('.groupTitle').firstElementChild.innerText,
          });
        });
      }

      chrome.storage.local.set({
        groupInvites: {
          invitedTo,
          lastUpdated: Date.now(),
        },
      }, () => {
        resolve(invitedTo);
      });
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const makeFriendActionCall = (targetSteamID, action) => {
  chrome.storage.local.get(['steamIDOfUser', 'steamSessionID'], ({ steamIDOfUser, steamSessionID }) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const apiRequest = new Request(`https://steamcommunity.com/profiles/${steamIDOfUser}/friends/action`,
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${steamSessionID}&steamid=${steamIDOfUser}&ajax=1&action=${action}&steamids%5B%5D=${targetSteamID}`,
      });

    fetch(apiRequest).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      } else return response.json();
    }).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  });
};

const ignoreRequest = (steamIDToIgnore) => {
  makeFriendActionCall(steamIDToIgnore, 'ignore_invite');
};

const acceptRequest = (steamIDToAccept) => {
  makeFriendActionCall(steamIDToAccept, 'accept');
};

const blockRequest = (steamIDToBlock) => {
  makeFriendActionCall(steamIDToBlock, 'block');
};

const ignoreGroupRequest = (steamIDToIgnore) => {
  makeFriendActionCall(steamIDToIgnore, 'group_ignore');
};

const acceptGroupRequest = (steamIDToAccept) => {
  makeFriendActionCall(steamIDToAccept, 'group_accept');
};

const logFriendRequestEvents = (events) => {
  chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
    chrome.storage.local.set({
      friendRequestLogs: [...friendRequestLogs, ...events],
    }, () => {});
  });
};

const createFriendRequestEvent = (invite, type) => {
  return {
    type,
    steamID: invite.steamID,
    username: invite.name,
    timestamp: Date.now(),
  };
};

const updateFriendRequest = () => {
  getFriendRequests().then((inviters) => {
    // inviters here is the freshly loaded list
    // it only includes limited details though
    const upToDateInviterIDs = inviters.map((inviter) => {
      return inviter.steamID;
    });

    // loading previous invite info from storage that could be stale
    chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
      const staleInviterIDs = friendRequests.inviters.map((inviter) => {
        return inviter.steamID;
      });

      // if the invite was canceled by the sender or
      // accepted, ignored or blocked by the user since the last check
      const disappearedInvites = friendRequests.inviters.filter((inviter) => {
        return !upToDateInviterIDs.includes(inviter.steamID);
      });

      const disappearedInviteEvents = disappearedInvites.map((invite) => {
        return createFriendRequestEvent(invite, 'disappeared');
      });

      const newInvites = inviters.filter((inviter) => {
        return !staleInviterIDs.includes(inviter.steamID);
      });

      const newInviteIDs = newInvites.map((invite) => {
        return invite.steamID;
      });

      const unChangedInvites = friendRequests.inviters.filter((inviter) => {
        return upToDateInviterIDs.includes(inviter.steamID);
      });

      getPlayerBans(newInviteIDs).then((bans) => {
        const newInvitesWithBans = newInvites.map((invite) => {
          const userBans = bans.find((ban) => {
            return ban.SteamId === invite.steamID;
          });
          return {
            ...invite,
            bans: userBans,
          };
        });

        chrome.storage.local.set({
          friendRequests: {
            inviters: [...unChangedInvites, ...newInvitesWithBans],
            lastUpdated: Date.now(),
          },
        }, () => {});
      });

      const newInviteEvents = newInvites.map((invite) => {
        return createFriendRequestEvent(invite, 'new');
      });

      logFriendRequestEvents([...newInviteEvents, ...disappearedInviteEvents]);
    });
  });
};

export {
  getFriendRequests, ignoreRequest, acceptRequest, blockRequest,
  getGroupInvites, ignoreGroupRequest, acceptGroupRequest,
  updateFriendRequest,
};
