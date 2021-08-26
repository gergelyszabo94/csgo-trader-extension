import DOMPurify from 'dompurify';

import { FriendRequestEvalRule } from 'types/storage';
import { Evaluation, Inviter } from 'types/storage';

import { getPlayerBans, getPlayerSummaries } from 'utils/ISteamUser';
import { getUserCSGOInventory } from 'utils/getUserInventory';
import { playNotificationSound } from 'utils/notifications';
import { actions, conditions, eventTypes } from 'utils/static/friendRequests';
import { getRemoteImageAsObjectURL, getSteamRepInfo } from 'utils/utilsModular';

import * as fetcher from 'utils/helpers/fetcher';
import * as localStorage from 'utils/helpers/localStorage';
import * as runtime from 'utils/helpers/runtime';

interface RawInviter {
    steamID: string;
    accountID: string;
    name: string;
    level: string;
    evalTries: number;
    avatar: string;
}

export const getFriendRequests = async (): Promise<RawInviter[]> => {
    try {
        const response = await fetcher.get('https://steamcommunity.com/my/friends/pending');
        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return null;
        }
        const body = await response.text();
        const html = document.createElement('html');
        html.innerHTML = DOMPurify.sanitize(body);
        const receivedInvitesElement = html.querySelector('#search_results');
        const inviters: RawInviter[] = [];

        if (receivedInvitesElement !== null) {
            receivedInvitesElement.querySelectorAll('.invite_row').forEach((inviteRow) => {
                inviters.push({
                    steamID: inviteRow.getAttribute('data-steamid'),
                    accountID: inviteRow.getAttribute('data-accountid'),
                    name: (inviteRow.querySelector('.invite_block_name').firstElementChild as HTMLElement).innerText,
                    level: inviteRow.querySelector<HTMLElement>('.friendPlayerLevelNum').innerText,
                    evalTries: 0,
                    avatar: inviteRow.querySelector('.playerAvatar > a > img').getAttribute('src'),
                });
            });
            return inviters;
        } else {
            console.log('no received invites element');
        }
    } catch (err) {
        console.log(err);
    }
};

interface GroupInvite {
    steamID: string;
    name: string;
}

