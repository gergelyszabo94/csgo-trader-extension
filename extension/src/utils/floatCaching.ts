import { FloatInfo, FloatsInfo } from 'types';
import { arrayFromArrayOrNotArray } from 'utils/utilsModular';
import { chromeStorageLocalGet, chromeStorageLocalRemove, chromeStorageLocalSet } from './promiseUtils';

export const addToFloatCache = async (assetID: string, floatInfo: FloatInfo) => {
    await chrome.storage.local.set({
        [`floatCache_${assetID}`]: {
            floatInfo,
            added: Date.now(),
            lastUsed: Date.now(),
            used: 0,
        },
    });
};

export const updateFloatCache = async (assetIDs: string[] | string[]): Promise<void> => {
    const assetIDsArray = arrayFromArrayOrNotArray(assetIDs);

    const floatStorageKeys = assetIDsArray.map((ID) => {
        return `floatCache_${ID}`;
    });

    const result = await chromeStorageLocalGet(floatStorageKeys);
    const itemFloatInfos = {};
    for (const [floatKey, itemFloatInfo] of Object.entries(result)) {
        if (itemFloatInfo) {
            itemFloatInfo.lastUsed = Date.now();
            itemFloatInfo.used += 1;
            itemFloatInfos[floatKey] = itemFloatInfo;
        }
    }

    await chromeStorageLocalSet(itemFloatInfos);
};

export const getFloatInfoFromCache = async (assetIDs: string | string[]): Promise<FloatsInfo> => {
    const assetIDsArray = arrayFromArrayOrNotArray(assetIDs);

    const floatInfoToReturn = {};
    const floatStorageKeys = assetIDsArray.map((ID) => {
        return `floatCache_${ID}`;
    });

    const result = await chromeStorageLocalGet(floatStorageKeys);
    assetIDsArray.forEach((assetID) => {
        const itemFloatCache = result[`floatCache_${assetID}`];
        if (itemFloatCache) {
            floatInfoToReturn[assetID] = itemFloatCache.floatInfo;
        }
    });
    await updateFloatCache(assetIDsArray);
    return floatInfoToReturn;
};

export const extractUsefulFloatInfo = (floatInfo: FloatInfo) => {
    const {
        // eslint-disable-next-line camelcase
        floatvalue,
        paintindex,
        paintseed,
        origin_name,
        min,
        max,
        stickers,
        low_rank,
    } = { ...floatInfo };
    return {
        floatvalue,
        paintindex,
        paintseed,
        origin_name,
        min,
        max,
        stickers: stickers !== undefined ? stickers : null,
        // eslint-disable-next-line camelcase
        low_rank: low_rank !== undefined ? low_rank : null,
    };
};

export const trimFloatCache = async () => {
    const result = await chromeStorageLocalGet();

    for (const [key, asset] of Object.entries(result)) {
        if (key.startsWith('floatCache_')) {
            const timeSinceLastUsed = (Date.now() - asset.lastUsed) / 1000; // in seconds
            const used = asset.used;

            // if unused and in cache for over a day, or used but not for over a week
            // then this whole thing negated
            // because the ones that do not fit this wil remain in the cache
            if ((used === 0 && timeSinceLastUsed > 86400) || (used > 0 && timeSinceLastUsed > 604800)) {
                await chromeStorageLocalRemove(key);
            }
        }
    }
};
