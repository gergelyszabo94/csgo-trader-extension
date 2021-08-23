import axios from 'axios';
import { sleep } from './simpleUtils';
import { AnalyticsEvent, AnalyticsEvents } from 'types/storage';
import { nonSettingStorageKeys, storageKeys } from 'utils/static/storageKeys';

interface TrackEventProps {
    type: string;
    action: string;
}

const trackEvent = async ({ type, action }: TrackEventProps) => {
    const analyticsInfo: AnalyticsEvent = {
        type: type,
        action: action,
        timestamp: Date.now(),
    };

    const analyticsEvents = (await chrome.storage.local.get('analyticsEvents')).analyticsEvents as AnalyticsEvent[];
    await chrome.storage.local.set({
        analyticsEvents: [...analyticsEvents, analyticsInfo],
    });
};

const sendTelemetry = async (retries?: number) => {
    const settingsStorageKeys: string[] = [];
    const keysNotToGet = nonSettingStorageKeys;
    keysNotToGet.push('steamAPIKey', 'steamIDOfUser');

    for (const key in storageKeys) if (!keysNotToGet.includes(key)) settingsStorageKeys.push(key);

    const storageKeysForTelemetry = [...settingsStorageKeys];
    storageKeysForTelemetry.push('analyticsEvents', 'clientID');

    const result = await chrome.storage.local.get(storageKeysForTelemetry);

    if (!result.telemetryOn) {
        await chrome.storage.local.set({ analyticsEvents: [] });
        return;
    }

    const eventsSummary = {
        events: {},
        pageviews: {},
    };

    result.analyticsEvents.forEach((event: AnalyticsEvent) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];

        if (eventsSummary.events[date] === undefined && eventsSummary.pageviews[date] === undefined) {
            eventsSummary.events[date] = {};
            eventsSummary.pageviews[date] = {};
        }

        // there was a bug that created malformed events with no type
        if (event.type !== undefined) {
            // eslint-disable-next-line no-unused-expressions
            eventsSummary[`${event.type}s`][date][event.action] !== undefined
                ? (eventsSummary[`${event.type}s`][date][event.action] += 1)
                : (eventsSummary[`${event.type}s`][date][event.action] = 1);
        }
    });

    const preferences = {};
    const customOrDefault = ['customCommentsToReport', 'popupLinks', 'reoccuringMessage', 'reputationMessage'];

    settingsStorageKeys.forEach((setting) => {
        const toIgnore = ['analyticsEvents', 'clientID', 'exchangeRate'];

        if (customOrDefault.includes(setting)) {
            preferences[setting] =
                JSON.stringify(result[setting]) === JSON.stringify(storageKeys[setting]) ? 'default' : 'custom';
        } else if (!toIgnore.includes(setting)) {
            preferences[setting] = result[setting];
        }
    });

    // can this be a promise?
    // looks like it can be for firefox 
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getPlatformInfo
    // doesn't look like it can be for chrome
    
    chrome.runtime.getPlatformInfo(async (platformInfo) => {
        try {

            const body = {
                browserLanguage: navigator.language,
                clientID: result.clientID,
                client_version: chrome.runtime.getManifest().version,
                events: eventsSummary,
                os: platformInfo.os,
                preferences,
            };

            const response = await axios.post('https://api.csgotrader.app/analytics/putevents', {
                body: JSON.stringify(body),
            });

            if (response.status !== 200) {
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            }
            const data = response.data;
            if (data.body === undefined || data.body.success === 'false') {
                if (retries < 5) {
                    await sleep(600 * 5);
                    await sendTelemetry(retries + 1);
                } else {
                    const analyticsEvents = result.analyticsEvents as AnalyticsEvent[];
                    const newAnalyticsEvents = analyticsEvents.filter((event) => {
                        return event.timestamp > Date.now() - 1000 * 60 * 60 * 24 * 7;
                    });
                    await chrome.storage.local.set({ analyticsEvents: newAnalyticsEvents });
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
};

export { trackEvent, sendTelemetry };