export const getGroupInvites = (): Promise<GroupInvite[]> =>
    new Promise((resolve, reject) => {
        const getRequest = new Request('https://steamcommunity.com/my/groups/pending');

        fetch(getRequest)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject(response);
                    return null;
                }
                return response.text();
            })
            .then((body) => {
                if (body !== null) {
                    const rows = body.split('class="invite_row ');
                    const invitedTo = [];

                    if (rows.length > 1) {
                        // if there are invite rows
                        // all this hacking with string splitting instead of DOM querying
                        // is because of DOMPurify removes the in-line js actions
                        // that are used to parse the group ID
                        for (let i = 1; i <= rows.length - 1; i += 1) {
                            const groupID = rows[i].split("ApplyFriendAction( 'group_accept', '")[1].split("'")[0];
                            const name = rows[i].split('<div class="groupTitle">')[1].split('">')[1].split('</a>')[0];

                            invitedTo.push({
                                steamID: groupID,
                                name,
                            });
                        }
                    }

                    chrome.storage.local.set(
                        {
                            groupInvites: {
                                invitedTo,
                                lastUpdated: Date.now(),
                            },
                        },
                        () => {
                            resolve(invitedTo);
                        },
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });

const makeFriendActionCall = (targetSteamID, action) => {
    chrome.storage.local.get(['steamIDOfUser', 'steamSessionID'], ({ steamIDOfUser, steamSessionID }) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const apiRequest = new Request(`https://steamcommunity.com/profiles/${steamIDOfUser}/friends/action`, {
            method: 'POST',
            headers: myHeaders,
            body: `sessionid=${steamSessionID}&steamid=${steamIDOfUser}&ajax=1&action=${action}&steamids%5B%5D=${targetSteamID}`,
        });

        fetch(apiRequest)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                } else return response.json();
            })
            .then((data) => {
                if (!data.success) console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

export const ignoreRequest = (steamIDToIgnore) => {
    makeFriendActionCall(steamIDToIgnore, 'ignore_invite');
};

export const acceptRequest = (steamIDToAccept) => {
    makeFriendActionCall(steamIDToAccept, 'accept');
};

export const blockRequest = (steamIDToBlock) => {
    makeFriendActionCall(steamIDToBlock, 'block');
};

export const ignoreGroupRequest = (steamIDToIgnore) => {
    makeFriendActionCall(steamIDToIgnore, 'group_ignore');
};

export const acceptGroupRequest = (steamIDToAccept) => {
    makeFriendActionCall(steamIDToAccept, 'group_accept');
};

export const getCommonFriends = (accountID) =>
    new Promise((resolve, reject) => {
        const request = new Request(
            `https://steamcommunity.com/actions/PlayerList/?type=friendsincommon&target=${accountID}`,
            {
                method: 'GET',
            },
        );

        fetch(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject(response);
                    return null;
                }
                return response.text();
            })
            .then((body) => {
                if (body !== null) {
                    const html = document.createElement('html');
                    html.innerHTML = DOMPurify.sanitize(body);
                    const friends = [];
                    html.querySelectorAll('.friendBlock.persona').forEach((friendBlock) => {
                        const nickNameBlock = friendBlock.querySelector<HTMLElement>('.nickname_block');

                        friends.push({
                            profileLink: friendBlock.querySelector('.friendBlockLinkOverlay').getAttribute('href'),
                            accountID: friendBlock.getAttribute('data-miniprofile'),
                            name: friendBlock.querySelector('.friendBlockContent').firstChild.nodeValue.trim(),
                            avatar: friendBlock.querySelector('.playerAvatar').firstElementChild.getAttribute('src'),
                            nickname: nickNameBlock !== null ? nickNameBlock.innerText : '',
                        });
                    });
                    resolve(friends);
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });

const logFriendRequestEvents = (events) => {
    chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
        chrome.storage.local.set(
            {
                friendRequestLogs: [...friendRequestLogs, ...events],
            },
            () => {},
        );
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

            chrome.storage.local.set(
                {
                    friendRequests: {
                        inviters: [...invitesWithSummaries, ...nowWithSummaries],
                        lastUpdated: Date.now(),
                    },
                },
                () => {},
            );
        });
    });
};

const addBansToInvites = async () => {
    const result = localStorage.get('friendRequests');
    const friendRequests = result.friendRequests;
    const inviters: Inviter[] = friendRequests.inviters;

    const invitesWithBans = [];
    const noBansInvites = [];
    const noBansInvitesIDs = [];

    for (const invite of inviters) {
        if (invite.bans === undefined) {
            noBansInvites.push(invite);
            noBansInvitesIDs.push(invite.steamID);
        } else {
            invitesWithBans.push(invite);
        }
    }

    const bans = await getPlayerBans(noBansInvitesIDs);
    const nowWithBans = noBansInvites.map((invite) => {
        return {
            ...invite,
            bans: bans[invite.steamID],
        };
    });

    localStorage.set({
        friendRequests: {
            inviters: [...invitesWithBans, ...nowWithBans],
            lastUpdated: Date.now(),
        },
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

            chrome.storage.local.set(
                {
                    friendRequests: {
                        inviters: [...invitesWithSteamRep, ...stillNoSteamRep, ...nowWithSteamRepInfo],
                        lastUpdated: Date.now(),
                    },
                },
                () => {},
            );
        }, 4000);
    });
};

const addInventoryValueInfo = () => {
    chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
        const invitesWithInventoryValue = [];
        const noInventoryValueInvites = [];

        friendRequests.inviters.forEach((invite) => {
            if (invite.csgoInventoryValue === undefined) {
                noInventoryValueInvites.push(invite);
            } else invitesWithInventoryValue.push(invite);
        });

        const nowWithInventoryValue = [];

        for (const [index, invite] of noInventoryValueInvites.entries()) {
            if (index < 5) {
                getUserCSGOInventory(invite.steamID)
                    .then(({ total }) => {
                        nowWithInventoryValue.push({
                            ...invite,
                            csgoInventoryValue: total,
                        });
                    })
                    .catch((err) => {
                        if (err === 'inventory_private' || err === 'inventory_private') {
                            nowWithInventoryValue.push({
                                ...invite,
                                csgoInventoryValue: 'inventory_private',
                            });
                        }
                    });
            } else break;
        }

        setTimeout(() => {
            const nowWithInventoryValueIDs = nowWithInventoryValue.map((invite) => {
                return invite.steamID;
            });
            const stillNoInventoryValue = noInventoryValueInvites.filter((invite) => {
                return !nowWithInventoryValueIDs.includes(invite.steamID);
            });

            chrome.storage.local.set(
                {
                    friendRequests: {
                        inviters: [...invitesWithInventoryValue, ...stillNoInventoryValue, ...nowWithInventoryValue],
                        lastUpdated: Date.now(),
                    },
                },
                () => {},
            );
        }, 4000);
    });
};

