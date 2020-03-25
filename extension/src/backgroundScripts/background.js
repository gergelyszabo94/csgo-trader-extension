import { storageKeys } from 'utils/static/storageKeys';
import { trackEvent, sendTelemetry } from 'utils/analytics';
import { updatePrices, updateExchangeRates } from 'utils/pricing';
import { scrapeSteamAPIkey, goToInternalPage, uuidv4 } from 'utils/utilsModular';
import { trimFloatCache } from 'utils/floatCaching';

// handles install and update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // sets the default options for first run
    // (on install from the webstore/amo or when loaded in developer mode)
    for (const key in storageKeys) {
      // id generated to identify the extension installation
      // a user can use use multiple installations of the extension
      if (key === 'clientID') chrome.storage.local.set({ [key]: uuidv4() }, () => {});
      else chrome.storage.local.set({ [key]: storageKeys[key] }, () => {});
    }

    trackEvent({
      type: 'event',
      action: 'ExtensionInstall',
    });

    // tries to set the api key - only works if the user has already generated one before
    scrapeSteamAPIkey();

    chrome.browserAction.setBadgeText({ text: 'I' });
    chrome.notifications.create('installed', {
      type: 'basic',
      iconUrl: '/images/cstlogo128.png',
      title: 'Extension installed!',
      message: 'Go to the options to set your Steam API key and customize your experience!',
    }, () => {});
  } else if (details.reason === 'update') {
    // sets defaults options for new options that haven't been set yet
    // (for features introduced since the last version)
    // runs when the extension updates or gets reloaded in developer mode
    // it checks whether the setting has ever been set
    // I consider removing older ones since there is no one updating from version that old
    const keysArray = [];
    for (const key of Object.keys(storageKeys)) {
      keysArray.push(key);
    }

    chrome.storage.local.get(keysArray, (result) => {
      for (const key in storageKeys) {
        if (result[key] === undefined) {
          // id generated to identify the extension installation
          // a user can use use multiple installations of the extension
          if (key === 'clientID') chrome.storage.local.set({ [key]: uuidv4() }, () => {});
          else chrome.storage.local.set({ [key]: storageKeys[key] }, () => {});
        }
      }
    });

    // during the React refactor the links had to be changed
    // remove this code in a couple of months when the majority of the users have updated
    chrome.storage.local.get('popupLinks', (result) => {
      for (const popupLink of result.popupLinks) {
        if (popupLink.id === 'about') {
          popupLink.id = 'faq';
          popupLink.name = 'FAQ';
          popupLink.url = 'https://csgotrader.app/faq/';
        } else if (popupLink.id === 'options') {
          popupLink.url = 'index.html';
        } else if (popupLink.id === 'bookmarks') {
          popupLink.url = 'index.html?page=bookmarks';
        }
      }
      chrome.storage.local.set({ popupLinks: result.popupLinks }, () => {});
    });

    trackEvent({
      type: 'event',
      action: 'ExtensionUpdate',
    });

    chrome.browserAction.setBadgeText({ text: 'U' });

    // notifies the user when the extension is updated
    chrome.storage.local.set({ showUpdatedRibbon: true }, () => {});
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
          }, () => {});
        });
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
  chrome.alarms.create('updatePricesAndExchangeRates', { periodInMinutes: 1440 });
  chrome.alarms.create('retryUpdatePricesAndExchangeRates', { periodInMinutes: 1 });
  chrome.alarms.create('trimFloatCache', { periodInMinutes: 1440 });
  chrome.alarms.create('sendTelemetry', { periodInMinutes: 1440 });
});

// redirects to feedback survey on uninstall
chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSeOpZilYGr3JAPd7_GSh-tCJShVWHpNFoW8joxStzZf1PFq5A/viewform?usp=sf_link', () => {});

// handles what happens when one of the extension's notification gets clicked
chrome.notifications.onClicked.addListener((notificationID) => {
  chrome.browserAction.setBadgeText({ text: '' });
  chrome.permissions.contains({
    permissions: ['tabs'],
  }, (result) => {
    if (result) {
      if (notificationID === 'updated') {
        chrome.tabs.create({
          url: 'https://csgotrader.app/changelog/',
        });
      } else goToInternalPage('index.html?page=bookmarks');
    }
  });
});

// handles periodic and timed events like bookmarked items becoming tradable
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updatePricesAndExchangeRates') {
    chrome.storage.local.get('itemPricing', (result) => {
      if (result.itemPricing === true) updatePrices();
    });
    updateExchangeRates();
  } else if (alarm.name === 'retryUpdatePricesAndExchangeRates') {
    chrome.storage.local.get('prices', (result) => {
      if (result.prices === null) updatePrices();
      else chrome.alarms.clear('retryUpdatePricesAndExchangeRates', () => {});
    });
  } else if (alarm.name === 'trimFloatCache') trimFloatCache();
  else if (alarm.name === 'sendTelemetry') sendTelemetry(0);
  else {
    chrome.browserAction.getBadgeText({}, (result) => {
      if (result === '' || result === 'U' || result === 'I') chrome.browserAction.setBadgeText({ text: '1' });
      else chrome.browserAction.setBadgeText({ text: (parseInt(result) + 1).toString() });
    });
    chrome.storage.local.get('bookmarks', (result) => {
      const item = result.bookmarks.find((element) => {
        return element.itemInfo.assetid === alarm.name;
      });

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
          }, () => {});
        });
      } else if (item.notifType === 'alert') {
        chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
          if (permission) {
            goToInternalPage('index.html?page=bookmarks');
            setTimeout(() => {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  alert: item.itemInfo.name,
                }, () => {});
              });
            }, 1000);
          }
        });
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
