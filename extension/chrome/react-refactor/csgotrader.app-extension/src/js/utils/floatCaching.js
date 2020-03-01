import { arrayFromArrayOrNotArray } from 'js/utils/utilsModular';

const addToFloatCache = (assetID, floatInfo) => {
    chrome.storage.local.set({[`floatCache_${assetID}`]:
            {
                floatInfo,
                added: Date.now(),
                lastUsed: Date.now(),
                used: 0
            }
    }, () => {});
};

const getFloatInfoFromCache = (assetIDs) => {
    return new Promise((resolve, reject) => {
        assetIDs = arrayFromArrayOrNotArray(assetIDs);

        const floatInfoToReturn = {};
        const floatStorageKeys = assetIDs.map( ID => {
            return  `floatCache_${ID}`;
        });

        chrome.storage.local.get(floatStorageKeys, (result) => {
            assetIDs.forEach( assetID => {
                const itemFloatCache = result[`floatCache_${assetID}`];
                floatInfoToReturn[assetID] = (itemFloatCache !== undefined && itemFloatCache !== null) ? itemFloatCache.floatInfo : null;
            });
            updateFloatCache(assetIDs);
            resolve(floatInfoToReturn)
        });
    });
};

const updateFloatCache = (assetIDs) => {
    assetIDs = arrayFromArrayOrNotArray(assetIDs);

    const floatStorageKeys = assetIDs.map( ID => {
        return `floatCache_${ID}`;
    });

    chrome.storage.local.get(floatStorageKeys, (result) => {
        const itemFloatInfos = {};
        for (let floatKey in result) {
            const itemFloatInfo = result[floatKey];
            if (itemFloatInfo !== undefined && itemFloatInfo !== null) {
                itemFloatInfo.lastUsed = Date.now();
                itemFloatInfo.used = itemFloatInfo.used + 1;
                itemFloatInfos[floatKey] = itemFloatInfo;
            }
        }
        chrome.storage.local.set(itemFloatInfos, () => {});
    });
};

const extractUsefulFloatInfo = (floatInfo) => {
    const { floatvalue, paintindex, paintseed, origin_name, min, max, stickers, low_rank } = {...floatInfo};
    return {
        floatvalue, paintindex, paintseed, origin_name, min, max,
        stickers: stickers !== undefined ? stickers : null,
        low_rank: low_rank !== undefined ? low_rank : null
    };
};

const trimFloatCache = () => {
    chrome.storage.local.get(null, (result) => { // gets all storage
        for (let storageKey in result) {
            if (storageKey.substring(0, 11) === 'floatCache_') {
                const timeSinceLastUsed = (Date.now() - result[storageKey].lastUsed) / 1000; // in seconds
                const used = result[storageKey].used;

                // if unused and in cache for over a day, or used but not for over a week, then this whole thing negated because the ones that do not fit this wil remain in the cache
                if ((used === 0 && timeSinceLastUsed > 86400) || (used > 0 && timeSinceLastUsed > 604800)) {
                    chrome.storage.local.remove([storageKey], () => {});
                }
            }
        }
    });
};

export { trimFloatCache, getFloatInfoFromCache, extractUsefulFloatInfo, addToFloatCache, updateFloatCache };