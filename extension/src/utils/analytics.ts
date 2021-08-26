import * as fetcher from 'utils/helpers/fetcher';
import { sleep } from 'utils/simpleUtils';
import { AnalyticsEvent, TelemetryOn } from 'types/storage';
import { nonSettingStorageKeys, storageKeys } from 'utils/static/storageKeys';
import * as runtime from 'utils/helpers/runtime';
import * as localStorage from 'utils/helpers/localStorage';

interface TrackEventProps {
    type: string;
    action: string;
}

export const trackEvent = async ({ type, action }: TrackEventProps) => {
    const analyticsInfo: AnalyticsEvent = {
        type: type,
        action: action,
        timestamp: Date.now(),
    };

    const { analyticsEvents } = await localStorage.get('analyticsEvents');
    await localStorage.set({
        analyticsEvents: [...(analyticsEvents as AnalyticsEvent[]), analyticsInfo],
    });
};

export const sendTelemetry = async (retries?: number) => {
    const settingsStorageKeys: string[] = [];
    const keysNotToGet = nonSettingStorageKeys;
    keysNotToGet.push('steamAPIKey', 'steamIDOfUser');

    for (const key in storageKeys) {
        if (!keysNotToGet.includes(key)) {
            settingsStorageKeys.push(key);
        }
    }

    const storageKeysForTelemetry = [...settingsStorageKeys];
    storageKeysForTelemetry.push('analyticsEvents', 'clientID');

    const result = await localStorage.get(storageKeysForTelemetry);
    const telemetryOn: TelemetryOn = result.telemetryOn;
    const analyticsEvents: AnalyticsEvent[] = result.analyticsEvents;

    if (!telemetryOn) {
        await localStorage.set({ analyticsEvents: [] });
        return;
    }

    const eventsSummary = {
        events: {},
        pageviews: {},
    };

    for (const event of analyticsEvents) {
        const date = new Date(event.timestamp).toISOString().split('T')[0];

        if (eventsSummary.events[date] && eventsSummary.pageviews[date]) {
            eventsSummary.events[date] = {};
            eventsSummary.pageviews[date] = {};
        }

        // there was a bug that created malformed events with no type
        if (event.type) {
            const types = `${event.type}s`;
            // eslint-disable-next-line no-unused-expressions
            eventsSummary[types][date][event.action] !== undefined
                ? (eventsSummary[types][date][event.action] += 1)
                : (eventsSummary[types][date][event.action] = 1);
        }
    }

    const preferences = {};
    const customOrDefault = ['customCommentsToReport', 'popupLinks', 'reoccuringMessage', 'reputationMessage'];

    for (const setting of settingsStorageKeys) {
        const toIgnore = ['analyticsEvents', 'clientID', 'exchangeRate'];

        if (customOrDefault.includes(setting)) {
            if (JSON.stringify(result[setting]) === JSON.stringify(storageKeys[setting])) {
                preferences[setting] = 'default';
            } else {
                preferences[setting] = 'custom';
            }
        } else if (!toIgnore.includes(setting)) {
            preferences[setting] = result[setting];
        }
    }

    const platformInfo = await runtime.platformInfo();
    try {
        const response = await fetcher.post('https://api.csgotrader.app/analytics/putevents', {
            json: {
                browserLanguage: navigator.language,
                clientID: result.clientID,
                client_version: chrome.runtime.getManifest().version,
                events: eventsSummary,
                os: platformInfo.os,
                preferences,
            },
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
        const data = response.json();
        if (data.body === undefined || data.body.success === 'false') {
            if (retries < 5) {
                await sleep(600 * 5);
                await sendTelemetry(retries + 1);
                return;
            } else {
                const newAnalyticsEvents = analyticsEvents.filter((event) => {
                    return event.timestamp > Date.now() - 1000 * 60 * 60 * 24 * 7;
                });
                await localStorage.set({ analyticsEvents: newAnalyticsEvents });
            }
        }
    } catch (err) {
        console.log(err);
    }
};