const addCommonFriendsInfo = () => {
    chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
        const invitesWithCommonFriendsInfo = [];
        const noCommonFriendInfoInvites = [];

        friendRequests.inviters.forEach((invite) => {
            if (invite.commonFriends === undefined) {
                noCommonFriendInfoInvites.push(invite);
            } else invitesWithCommonFriendsInfo.push(invite);
        });

        const nowWithCommonFriendInfo = [];

        for (const [index, invite] of noCommonFriendInfoInvites.entries()) {
            if (index < 5) {
                getCommonFriends(invite.accountID)
                    .then((commonFriends) => {
                        nowWithCommonFriendInfo.push({
                            ...invite,
                            commonFriends,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        nowWithCommonFriendInfo.push({
                            ...invite,
                            commonFriends: [],
                        });
                    });
            } else break;
        }

        setTimeout(() => {
            const nowWithCommonFriendInfoIDs = nowWithCommonFriendInfo.map((invite) => {
                return invite.steamID;
            });
            const stillNoCommonFriendInfo = noCommonFriendInfoInvites.filter((invite) => {
                return !nowWithCommonFriendInfoIDs.includes(invite.steamID);
            });
            chrome.storage.local.set(
                {
                    friendRequests: {
                        inviters: [
                            ...invitesWithCommonFriendsInfo,
                            ...stillNoCommonFriendInfo,
                            ...nowWithCommonFriendInfo,
                        ],
                        lastUpdated: Date.now(),
                    },
                },
                () => {},
            );
        }, 4000);
    });
};

const addPastRequestsInfo = () => {
    chrome.storage.local.get(['friendRequests', 'friendRequestLogs'], ({ friendRequests, friendRequestLogs }) => {
        const invitesWithPastRequestsInfo = [];
        const noPastRequestsInfo = [];

        friendRequests.inviters.forEach((invite) => {
            if (invite.pastRequests === undefined) {
                noPastRequestsInfo.push(invite);
            } else invitesWithPastRequestsInfo.push(invite);
        });

        const nowWithPastRequestsInfo = noPastRequestsInfo.map((invite) => {
            let pastRequests = 0;

            friendRequestLogs.forEach((event) => {
                if (event.steamID === invite.steamID && event.type === eventTypes.new.key) {
                    pastRequests += 1;
                }
            });

            return {
                ...invite,
                pastRequests,
            };
        });

        chrome.storage.local.set(
            {
                friendRequests: {
                    inviters: [...invitesWithPastRequestsInfo, ...nowWithPastRequestsInfo],
                    lastUpdated: Date.now(),
                },
            },
            () => {},
        );
    });
};

const createFriendRequestEvent = (invite: Inviter | RawInviter, type: string, appliedRule?: number) => {
    let eventType: string;
    switch (type) {
        case actions.accept.key:
            eventType = eventTypes.auto_accepted.key;
            break;
        case actions.ignore.key:
            eventType = eventTypes.auto_ignored.key;
            break;
        case actions.block.key:
            eventType = eventTypes.auto_blocked.key;
            break;
        default:
            eventType = type;
    }
    return {
        type: eventType,
        rule: appliedRule,
        steamID: invite.steamID,
        username: invite.name,
        timestamp: Date.now(),
    };
};

