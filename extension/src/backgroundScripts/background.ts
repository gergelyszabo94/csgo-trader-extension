import {
    getGroupInvites,
    ignoreGroupRequest,
    removeOldFriendRequestEvents,
    updateFriendRequest,
} from 'utils/friendRequests';
import { getSteamNotificationCount, playNotificationSound } from 'utils/notifications';
import { getUserCurrencyBestGuess, updateExchangeRates, updatePrices } from 'utils/pricing';
import { goToInternalPage, markModMessagesAsRead, scrapeSteamAPIkey, uuidv4 } from 'utils/utilsModular';
import { removeOldOfferEvents, updateTrades } from 'utils/tradeOffers';
import { sendTelemetry, trackEvent } from 'utils/analytics';

import { ExchangeRates } from 'types';
import { storageKeys } from 'utils/static/storageKeys';
import { trimFloatCache } from 'utils/floatCaching';

// handles install and update events
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // sets the default options for first run
        // (on install from the webstore/amo or when loaded in developer mode)
        for (const [key, value] of Object.entries(storageKeys)) {
            // id generated to identify the extension installation
            // a user can use use multiple installations of the extension
            if (key === 'clientID') chrome.storage.local.set({ [key]: uuidv4() }, () => {});
            else if (key === 'telemetryConsentSubmitted') {
                // mozilla addons requires user consent to be given so it's off by default for firefox
                // but it is on by default on chrome, edge, etc.
                if (chrome.extension.getURL('/index.html').includes('chrome-extension')) {
                    chrome.storage.local.set({ [key]: true });
                } else chrome.storage.local.set({ [key]: false });
            } else chrome.storage.local.set({ [key]: value }, () => {});
        }

        trackEvent({
            type: 'event',
            action: 'ExtensionInstall',
        });

        // sets extension currency to Steam currency when possible
        // the delay is to wait for exchange rates data to be set
        setTimeout(() => {
            getUserCurrencyBestGuess().then((currency) => {
                chrome.storage.local.get(['exchangeRates'], ({ exchangeRates }: ExchangeRates) => {
                    chrome.storage.local.set({
                        currency,
                        exchangeRate: exchangeRates[currency],
                    });
                });
            });
        }, 20000);

        // tries to set the api key - only works if the user has already generated one before
        scrapeSteamAPIkey();

        chrome.browserAction.setBadgeText({ text: 'I' });
        chrome.notifications.create(
            'installed',
            {
                type: 'basic',
                iconUrl: '/images/cstlogo128.png',
                title: 'Extension installed!',
                message: 'Go to the options through the extension popup and customize your experience!',
            },
            () => {
                playNotificationSound();
            },
        );
    } else if (details.reason === 'update') {
        const path = chrome.extension.getURL('/index.html');
        if (path.includes('chrome-extension')) {
            chrome.storage.local.set({ telemetryConsent: true });
        }

        // sets defaults options for new options that haven't been set yet
        // (for features introduced since the last version)
        // runs when the extension updates or gets reloaded in developer mode
        // it checks whether the setting has ever been set
        // I consider removing older ones since there is no one updating from version that old
        const keys = Object.keys(storageKeys);

        chrome.storage.local.get(keys, (result) => {
            for (const [storageKey, storageValue] of Object.entries(storageKeys)) {
                if (result[storageKey] === undefined) {
                    chrome.storage.local.set({ [storageKey]: storageValue }, () => {});
                }
            }
        });

        trackEvent({
            type: 'event',
            action: 'ExtensionUpdate',
        });

        // remove in next update
        chrome.storage.local.set({ useAlternativeCSGOInventoryEndpoint: false }, () => {});

        chrome.browserAction.setBadgeText({ text: 'U' });

        // notifies the user when the extension is updated
        chrome.storage.local.set({ showUpdatedRibbon: true }, () => {});
        chrome.storage.local.get('notifyOnUpdate', (result) => {
            if (result.notifyOnUpdate) {
                const version = chrome.runtime.getManifest().version;
                chrome.permissions.contains(
                    {
                        permissions: ['tabs'],
                    },
                    (permission) => {
                        const message = permission
                            ? 'You can check the changelog by clicking here!'
                            : 'Check the changelog for the hot new stuff!';

                        chrome.notifications.create(
                            'updated',
                            {
                                type: 'basic',
                                iconUrl: '/images/cstlogo128.png',
                                title: `Extension updated to ${version}!`,
                                message,
                            },
                            () => {
                                playNotificationSound();
                            },
                        );
                    },
                );
            }
        });
        // send telemetry on update
        sendTelemetry();
    }

    // updates the prices and exchange rates
    // retries periodically if it's the first time (on install)
    // and it fails to update prices/exchange rates
    updatePrices();
    updateExchangeRates();
    chrome.alarms.create('getSteamNotificationCount', { periodInMinutes: 1 });
    chrome.alarms.create('retryUpdatePricesAndExchangeRates', { periodInMinutes: 1 });
    chrome.alarms.create('dailyScheduledTasks', { periodInMinutes: 1440 });
});

