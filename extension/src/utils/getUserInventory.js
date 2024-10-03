import { getFloatInfoFromCache } from 'utils/floatCaching';
import itemTypes from 'utils/static/itemTypes';
import { getPrice, getStickerPriceTotal } from 'utils/pricing';
import { getShortDate } from 'utils/dateTime';
import {
  getDopplerInfo,
  getExteriorFromTags,
  getInspectLink, getNameTag,
  getPattern, getQuality,
  getType,
  parseStickerInfo,
} from 'utils/utilsModular';
import steamApps from 'utils/static/steamApps';
import { getItemMarketLink, getCollection } from 'utils/simpleUtils';

const getUserCSGOInventory = (steamID) => new Promise((resolve, reject) => {
  chrome.storage.local.get(
    ['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider', 'pricingMode'],
    ({
      itemPricing, prices, currency, exchangeRate, pricingProvider, pricingMode,
    }) => {
      const getRequest = new Request(`https://steamcommunity.com/profiles/${steamID}/inventory/json/${steamApps.CSGO.appID}/2/?l=english`);
      fetch(getRequest).then((response) => {
        if (!response.ok) {
          reject(response.statusText);
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        } else return response.json();
      }).then((body) => {
        if (body.success) {
          const items = body.rgDescriptions;
          const ids = body.rgInventory;

          const itemsPropertiesToReturn = [];
          let inventoryTotal = 0.0;
          const duplicates = {};
          const floatCacheAssetIDs = [];

          // counts duplicates
          for (const asset of Object.values(ids)) {
            const assetID = asset.id;
            floatCacheAssetIDs.push(assetID);

            for (const item of Object.values(items)) {
              if (asset.classid === item.classid
                && asset.instanceid === item.instanceid) {
                const marketHashName = item.market_hash_name;
                if (duplicates[marketHashName] === undefined) {
                  const instances = [assetID];
                  duplicates[marketHashName] = {
                    num: 1,
                    instances,
                  };
                } else {
                  duplicates[marketHashName].num += 1;
                  duplicates[marketHashName].instances.push(assetID);
                }
              }
            }
          }
          getFloatInfoFromCache(floatCacheAssetIDs).then(
            (floatCache) => {
              for (const asset of Object.values(ids)) {
                const assetID = asset.id;
                const position = asset.pos;

                for (const item of Object.values(items)) {
                  if (asset.classid === item.classid && asset.instanceid === item.instanceid) {
                    const name = item.name;
                    const marketHashName = item.market_hash_name;
                    let tradability = 'Tradable';
                    let tradabilityShort = 'T';
                    const icon = item.icon_url;
                    const dopplerInfo = (name.includes('Doppler') || name.includes('doppler')) ? getDopplerInfo(icon) : null;
                    const stickers = parseStickerInfo(item.descriptions, 'direct', prices, pricingProvider, pricingMode, exchangeRate, currency);
                    const owner = steamID;
                    let price = null;
                    const type = getType(item.tags);
                    let floatInfo = null;
                    if (floatCache[assetID] !== undefined
                      && floatCache[assetID] !== null && itemTypes[type.key].float) {
                      floatInfo = floatCache[assetID];
                    }
                    const patternInfo = (floatInfo !== null)
                      ? getPattern(marketHashName, floatInfo.paintseed)
                      : null;

                    if (itemPricing) {
                      price = getPrice(marketHashName, dopplerInfo, prices,
                        pricingProvider, pricingMode, exchangeRate, currency);
                      inventoryTotal += parseFloat(price.price);
                    } else price = { price: '', display: '' };

                    if (item.tradable === 0 && item.marketable === 0) {
                      if (item.owner_descriptions[1]?.value) {
                        tradability = item.owner_descriptions[1].value;
                        tradabilityShort = getShortDate(tradability);
                      } else {
                        tradability = 'Not Tradable';
                        tradabilityShort = '';
                      }
                    }
                    
                    itemsPropertiesToReturn.push({
                      name,
                      market_hash_name: marketHashName,
                      name_color: item.name_color,
                      marketlink: getItemMarketLink(steamApps.CSGO.appID, marketHashName),
                      appid: item.appid,
                      contextid: '2',
                      classid: item.classid,
                      instanceid: item.instanceid,
                      assetid: assetID,
                      commodity: item.commodity,
                      position,
                      tradability,
                      tradabilityShort,
                      marketable: item.marketable,
                      iconURL: icon,
                      dopplerInfo,
                      exterior: getExteriorFromTags(item.tags),
                      inspectLink: getInspectLink(item, owner, assetID),
                      quality: getQuality(item.tags),
                      isStatrack: name.includes('StatTrak™'),
                      isSouvenir: name.includes('Souvenir'),
                      starInName: name.includes('★'),
                      stickers,
                      stickerPrice: getStickerPriceTotal(stickers, currency),
                      nametag: getNameTag(item),
                      duplicates: duplicates[marketHashName],
                      owner,
                      price,
                      type,
                      floatInfo,
                      patternInfo,
                      collection: getCollection(item.descriptions),
                    });
                  }
                }
              }
              const inventoryItems = itemsPropertiesToReturn.sort((a, b) => {
                return a.position - b.position;
              });
              resolve({
                items: inventoryItems,
                total: inventoryTotal,
              });
            },
          );
        } else if (body.Error === 'This profile is private.') {
          reject('inventory_private');
        } else {
          reject(body.Error);
        }
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    },
  );
});

// it's used to load other people's inventories by Steam now
// unused atm
const getUserCSGOInventoryAlternative = (steamID) => new Promise((resolve, reject) => {
  chrome.storage.local.get(
    ['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider', 'pricingMode'],
    ({
      itemPricing, prices, currency, exchangeRate, pricingProvider, pricingMode,
    }) => {
      const getRequest = new Request(`https://steamcommunity.com/inventory/${steamID}/730/2/?l=english&count=2000`);
      fetch(getRequest).then((response) => {
        if (!response.ok) {
          reject(response.statusText);
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        } else return response.json();
      }).then((body) => {
        if (body.success) {
          const assets = body.assets;
          const descriptions = body.descriptions;

          const itemsPropertiesToReturn = [];
          let inventoryTotal = 0.0;
          const duplicates = {};
          const floatCacheAssetIDs = [];

          // counts duplicates
          assets.forEach((asset) => {
            floatCacheAssetIDs.push(asset.assetid);
            const description = descriptions.filter((desc) => {
              if (asset.classid === desc.classid && asset.instanceid === desc.instanceid) {
                return desc;
              }
            })[0];

            const marketHashName = description.market_hash_name;
            if (duplicates[marketHashName] === undefined) {
              const instances = [asset.assetid];
              duplicates[marketHashName] = {
                num: 1,
                instances,
              };
            } else {
              duplicates[marketHashName].num += 1;
              duplicates[marketHashName].instances.push(asset.assetid);
            }
          });

          getFloatInfoFromCache(floatCacheAssetIDs).then(
            (floatCache) => {
              assets.forEach((asset) => {
                const item = descriptions.filter((desc) => {
                  if (asset.classid === desc.classid && asset.instanceid === desc.instanceid) {
                    return desc;
                  }
                })[0];
                if (item) {
                  const assetID = asset.assetid;

                  const name = item.name;
                  const marketHashName = item.market_hash_name;
                  let tradability = 'Tradable';
                  let tradabilityShort = 'T';
                  const icon = item.icon_url;
                  const dopplerInfo = (name.includes('Doppler') || name.includes('doppler')) ? getDopplerInfo(icon) : null;
                  const stickers = parseStickerInfo(item.descriptions, 'direct', prices, pricingProvider, pricingMode, exchangeRate, currency);
                  const owner = steamID;
                  let price = null;
                  const type = getType(item.tags);
                  let floatInfo = null;

                  if (floatCache[assetID] !== undefined
                    && floatCache[assetID] !== null && itemTypes[type.key].float) {
                    floatInfo = floatCache[assetID];
                  }
                  const patternInfo = (floatInfo !== null)
                    ? getPattern(marketHashName, floatInfo.paintseed)
                    : null;

                  if (itemPricing) {
                    price = getPrice(marketHashName, dopplerInfo, prices,
                      pricingProvider, pricingMode, exchangeRate, currency);
                    inventoryTotal += parseFloat(price.price);
                  } else price = { price: '', display: '' };

                  if (item.tradable === 0 && item.marketable === 0) {
                    if (item.owner_descriptions[1]?.value) {
                      tradability = 'Tradelocked';
                      tradabilityShort = 'L';
                    } else {
                      tradability = 'Not Tradable';
                      tradabilityShort = '';
                    }
                  }

                  itemsPropertiesToReturn.push({
                    name,
                    market_hash_name: marketHashName,
                    name_color: item.name_color,
                    marketlink: getItemMarketLink(steamApps.CSGO.appID, marketHashName),
                    appid: item.appid.toString(),
                    contextid: '2',
                    classid: item.classid,
                    instanceid: item.instanceid,
                    assetid: assetID,
                    commodity: item.commodity,
                    tradability,
                    tradabilityShort,
                    marketable: item.marketable,
                    iconURL: icon,
                    dopplerInfo,
                    exterior: getExteriorFromTags(item.tags),
                    inspectLink: getInspectLink(item, owner, assetID),
                    quality: getQuality(item.tags),
                    isStatrack: name.includes('StatTrak™'),
                    isSouvenir: name.includes('Souvenir'),
                    starInName: name.includes('★'),
                    stickers,
                    stickerPrice: getStickerPriceTotal(stickers, currency),
                    nametag: getNameTag(item),
                    duplicates: duplicates[marketHashName],
                    owner,
                    price,
                    type,
                    floatInfo,
                    patternInfo,
                    collection: getCollection(item.descriptions),
                  });
                } else {
                  console.log('Description not found for asset:');
                  console.log(asset);
                }
              });

              const sortedItems = itemsPropertiesToReturn.sort((a, b) => {
                return parseInt(b.assetid) - parseInt(a.assetid);
              });

              const itemsWithPosition = sortedItems.map((item, index) => {
                return {
                  ...item,
                  position: index,
                };
              });

              resolve({
                items: itemsWithPosition,
                total: inventoryTotal,
              });
            },
          );
        } else if (body.Error === 'This profile is private.') {
          reject('inventory_private');
        } else {
          reject(body.Error);
        }
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    },
  );
});

const getOtherInventory = (appID, steamID) => new Promise((resolve, reject) => {
  const getRequest = new Request(`https://steamcommunity.com/profiles/${steamID}/inventory/json/${appID}/2/?l=english`);
  fetch(getRequest).then((response) => {
    if (!response.ok) {
      reject(response.statusText);
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    } else return response.json();
  }).then((body) => {
    if (body.success) {
      const items = body.rgDescriptions;
      const ids = body.rgInventory;

      const itemsPropertiesToReturn = [];
      const duplicates = {};

      // counts duplicates
      for (const asset of Object.values(ids)) {
        const assetID = asset.id;
        for (const item of Object.values(items)) {
          if (asset.classid === item.classid
            && asset.instanceid === item.instanceid) {
            const marketHashName = item.market_hash_name;
            if (duplicates[marketHashName] === undefined) {
              const instances = [assetID];
              duplicates[marketHashName] = {
                num: 1,
                instances,
              };
            } else {
              duplicates[marketHashName].num += 1;
              duplicates[marketHashName].instances.push(assetID);
            }
          }
        }
      }
      for (const asset of Object.values(ids)) {
        const assetID = asset.id;
        const position = asset.pos;

        for (const item of Object.values(items)) {
          if (asset.classid === item.classid && asset.instanceid === item.instanceid) {
            const name = item.name;
            const marketHashName = item.market_hash_name;
            let tradability = 'Tradable';
            let tradabilityShort = 'T';
            const icon = item.icon_url;
            const owner = steamID;

            if (item.tradable === 0 && item.marketable === 0) {
              if (item.owner_descriptions[1]?.value) {
                tradability = item.owner_descriptions[1].value;
                tradabilityShort = getShortDate(tradability);
              } else {
                tradability = 'Not Tradable';
                tradabilityShort = '';
              }
            }
            
            itemsPropertiesToReturn.push({
              name,
              market_hash_name: marketHashName,
              name_color: item.name_color,
              marketlink: getItemMarketLink(appID, marketHashName),
              appid: item.appid,
              contextid: '2',
              commodity: item.commodity,
              classid: item.classid,
              instanceid: item.instanceid,
              assetid: assetID,
              position,
              tradability,
              tradabilityShort,
              marketable: item.marketable,
              iconURL: icon,
              duplicates: duplicates[marketHashName],
              owner,
            });
          }
        }
      }
      const inventoryItems = itemsPropertiesToReturn.sort((a, b) => {
        return a.position - b.position;
      });
      resolve({ items: inventoryItems });
    } else if (body.Error === 'This profile is private.') {
      reject('inventory_private');
    } else {
      reject(body.Error);
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

export { getUserCSGOInventory, getUserCSGOInventoryAlternative, getOtherInventory };
