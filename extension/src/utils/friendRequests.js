import { getPlayerBans, getPlayerSummaries } from 'utils/ISteamUser';
import { actions, conditions, eventTypes } from 'utils/static/friendRequests';
import { getSteamRepInfo } from 'utils/utilsModular';

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
            evalTries: 0,
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

const addSummariesToInvites = () => {
  chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
    const invitesWithSummaries = [];
    const noSummaryInvites = [];
    const noSummaryInvitesIDs = [];
    friendRequests.inviters.forEach((invite) => {
      if (invite.summary === undefined) {
        noSummaryInvites.push(invite);
        noSummaryInvitesIDs.push(invite.steamID);
      } else invitesWithSummaries.push(invite);
    });

    getPlayerSummaries(noSummaryInvitesIDs).then((summaries) => {
      const nowWithSummaries = noSummaryInvites.map((invite) => {
        return {
          ...invite,
          summary: summaries[invite.steamID],
        };
      });

      chrome.storage.local.set({
        friendRequests: {
          inviters: [...invitesWithSummaries, ...nowWithSummaries],
          lastUpdated: Date.now(),
        },
      }, () => {});
    });
  });
};

const addBansToInvites = () => {
  chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
    const invitesWithBans = [];
    const noBansInvites = [];
    const noBansInvitesIDs = [];

    friendRequests.inviters.forEach((invite) => {
      if (invite.bans === undefined) {
        noBansInvites.push(invite);
        noBansInvitesIDs.push(invite.steamID);
      } else invitesWithBans.push(invite);
    });

    getPlayerBans(noBansInvitesIDs).then((bans) => {
      const nowWithBans = noBansInvites.map((invite) => {
        return {
          ...invite,
          bans: bans[invite.steamID],
        };
      });

      chrome.storage.local.set({
        friendRequests: {
          inviters: [...invitesWithBans, ...nowWithBans],
          lastUpdated: Date.now(),
        },
      }, () => {});
    });
  });
};

const addSteamRepInfoToInvites = () => {
  chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
    const invitesWithSteamRep = [];
    const noSteamRepInvites = [];

    friendRequests.inviters.forEach((invite) => {
      if (invite.steamRepInfo === undefined) {
        noSteamRepInvites.push(invite);
      } else invitesWithSteamRep.push(invite);
    });

    const nowWithSteamRepInfo = [];

    noSteamRepInvites.forEach((invite) => {
      getSteamRepInfo(invite.steamID).then((steamRepInfo) => {
        nowWithSteamRepInfo.push({
          ...invite,
          steamRepInfo,
        });
      });
    });

    setTimeout(() => {
      const nowWithSteamRepInfoIDs = nowWithSteamRepInfo.map((invite) => {
        return invite.steamID;
      });
      const stillNoSteamRep = noSteamRepInvites.filter((invite) => {
        return !nowWithSteamRepInfoIDs.includes(invite.steamID);
      });

      chrome.storage.local.set({
        friendRequests: {
          inviters: [...invitesWithSteamRep, ...stillNoSteamRep, ...nowWithSteamRepInfo],
          lastUpdated: Date.now(),
        },
      }, () => {});
    }, 4000);
  });
};

const createFriendRequestEvent = (invite, type, appliedRule) => {
  let eventType;
  switch (type) {
    case actions.accept.key: eventType = eventTypes.auto_accepted.key; break;
    case actions.ignore.key: eventType = eventTypes.auto_ignored.key; break;
    case actions.block.key: eventType = eventTypes.auto_blocked.key; break;
    default: eventType = type;
  }
  return {
    type: eventType,
    rule: appliedRule,
    steamID: invite.steamID,
    username: invite.name,
    timestamp: Date.now(),
  };
};

const evaluateRequest = (invite, rules) => {
  if (invite.summary && invite.bans && invite.steamRepInfo) {
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
        if (rule.condition.type === conditions.vac_banned.key && invite.bans.VACBanned) {
          return {
            action: rule.action,
            appliedRule: index + 1,
          };
        }
        if (rule.condition.type === conditions.community_banned.key
          && invite.bans.CommunityBanned) {
          return {
            action: rule.action,
            appliedRule: index + 1,
          };
        }
        if (rule.condition.type === conditions.game_banned.key
          && invite.bans.NumberOfGameBans !== 0) {
          return {
            action: rule.action,
            appliedRule: index + 1,
          };
        }
        if (rule.condition.type === conditions.trade_banned.key
          && (invite.bans.EconomyBan === 'banned' || invite.bans.EconomyBan === 'probation')) {
          return {
            action: rule.action,
            appliedRule: index + 1,
          };
        }
        if (rule.condition.type === conditions.streamrep_banned.key
          && invite.steamRepInfo.reputation.summary === 'SCAMMER') {
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
  }
  return null;
};

const executeVerdict = (invite, verdict) => {
  switch (verdict) {
    case actions.ignore.key: ignoreRequest(invite.steamID); break;
    case actions.block.key: blockRequest(invite.steamID); break;
    case actions.accept.key: acceptRequest(invite.steamID); break;
    default: break;
  }
};

const evaluateInvites = () => {
  chrome.storage.local.get(['friendRequests', 'friendRequestEvalRules'], ({ friendRequests, friendRequestEvalRules }) => {
    const alreadyEvaluated = [];
    const evaluationEvents = [];
    const evaluatedInvites = [];
    friendRequests.inviters.forEach((invite) => {
      if (invite.evaluation === undefined && invite.evalTries < 5) {
        const requestVerdict = evaluateRequest(invite, friendRequestEvalRules);
        if (requestVerdict !== null) {
          executeVerdict(invite, requestVerdict.action);
          evaluationEvents.push(
            createFriendRequestEvent(invite, requestVerdict.action, requestVerdict.appliedRule),
          );
          if (requestVerdict.action === actions.no_action.key) {
            evaluatedInvites.push({
              ...invite,
              evalTries: invite.evalTries + 1,
              evaluation: requestVerdict,
            });
          }
        } else {
          evaluatedInvites.push({
            ...invite,
            evalTries: invite.evalTries + 1,
          });
        }
      } else alreadyEvaluated.push(invite);
    });

    chrome.storage.local.set({
      friendRequests: {
        inviters: [...alreadyEvaluated, ...evaluatedInvites],
        lastUpdated: Date.now(),
      },
    }, () => {});

    logFriendRequestEvents(evaluationEvents);
  });
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
        return createFriendRequestEvent(invite, eventTypes.disappeared.key);
      });

      const newInvites = inviters.filter((inviter) => {
        return !staleInviterIDs.includes(inviter.steamID);
      });

      const unChangedInvites = friendRequests.inviters.filter((inviter) => {
        return upToDateInviterIDs.includes(inviter.steamID);
      });

      chrome.storage.local.set({
        friendRequests: {
          inviters: [...unChangedInvites, ...newInvites],
          lastUpdated: Date.now(),
        },
      }, () => {
        addSummariesToInvites();
        setTimeout(() => {
          addBansToInvites();
        }, 5000);
        setTimeout(() => {
          addSteamRepInfoToInvites();
        }, 10000);
        setTimeout(() => {
          evaluateInvites();
        }, 15000);
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