const evaluateRequest = (invite: Inviter, rules: FriendRequestEvalRule[]): Evaluation => {
    if (
        invite.summary &&
        invite.bans &&
        invite.steamRepInfo &&
        invite.commonFriends &&
        invite.csgoInventoryValue !== undefined &&
        invite.pastRequests
    ) {
        for (const [index, rule] of rules.entries()) {
            if (rule.active) {
                if (rule.condition.type === conditions.all_users.key) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.profile_private.key &&
                    invite.summary.communityvisibilitystate === 1
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.profile_public.key &&
                    invite.summary.communityvisibilitystate === 3
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.steam_level_under.key &&
                    parseInt(invite.level) <= rule.condition.value
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.steam_level_over.key &&
                    parseInt(invite.level) > rule.condition.value
                ) {
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
                if (rule.condition.type === conditions.community_banned.key && invite.bans.CommunityBanned) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (rule.condition.type === conditions.game_banned.key && invite.bans.NumberOfGameBans !== 0) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.trade_banned.key &&
                    (invite.bans.EconomyBan === 'banned' || invite.bans.EconomyBan === 'probation')
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.streamrep_banned.key &&
                    invite.steamRepInfo.reputation.summary === 'SCAMMER'
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.csgo_inventory_value_under.key &&
                    String(invite.csgoInventoryValue) !== 'inventory_private' &&
                    invite.csgoInventoryValue <= rule.condition.value
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.csgo_inventory_value_over.key &&
                    String(invite.csgoInventoryValue) !== 'inventory_private' &&
                    invite.csgoInventoryValue > rule.condition.value
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.inventory_private.key &&
                    String(invite.csgoInventoryValue) === 'inventory_private'
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.common_friends_over.key &&
                    invite.commonFriends.length > rule.condition.value
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.common_friends_under.key &&
                    invite.commonFriends.length <= rule.condition.value
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.name_includes.key &&
                    invite.name.toLowerCase().includes(String(rule.condition.value))
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.request_received.key &&
                    invite.pastRequests !== null &&
                    invite.pastRequests > 1
                ) {
                    return {
                        action: rule.action,
                        appliedRule: index + 1,
                    };
                }
                if (
                    rule.condition.type === conditions.from_country.key &&
                    invite.summary.loccountrycode === rule.condition.value
                ) {
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

const executeVerdict = (invite: Inviter, verdict: string) => {
    switch (verdict) {
        case actions.ignore.key:
            ignoreRequest(invite.steamID);
            break;
        case actions.block.key:
            blockRequest(invite.steamID);
            break;
        case actions.accept.key:
            acceptRequest(invite.steamID);
            break;
    }
};

const evaluateInvites = async () => {
    const result = await localStorage.get(['friendRequests', 'friendRequestEvalRules']);
    const friendRequests = result.friendRequests;
    const friendRequestEvalRules: FriendRequestEvalRule[] = result.friendRequestEvalRules;

    const inviters: Inviter[] = friendRequests.inviters;
    const alreadyEvaluated = [];
    const evaluationEvents = [];
    const evaluatedInvites = [];

    for (const invite of inviters) {
        if (invite.evaluation || invite.evalTries >= 5) {
            alreadyEvaluated.push(invite);
            continue;
        }

        const evaluation = evaluateRequest(invite, friendRequestEvalRules);
        if (evaluation) {
            executeVerdict(invite, evaluation.action);
            evaluationEvents.push(createFriendRequestEvent(invite, evaluation.action, evaluation.appliedRule));
            if (evaluation.action === actions.no_action.key) {
                evaluatedInvites.push({
                    ...invite,
                    evalTries: invite.evalTries + 1,
                    evaluation,
                });
            }
        } else {
            evaluatedInvites.push({
                ...invite,
                evalTries: invite.evalTries + 1,
            });
        }
    }

    localStorage.set({
        friendRequests: {
            inviters: [...alreadyEvaluated, ...evaluatedInvites],
            lastUpdated: Date.now(),
        },
    });

    logFriendRequestEvents(evaluationEvents);
};

export const updateFriendRequest = async () => {
    const rawInviters = await getFriendRequests();
    // inviters here is the freshly loaded list
    // it only includes limited details though
    const upToDateInviterIDs = rawInviters.map((inviter) => {
        return inviter.steamID;
    });

    // loading previous invite info from storage that could be stale

    const result = localStorage.get(['friendRequests', 'apiKeyValid', 'notifyOnFriendRequest']);
    const friendRequests = result.friendRequests;
    const inviters: Inviter[] = friendRequests.inviters;
    const apiKeyValid: boolean = result.apiKeyValid;
    const notifyOnFriendRequest: boolean = result.notifyOnFriendRequest;
    const minutesFromLastCheck = (Date.now() - new Date(friendRequests.lastUpdated).getTime()) / 1000 / 60;
    // safeguarding against an edge case where the invites page loads
    // but the invites themselves don't, which means
    // that the extension would falsely update the incoming requests to 0
    // when on the next update it checks and now correctly finds the invites
    // it logs the invites as new ones, which is problematic
    // because if the user uses the "received invite in the past week"
    // as a condition in the rule, it would match to all invites at this point
    // this can manifest in pretty ugly ways, for example ignoring all current friend requests
    // the conditions below try minimize the risk of this happening
    if (
        rawInviters.length > 0 ||
        inviters.length === 0 ||
        (inviters.length < 2 && minutesFromLastCheck < 31) ||
        minutesFromLastCheck > 61
    ) {
        const staleInviterIDs = inviters.map((inviter) => {
            return inviter.steamID;
        });

        // if the invite was canceled by the sender or
        // accepted, ignored or blocked by the user since the last check
        const disappearedInvites = inviters.filter((inviter: Inviter) => {
            return !upToDateInviterIDs.includes(inviter.steamID);
        });

        const disappearedInviteEvents = disappearedInvites.map((invite) => {
            return createFriendRequestEvent(invite, eventTypes.disappeared.key);
        });

        const newInvites = rawInviters.filter((inviter) => {
            return !staleInviterIDs.includes(inviter.steamID);
        });

        const unChangedInvites = inviters.filter((inviter) => {
            return upToDateInviterIDs.includes(inviter.steamID);
        });

        await localStorage.set({
            friendRequests: {
                inviters: [...unChangedInvites, ...newInvites],
                lastUpdated: Date.now(),
            },
        });

        if (notifyOnFriendRequest) {
            for (const invite of newInvites) {
                let icon = '/images/cstlogo128.png';
                try {
                    icon = await getRemoteImageAsObjectURL(invite.avatar);
                } catch (err) {
                    console.log(err);
                } finally {
                    chrome.notifications.create(
                        `invite_${invite.steamID}`,
                        {
                            type: 'basic',
                            iconUrl: icon,
                            title: `Friend request from ${invite.name}`,
                            message: `You have a new friend request from ${invite.name}!`,
                        },
                        () => {
                            playNotificationSound();
                        },
                    );
                }
            }

            if (apiKeyValid) {
                addSummariesToInvites();
                setTimeout(() => {
                    addBansToInvites();
                }, 5000);
                setTimeout(() => {
                    addSteamRepInfoToInvites();
                }, 10000);
                setTimeout(() => {
                    addInventoryValueInfo();
                }, 15000);
                setTimeout(() => {
                    addCommonFriendsInfo();
                }, 20000);
                setTimeout(() => {
                    addPastRequestsInfo();
                }, 25000);
                setTimeout(() => {
                    evaluateInvites();
                }, 26000);
            }
            const newInviteEvents = newInvites.map((invite) => {
                return createFriendRequestEvent(invite, eventTypes.new.key);
            });

            logFriendRequestEvents([...newInviteEvents, ...disappearedInviteEvents]);
        }
    }
};

export const removeOldFriendRequestEvents = () => {
    chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
        const now = Date.now();
        const recentEvents = friendRequestLogs.filter((event) => {
            const delta = (now - event.timestamp) / 1000;
            return delta < 86400 * 7;
        });

        chrome.storage.local.set(
            {
                friendRequestLogs: recentEvents,
            },
            () => {},
        );
    });
};

export const getBansSummaryText = (bans, steamRepInfo) => {
    if (bans && steamRepInfo) {
        let bansText = '';
        if (bans.CommunityBanned) bansText += 'Community banned\n';
        if (bans.EconomyBan === 'banned' || bans.EconomyBan === 'probation') bansText += 'Trade banned\n';
        if (bans.NumberOfGameBans !== 0) bansText += 'Game banned\n';
        if (bans.VACBanned) bansText += 'VAC banned\n';
        if (steamRepInfo.reputation.summary === 'SCAMMER') bansText += 'SteamRep banned scammer';
        if (bansText === '') bansText = 'No bans';
        return bansText;
    }
    return 'Could not load ban info';
};