// redirects to feedback survey on uninstall
chrome.runtime.setUninstallURL(
    'https://docs.google.com/forms/d/e/1FAIpQLSdGzY8TrSjfZZtfoerFdAna1E79Y13afxNKG1yytjZkypKTpg/viewform?usp=sf_link',
);

// handles what happens when one of the extension's notification gets clicked
chrome.notifications.onClicked.addListener((notificationID) => {
    chrome.browserAction.setBadgeText({ text: '' });
    chrome.permissions.contains(
        {
            permissions: ['tabs'],
        },
        (granted) => {
            if (granted) {
                if (notificationID === 'updated') {
                    chrome.tabs.create({
                        url: 'https://csgotrader.app/changelog/',
                    });
                } else if (notificationID.includes('offer_received_')) {
                    const offerID = notificationID.split('offer_received_')[1];
                    chrome.tabs.create({
                        url: `https://steamcommunity.com/tradeoffer/${offerID}/`,
                    });
                } else if (notificationID.includes('new_inventory_items_')) {
                    chrome.tabs.create({
                        url: 'https://steamcommunity.com/my/inventory/',
                    });
                } else if (notificationID.includes('invite_')) {
                    const userSteamID = notificationID.split('invite_')[1];
                    chrome.tabs.create({
                        url: `https://steamcommunity.com/profiles/${userSteamID}/`,
                    });
                } else if (notificationID === 'new_comment') {
                    chrome.tabs.create({
                        url: 'https://steamcommunity.com/my/commentnotifications/',
                    });
                } else goToInternalPage('index.html?page=bookmarks');
            }
        },
    );
});

