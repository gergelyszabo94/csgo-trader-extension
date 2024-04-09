import { storageKeys } from 'utils/static/storageKeys';
import { updatePrices, updateExchangeRates, getUserCurrencyBestGuess } from 'utils/pricing';
import {
  setAPIKeyFirstTime, setAccessTokenFirstTime, goToInternalPage,
} from 'utils/utilsModular';
import {
  getGroupInvites, updateFriendRequest,
  ignoreGroupRequest, removeOldFriendRequestEvents,
} from 'utils/friendRequests';
import { trimFloatCache } from 'utils/floatCaching';
import {
  playNotificationSound,
} from 'utils/notifications';
import { updateTrades, removeOldOfferEvents } from 'utils/tradeOffers';
import './messaging';

// handles install and update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // sets the default options for first run
    // (on install from the webstore/amo or when loaded in developer mode)
    for (const [key, value] of Object.entries(storageKeys)) {
      chrome.storage.local.set({ [key]: value }, () => { });
    }

    // sets extension currency to Steam currency when possible
    // the delay is to wait for exchange rates data to be set
    setTimeout(() => {
      getUserCurrencyBestGuess().then((currency) => {
        chrome.storage.local.get(['exchangeRates'], ({ exchangeRates }) => {
          chrome.storage.local.set({
            currency,
            exchangeRate: exchangeRates[currency],
          });
        });
      });
    }, 20000);

    // tries to set the steam access token, the user must be logged in for this
    setAccessTokenFirstTime();
    // tries to set the api key - only works if the user has already generated one before
    setAPIKeyFirstTime();

    chrome.action.setBadgeText({ text: 'I' });
    chrome.notifications.create('installed', {
      type: 'basic',
      iconUrl: '/images/cstlogo128.png',
      title: 'Extension installed!',
      message: 'Go to the options through the extension popup and customize your experience!',
    }, () => {
      playNotificationSound();
    });
  } else if (details.reason === 'update') {
    // sets defaults options for new options that haven't been set yet
    // (for features introduced since the last version)
    // runs when the extension updates or gets reloaded in developer mode
    // it checks whether the setting has ever been set
    // I consider removing older ones since there is no one updating from version that old
    const keys = Object.keys(storageKeys);

    chrome.storage.local.get(keys, (result) => {
      for (const [storageKey, storageValue] of Object.entries(storageKeys)) {
        // so the site bot list gets updated
        if (result[storageKey] === undefined || storageKey === 'legitSiteBotGroup') {
          chrome.storage.local.set({ [storageKey]: storageValue }, () => { });
        }
      }
    });

    chrome.action.setBadgeText({ text: 'U' });

    // notifies the user when the extension is updated
    chrome.storage.local.set({ showUpdatedRibbon: true }, () => { });
    chrome.storage.local.get('notifyOnUpdate', (result) => {
      if (result.notifyOnUpdate) {
        const version = chrome.runtime.getManifest().version;
        chrome.permissions.contains({
          permissions: ['tabs'],
        }, (permission) => {
          const message = permission
            ? 'You can check the changelog by clicking here!'
            : 'Check the changelog for the hot new stuff!';

          chrome.notifications.create('updated', {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: `Extension updated to ${version}!`,
            message,
          }, () => {
            playNotificationSound();
          });
        });
      }
    });
  }

  // updates the prices and exchange rates
  // retries periodically if it's the first time (on install)
  // and it fails to update prices/exchange rates
  updatePrices();
  updateExchangeRates();
  chrome.alarms.create('offerMonitoring', { periodInMinutes: 2 });
  chrome.alarms.create('friendRequestMonitoring', { periodInMinutes: 5 });
  chrome.alarms.create('retryUpdatePricesAndExchangeRates', { periodInMinutes: 1 });
  chrome.alarms.create('dailyScheduledTasks', { periodInMinutes: 1440 });
  chrome.storage.local.get('priceUpdateFreq', ({ priceUpdateFreq }) => {
    const tempPriceUpdateFreq = priceUpdateFreq;
    chrome.alarms.create('priceUpdate', { periodInMinutes: tempPriceUpdateFreq * 60 });
  });
});

// redirects to feedback survey on uninstall
chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSdGzY8TrSjfZZtfoerFdAna1E79Y13afxNKG1yytjZkypKTpg/viewform?usp=sf_link', () => { });

// handles what happens when one of the extension's notification gets clicked
chrome.notifications.onClicked.addListener((notificationID) => {
  chrome.action.setBadgeText({ text: '' });
  chrome.permissions.contains({
    permissions: ['tabs'],
  }, (granted) => {
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
  });
});

// handles periodic and timed events like bookmarked items becoming tradable
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'retryUpdatePricesAndExchangeRates') {
    chrome.storage.local.get('prices', (result) => {
      if (result.prices === null) updatePrices();
      else chrome.alarms.clear('retryUpdatePricesAndExchangeRates', () => { });
    });
  } else if (alarm.name === 'offerMonitoring') {
    chrome.storage.local.get(['monitorIncomingOffers'], ({ monitorIncomingOffers }) => {
      if (monitorIncomingOffers) {
        updateTrades().then(() => { }).catch((e) => { console.log(e); });
      }
    });
  } else if (alarm.name === 'friendRequestMonitoring') { // also handles group invites and notification about being logged out
    chrome.storage.local.get([
      'monitorFriendRequests', 'ignoreGroupInvites', 'notifyAboutBeingLoggedOut', 'notifyAboutBeingLoggedOutOnDiscord',
    ], ({
      monitorFriendRequests, ignoreGroupInvites,
      notifyAboutBeingLoggedOut, notifyAboutBeingLoggedOutOnDiscord,
    }) => {
      if (monitorFriendRequests || notifyAboutBeingLoggedOut
        || notifyAboutBeingLoggedOutOnDiscord) updateFriendRequest();
      if (ignoreGroupInvites) {
        getGroupInvites().then((inviters) => {
          inviters.forEach((inviter) => {
            ignoreGroupRequest(inviter.steamID);
          });
        });
      }
    });
  } else if (alarm.name === 'priceUpdate') {
    chrome.storage.local.get('itemPricing', ({ itemPricing }) => {
      if (itemPricing) updatePrices();
    });
  } else if (alarm.name === 'dailyScheduledTasks') {
    trimFloatCache();
    removeOldFriendRequestEvents();
    removeOldOfferEvents();
    updateExchangeRates();
  } else {
    // this is when bookmarks notification are handled
    chrome.action.getBadgeText({}, (result) => {
      if (result === '' || result === 'U' || result === 'I') chrome.action.setBadgeText({ text: '1' });
      else chrome.action.setBadgeText({ text: (parseInt(result) + 1).toString() });
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

            chrome.notifications.create(alarm.name, {
              type: 'basic',
              iconUrl: iconFullURL,
              title: `${item.itemInfo.name} is tradable!`,
              message,
            }, () => {
              playNotificationSound();
            });
          });
        } else if (item.notifType === 'alert') {
          chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
            if (permission) {
              goToInternalPage('index.html?page=bookmarks');
              setTimeout(() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    alert: item.itemInfo.name,
                  }, () => {
                  });
                });
              }, 1000);
            }
          });
        }
      }
    });
  }
});
