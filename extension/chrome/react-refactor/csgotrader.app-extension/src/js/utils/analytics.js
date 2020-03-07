import { storageKeys, nonSettingStorageKeys } from 'js/utils/static/storageKeys';

const trackEvent = (event) => {
  const analyticsInfo = {
    type: event.type,
    action: event.action,
    timestamp: Date.now(),
  };

  chrome.storage.local.get('analyticsEvents', (result) => {
    chrome.storage.local.set({
      analyticsEvents: [...result.analyticsEvents, analyticsInfo],
    }, () => {});
  });
};

const sendTelemetry = (retries) => {
  const settingsStorageKeys = [];
  const keysNotToGet = nonSettingStorageKeys;
  keysNotToGet.push('steamAPIKey', 'steamIDOfUser');

  for (const key in storageKeys) if (!keysNotToGet.includes(key)) settingsStorageKeys.push(key);

  const storageKeysForTelemetry = [...settingsStorageKeys];
  storageKeysForTelemetry.push('analyticsEvents', 'clientID');

  chrome.storage.local.get(storageKeysForTelemetry, (result) => {
    if (result.telemetryOn) {
      const eventsSummary = {
        events: {},
        pageviews: {},
      };

      result.analyticsEvents.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];

        if (eventsSummary.events[date] === undefined
          && eventsSummary.pageviews[date] === undefined) {
          eventsSummary.events[date] = {};
          eventsSummary.pageviews[date] = {};
        }

        // eslint-disable-next-line no-unused-expressions
        eventsSummary[`${event.type}s`][date][event.action] !== undefined
          ? eventsSummary[`${event.type}s`][date][event.action] += 1
          : eventsSummary[`${event.type}s`][date][event.action] = 1;
      });

      const preferences = {};

      settingsStorageKeys.forEach((setting) => {
        const customOrDefault = ['customCommentsToReport', 'popupLinks', 'reoccuringMessage', 'reputationMessage'];
        const toIgnore = ['analyticsEvents', 'clientID', 'exchangeRate'];

        if (customOrDefault.includes(setting)) preferences[setting] = JSON.stringify(result[setting]) === JSON.stringify(storageKeys[setting]) ? 'default' : 'custom';
        else if (!toIgnore.includes(setting)) preferences[setting] = result[setting];
      });

      chrome.runtime.getPlatformInfo((platformInfo) => {
        const os = platformInfo.os;

        const requestBody = {
          browserLanguage: navigator.language,
          clientID: result.clientID,
          client_version: chrome.runtime.getManifest().version,
          events: eventsSummary,
          preferences,
          os,
        };

        const getRequest = new Request('https://api.csgotrader.app/analytics/putevents', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        fetch(getRequest).then((response) => {
          if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          else return response.json();
        }).then((body) => {
          if (body.body === undefined || body.body.success === 'false') {
            if (retries < 5) {
              setTimeout(() => {
                const newRetries = retries + 1;
                sendTelemetry(newRetries);
              }, 600 * 5);
            } else {
              const newAnalyticsEvents = result.analyticsEvents.filter((event) => {
                return event.timestamp > (Date.now() - (1000 * 60 * 60 * 24 * 7));
              });
              chrome.storage.local.set({ analyticsEvents: newAnalyticsEvents }, () => {});
            }
          } else if (body.body.success === 'true') {
            chrome.storage.local.set({ analyticsEvents: [] }, () => {});
          }
        }).catch((err) => console.log(err));
      });
    } else chrome.storage.local.set({ analyticsEvents: [] }, () => {});
  });
};

export { trackEvent, sendTelemetry };
