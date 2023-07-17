import { arrayFromArrayOrNotArray } from 'utils/utilsModular';

const addToFloatCache = (assetID, floatInfo) => {
  chrome.storage.local.set({
    [`floatCache_${assetID}`]:
            {
              floatInfo,
              added: Date.now(),
              lastUsed: Date.now(),
              used: 0,
            },
  }, () => {});
};

const removeFromFloatCache = (assetID) => {
  chrome.storage.local.remove(`floatCache_${assetID}`, () => {});
};

const updateFloatCache = (assetIDs) => {
  const assetIDsArray = arrayFromArrayOrNotArray(assetIDs);

  const floatStorageKeys = assetIDsArray.map((ID) => {
    return `floatCache_${ID}`;
  });

  chrome.storage.local.get(floatStorageKeys, (result) => {
    const itemFloatInfos = {};
    for (const [floatKey, itemFloatInfo] of Object.entries(result)) {
      if (itemFloatInfo) {
        itemFloatInfo.lastUsed = Date.now();
        itemFloatInfo.used += 1;
        itemFloatInfos[floatKey] = itemFloatInfo;
      }
    }
    chrome.storage.local.set(itemFloatInfos, () => {});
  });
};

const getFloatInfoFromCache = (assetIDs) => {
  return new Promise((resolve) => {
    const assetIDsArray = arrayFromArrayOrNotArray(assetIDs);

    const floatInfoToReturn = {};
    const floatStorageKeys = assetIDsArray.map((ID) => {
      return `floatCache_${ID}`;
    });

    chrome.storage.local.get(floatStorageKeys, (result) => {
      assetIDsArray.forEach((assetID) => {
        const itemFloatCache = result[`floatCache_${assetID}`];
        floatInfoToReturn[assetID] = (itemFloatCache !== undefined && itemFloatCache !== null)
          ? itemFloatCache.floatInfo
          : null;
      });
      updateFloatCache(assetIDsArray);
      resolve(floatInfoToReturn);
    });
  });
};

const extractUsefulFloatInfo = (floatInfo) => {
  const {
    floatvalue, paintindex, paintseed, defindex,
    // eslint-disable-next-line camelcase
    origin_name, min, max, stickers, low_rank, high_rank,
  } = { ...floatInfo };
  return {
    floatvalue,
    paintindex,
    paintseed,
    defindex,
    // eslint-disable-next-line camelcase
    origin_name,
    min,
    max,
    stickers: stickers !== undefined ? stickers : null,
    // eslint-disable-next-line camelcase
    low_rank: low_rank !== undefined ? low_rank : null,
    // eslint-disable-next-line camelcase
    high_rank: high_rank !== undefined ? high_rank : null,
  };
};

const trimFloatCache = () => {
  chrome.storage.local.get(null, (result) => { // gets all storage
    for (const storageKey in result) {
      if (storageKey.substring(0, 11) === 'floatCache_') {
        const timeSinceLastUsed = (Date.now() - result[storageKey].lastUsed) / 1000; // in seconds
        const used = result[storageKey].used;

        // if unused and in cache for over a day, or used but not for over a week
        // then this whole thing negated
        // because the ones that do not fit this will remain in the cache
        if ((used === 0 && timeSinceLastUsed > 86400) || (used > 0 && timeSinceLastUsed > 604800)) {
          chrome.storage.local.remove([storageKey], () => {});
        }
      }
    }
  });
};

export {
  trimFloatCache, getFloatInfoFromCache, extractUsefulFloatInfo,
  addToFloatCache, updateFloatCache, removeFromFloatCache,
};
