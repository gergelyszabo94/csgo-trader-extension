import { getPlayerBans, getPlayerSummaries } from 'utils/ISteamUser';

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

const evaluateRequest = (invite, rules) => {
  let verdict = {
    action: 'no_action',
    appliedRule: 0,
  };
  rules.forEach((rule, index) => {
    if (rule.active) {
      if (rule.condition.type === 'profile_private') {
        if (rule.condition.value && invite.summary.communityvisibilitystate === 1) {
          verdict = {
            action: rule.action,
            appliedRule: index,
          };
        }
      }
    }
  });
  return verdict;
};

const executeVerdict = (invite, verdict) => {
  switch (verdict) {
    case 'ignore': ignoreRequest(invite.steamID); break;
    case 'block': blockRequest(invite.steamID); break;
    case 'accept': acceptRequest(invite.schema); break;
    default: break;
  }
};

const updateFriendRequest = () => {
  getFriendRequests().then((inviters) => {
    // inviters here is the freshly loaded list
    // it only includes limited details though
    const upToDateInviterIDs = inviters.map((inviter) => {
      return inviter.steamID;
    });

    // loading previous invite info from storage that could be stale
    chrome.storage.local.get(['friendRequests', 'friendRequestEvalRules'], ({ friendRequests, friendRequestEvalRules }) => {
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

      getPlayerSummaries(newInviteIDs).then((summaries) => {
        const newInvitesWithSummaries = newInvites.map((invite) => {
          return {
            ...invite,
            summary: summaries[invite.steamID],
          };
        });

        getPlayerBans(newInviteIDs).then((bans) => {
          const newInvitesWithBans = newInvitesWithSummaries.map((invite) => {
            return {
              ...invite,
              bans: bans[invite.steamID],
            };
          });

          const evaluationEvents = [];

          const evaluatedInvites = newInvitesWithBans.map((invite) => {
            const requestVerdict = evaluateRequest(invite, friendRequestEvalRules);
            if (requestVerdict.action !== 'no_action') {
              executeVerdict(invite, requestVerdict.action);
              evaluationEvents.push(
                createFriendRequestEvent(invite, requestVerdict.action),
              );
            }
            return {
              ...invite,
              evaluation: requestVerdict,
            };
          });

          logFriendRequestEvents(evaluationEvents);

          chrome.storage.local.set({
            friendRequests: {
              inviters: [...unChangedInvites, ...evaluatedInvites],
              lastUpdated: Date.now(),
            },
          }, () => {});
        });
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