// handles periodic and timed events like bookmarked items becoming tradable
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'retryUpdatePricesAndExchangeRates') {
        chrome.storage.local.get('prices', (result) => {
            if (result.prices === null) updatePrices();
            else chrome.alarms.clear('retryUpdatePricesAndExchangeRates', () => {});
        });
    } else if (alarm.name === 'getSteamNotificationCount') {
        getSteamNotificationCount().then(
            ({ invites, moderatorMessages, tradeOffers, items, comments }) => {
                chrome.storage.local.get(
                    [
                        'friendRequests',
                        'groupInvites',
                        'ignoreGroupInvites',
                        'monitorFriendRequests',
                        'numberOfNewItems',
                        'markModerationMessagesAsRead',
                        'monitorIncomingOffers',
                        'activeOffers',
                        'notifyAboutNewItems',
                        'numberOfComments',
                        'notifyAboutComments',
                    ],
                    ({
                        friendRequests,
                        groupInvites,
                        ignoreGroupInvites,
                        monitorFriendRequests,
                        numberOfNewItems,
                        markModerationMessagesAsRead,
                        monitorIncomingOffers,
                        activeOffers,
                        notifyAboutNewItems,
                        numberOfComments,
                        notifyAboutComments,
                    }) => {
                        // friend request monitoring
                        const minutesFromLastFriendCheck =
                            (Date.now() - new Date(friendRequests.lastUpdated).getTime()) / 1000 / 60;
                        const friendAndGroupInviteCount =
                            friendRequests.inviters.length + groupInvites.invitedTo.length;

                        if (invites !== friendAndGroupInviteCount || minutesFromLastFriendCheck >= 30) {
                            if (monitorFriendRequests) updateFriendRequest();
                            getGroupInvites().then((inviters) => {
                                if (ignoreGroupInvites) {
                                    inviters.forEach((inviter) => {
                                        ignoreGroupRequest(inviter.steamID);
                                    });
                                }
                            });
                        }

                        // moderation messages
                        if (markModerationMessagesAsRead && moderatorMessages > 0) markModMessagesAsRead();

                        // trade offers monitoring
                        const minutesFromLastOfferCheck =
                            (Date.now() - new Date(activeOffers.lastFullUpdate).getTime() * 1000) / 1000 / 60;

                        if (
                            monitorIncomingOffers &&
                            (tradeOffers !== activeOffers.receivedActiveCount || minutesFromLastOfferCheck >= 2)
                        ) {
                            updateTrades();
                        }

                        // new items notification
                        if (notifyAboutNewItems && items !== numberOfNewItems) {
                            const numberOfJustNoticedNewItems = items > numberOfNewItems ? items - numberOfNewItems : 0;
                            if (numberOfJustNoticedNewItems > 0) {
                                const title =
                                    numberOfJustNoticedNewItems === 1
                                        ? `${numberOfJustNoticedNewItems} new item!`
                                        : `${numberOfJustNoticedNewItems} new items!`;
                                const message =
                                    numberOfJustNoticedNewItems === 1
                                        ? `You have ${numberOfJustNoticedNewItems} item in your inventory!`
                                        : `You have ${numberOfJustNoticedNewItems} items in your inventory!`;

                                chrome.notifications.create(
                                    `new_inventory_items_${Date.now()}`,
                                    {
                                        type: 'basic',
                                        iconUrl: '/images/cstlogo128.png',
                                        title,
                                        message,
                                    },
                                    () => {
                                        playNotificationSound();
                                    },
                                );
                            }
                            chrome.storage.local.set({
                                numberOfNewItems: items,
                            });
                        }

                        // comment notification
                        if (notifyAboutComments) {
                            const newComments = comments - numberOfComments;
                            if (newComments > 0) {
                                const title =
                                    newComments === 1 ? `${newComments} new comment!` : `${newComments} new comments!`;
                                const message =
                                    newComments === 1
                                        ? `You have ${newComments} new comment!`
                                        : `You have ${newComments} new comments!`;
                                chrome.notifications.create(
                                    'new_comment',
                                    {
                                        type: 'basic',
                                        iconUrl: '/images/cstlogo128.png',
                                        title,
                                        message,
                                    },
                                    () => {
                                        playNotificationSound();
                                    },
                                );
                            }
                            chrome.storage.local.set({
                                numberOfComments: comments,
                            });
                        }
                    },
                );
            },
            (error) => {
                console.log(error);
                if (error === 401 || error === 403) {
                    if (error === 401) {
                        // user not logged in
                        console.log('User not logged in, suspending notification checks for an hour.');
                    } else if (error === 403) {
                        // Steam is temporarily blocking this ip
                        console.log('Steam is denying access, suspending notification checks for an hour.');
                    }
                    chrome.alarms.clear('getSteamNotificationCount', () => {
                        const now = new Date();
                        now.setHours(now.getHours() + 1);
                        chrome.alarms.create('restartNotificationChecks', {
                            when: now.valueOf(),
                        });
                    });
                }
            },
        );
    } else if (alarm.name === 'restartNotificationChecks') {
        chrome.alarms.create('getSteamNotificationCount', { periodInMinutes: 1 });
    } else if (alarm.name === 'dailyScheduledTasks') {
        sendTelemetry(0);
        trimFloatCache();
        removeOldFriendRequestEvents();
        removeOldOfferEvents();
        chrome.storage.local.get('itemPricing', ({ itemPricing }) => {
            if (itemPricing) updatePrices();
        });
        updateExchangeRates();
    } else {
        // this is when bookmarks notification are handled
        chrome.browserAction.getBadgeText({}, (result) => {
            if (result === '' || result === 'U' || result === 'I') chrome.browserAction.setBadgeText({ text: '1' });
            else chrome.browserAction.setBadgeText({ text: (parseInt(result) + 1).toString() });
        });
        chrome.storage.local.get('bookmarks', (result) => {
            const item = result.bookmarks.find((element) => {
                return element.itemInfo.assetid === alarm.name;
            });

            // check if the bookmark was found, it might have been deleted since the alarm was set
            if (item) {
                if (item.notifType === 'chrome') {
                    const iconFullURL = `https://steamcommunity.com/economy/image/${item.itemInfo.iconURL}/128x128`;
                    chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
                        const message = permission
                            ? 'Click here to see your bookmarks!'
                            : `${item.itemInfo.name} is tradable!`;

                        chrome.notifications.create(
                            alarm.name,
                            {
                                type: 'basic',
                                iconUrl: iconFullURL,
                                title: `${item.itemInfo.name} is tradable!`,
                                message,
                            },
                            () => {
                                playNotificationSound();
                            },
                        );
                    });
                } else if (item.notifType === 'alert') {
                    chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
                        if (permission) {
                            goToInternalPage('index.html?page=bookmarks');
                            setTimeout(() => {
                                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                    chrome.tabs.sendMessage(
                                        tabs[0].id,
                                        {
                                            alert: item.itemInfo.name,
                                        },
                                        () => {},
                                    );
                                });
                            }, 1000);
                        }
                    });
                }
            }
        });
    }
});

setTimeout(() => {
    trackEvent({
        type: 'event',
        action: 'ExtensionRun',
    });
}, 500);
