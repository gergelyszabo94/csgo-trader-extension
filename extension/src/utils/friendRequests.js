import { getPlayerBans, getPlayerSummaries } from 'utils/ISteamUser';
import { actions, conditions, eventTypes } from 'utils/static/friendRequests';

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

const createFriendRequestEvent = (invite, type, appliedRule) => {
  let eventType;
  let rule;
  switch (type) {
    case actions.accept.key: {
      eventType = eventTypes.auto_accepted.key;
      rule = appliedRule;
      break;
    }
    case actions.ignore.key: {
      eventType = eventTypes.auto_ignored.key;
      rule = appliedRule;
      break;
    }
    case actions.block.key: {
      eventType = eventTypes.auto_blocked.key;
      rule = appliedRule;
      break;
    }
    default: eventType = type;
  }
  return {
    type: eventType,
    rule,
    steamID: invite.steamID,
    username: invite.name,
    timestamp: Date.now(),
  };
};

const evaluateRequest = (invite, rules) => {
  for (const [index, rule] of rules.entries()) {
    if (rule.active) {
      if (rule.condition.type === conditions.profile_private.key
        && invite.summary.communityvisibilitystate === 1) {
        return {
          action: rule.action,
          appliedRule: index + 1,
        };
      }
      if (rule.condition.type === conditions.profile_public.key
        && invite.summary.communityvisibilitystate === 3) {
        return {
          action: rule.action,
          appliedRule: index + 1,
        };
      }
      if (rule.condition.type === conditions.steam_level_under.key
        && parseInt(invite.level) <= rule.condition.value) {
        return {
          action: rule.action,
          appliedRule: index + 1,
        };
      }
      if (rule.condition.type === conditions.steam_level_over.key
        && parseInt(invite.level) > rule.condition.value) {
        return {
          action: rule.action,
          appliedRule: index + 1,
        };
      }
    }
  }

  return {
    action: actions.no_action.key,
    appliedRule: 0,
  };
};

const executeVerdict = (invite, verdict) => {
  switch (verdict) {
    case actions.ignore.key: ignoreRequest(invite.steamID); break;
    case actions.block.key: blockRequest(invite.steamID); break;
    case actions.accept.key: acceptRequest(invite.steamID); break;
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
        return createFriendRequestEvent(invite, eventTypes.disappeared.key);
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
          const evaluatedInvites = [];
          newInvitesWithBans.forEach((invite) => {
            const requestVerdict = evaluateRequest(invite, friendRequestEvalRules);
            if (requestVerdict.action !== actions.no_action.key) {
              executeVerdict(invite, requestVerdict.action);
              evaluationEvents.push(
                createFriendRequestEvent(invite, requestVerdict.action, requestVerdict.appliedRule),
              );
            } else {
              evaluatedInvites.push({
                ...invite,
                evaluation: requestVerdict,
              });
            }
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
        return createFriendRequestEvent(invite, eventTypes.new.key);
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
