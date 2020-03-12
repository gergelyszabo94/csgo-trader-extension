import { getFloatInfoFromCache, extractUsefulFloatInfo, addToFloatCache } from 'utils/floatCaching';
import {
  getExteriorFromTags, getDopplerInfo, getQuality, getType, parseStickerInfo, getPattern,
  goToInternalPage, validateSteamAPIKey, getAssetIDFromInspectLink,
} from 'utils/utilsModular';
import { getShortDate } from 'utils/dateTime';
import { getStickerPriceTotal, getPrice, prettyPrintPrice } from 'utils/pricing';
import itemTypes from 'utils/static/itemTypes';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.inventory !== undefined) {
    chrome.storage.local.get(
      ['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider'],
      (result) => {
        const prices = result.prices;
        const steamID = request.inventory;

        const getRequest = new Request(`https://steamcommunity.com/profiles/${steamID}/inventory/json/730/2/?l=english`);

        fetch(getRequest).then((response) => {
          if (!response.ok) {
            sendResponse('error');
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          } else return response.json();
        }).then((body) => {
          const items = body.rgDescriptions;
          const ids = body.rgInventory;

          const itemsPropertiesToReturn = [];
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
                    const nameColor = item.name_color;
                    const marketLink = `https://steamcommunity.com/market/listings/730/${item.market_hash_name}`;
                    const classID = item.classid;
                    const instanceId = item.instanceid;
                    const exterior = getExteriorFromTags(item.tags);
                    let tradability = 'Tradable';
                    let tradabilityShort = 'T';
                    const icon = item.icon_url;
                    const dopplerInfo = (name.includes('Doppler') || name.includes('doppler')) ? getDopplerInfo(icon) : null;
                    const isStatTrack = name.includes('StatTrak™');
                    const isSouvenir = name.includes('Souvenir');
                    const starInName = name.includes('★');
                    const quality = getQuality(item.tags);
                    const stickers = parseStickerInfo(item.descriptions, 'direct', prices, result.pricingProvider, result.exchangeRate, result.currency);
                    const stickerPrice = getStickerPriceTotal(stickers, result.currency);
                    let nameTag;
                    let inspectLink = null;
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

                    if (result.itemPricing) {
                      price = getPrice(marketHashName, dopplerInfo, prices,
                        result.pricingProvider, result.exchangeRate, result.currency);
                    } else price = { price: '', display: '' };

                    try {
                      if (item.fraudwarnings !== undefined || item.fraudwarnings[0] !== undefined) {
                        nameTag = item.fraudwarnings[0].split('Name Tag: ')[1];
                      }
                      // eslint-disable-next-line no-empty
                    } catch (error) {}

                    if (item.tradable === 0) {
                      tradability = item.cache_expiration;
                      tradabilityShort = getShortDate(tradability);
                    }
                    if (item.marketable === 0) {
                      tradability = 'Not Tradable';
                      tradabilityShort = '';
                    }

                    try {
                      if (item.actions !== undefined && item.actions[0] !== undefined) {
                        const beggining = item.actions[0].link.split('%20S')[0];
                        const end = item.actions[0].link.split('%assetid%')[1];
                        inspectLink = (`${beggining}%20S${owner}A${assetID}${end}`);
                      }
                      // eslint-disable-next-line no-empty
                    } catch (error) {}

                    itemsPropertiesToReturn.push({
                      name,
                      market_hash_name: marketHashName,
                      name_color: nameColor,
                      marketlink: marketLink,
                      classid: classID,
                      instanceid: instanceId,
                      assetid: assetID,
                      position,
                      tradability,
                      tradabilityShort,
                      marketable: item.marketable,
                      iconURL: icon,
                      dopplerInfo,
                      exterior,
                      inspectLink,
                      quality,
                      isStatrack: isStatTrack,
                      isSouvenir,
                      starInName,
                      stickers,
                      stickerPrice,
                      nametag: nameTag,
                      duplicates: duplicates[marketHashName],
                      owner,
                      price,
                      type,
                      floatInfo,
                      patternInfo,
                    });
                  }
                }
              }
              sendResponse({
                inventory: itemsPropertiesToReturn.sort((a, b) => {
                  return a.position - b.position;
                }),
              });
            },
          );
        }).catch((err) => {
          console.log(err);
          sendResponse({ inventory: 'error' });
        });
      },
    );
    return true; // async return to signal that it will return later
  }
  if (request.inventoryTotal !== undefined) {
    const inventory = request.inventoryTotal;
    let total = 0.0;
    chrome.storage.local.get(['prices', 'exchangeRate', 'currency', 'pricingProvider'], (result) => {
      inventory.forEach((item) => {
        total += parseFloat(getPrice(item.market_hash_name, item.dopplerInfo, result.prices,
          result.pricingProvider, result.exchangeRate, result.currency).price);
      });
      sendResponse({ inventoryTotal: prettyPrintPrice(result.currency, (total).toFixed(0)) });
    });
    return true;
  }
  if (request.addPricesAndFloatsToInventory !== undefined) {
    const inventory = request.addPricesAndFloatsToInventory;
    chrome.storage.local.get(
      ['prices', 'exchangeRate', 'currency', 'itemPricing', 'pricingProvider'],
      (result) => {
        if (result.itemPricing) {
          const floatCacheAssetIDs = inventory.map((item) => {
            return item.assetid;
          });
          getFloatInfoFromCache(floatCacheAssetIDs).then(
            (floatCache) => {
              inventory.forEach((item) => {
                if (result.prices[item.market_hash_name] !== undefined
                  && result.prices[item.market_hash_name] !== 'null') {
                  item.price = getPrice(item.market_hash_name, item.dopplerInfo, result.prices,
                    result.pricingProvider, result.exchangeRate, result.currency);
                }
                if (floatCache[item.assetid] !== undefined && floatCache[item.assetid] !== null
                  && itemTypes[item.type.key].float) {
                  item.floatInfo = floatCache[item.assetid];
                  item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintSeed);
                }
                const stickers = parseStickerInfo(item.descriptions, 'direct', result.prices,
                  result.pricingProvider, result.exchangeRate, result.currency);
                const stickerPrice = getStickerPriceTotal(stickers, result.currency);
                item.stickers = stickers;
                item.stickerPrice = stickerPrice;
              });
              sendResponse({ addPricesAndFloatsToInventory: inventory });
            },
          );
        } else sendResponse({ addPricesAndFloatsToInventory: inventory });
      },
    );
    return true;
  }
  if (request.badgetext !== undefined) {
    chrome.browserAction.setBadgeText({ text: request.badgetext });
    sendResponse({ badgetext: request.badgetext });
  } else if (request.openInternalPage !== undefined) {
    chrome.permissions.contains({ permissions: ['tabs'] }, (result) => {
      if (result) {
        goToInternalPage(request.openInternalPage);
        sendResponse({ openInternalPage: request.openInternalPage });
      } else sendResponse({ openInternalPage: 'no_tabs_api_access' });
    });
    return true;
  } else if (request.setAlarm !== undefined) {
    chrome.alarms.create(request.setAlarm.name, {
      when: new Date(request.setAlarm.when).valueOf(),
    });
    // chrome.alarms.getAll((alarms) => {console.log(alarms)});
    sendResponse({ setAlarm: request.setAlarm });
  } else if (request.apikeytovalidate !== undefined) {
    validateSteamAPIKey(request.apikeytovalidate).then(
      (apiKeyValid) => {
        sendResponse({ valid: apiKeyValid });
      }, (error) => {
        console.log(error);
        sendResponse('error');
      },
    );
    return true; // async return to signal that it will return later
  } else if (request.GetPlayerSummaries !== undefined) {
    chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], (result) => {
      if (result.apiKeyValid) {
        const apiKey = result.steamAPIKey;
        const steamID = request.GetPlayerSummaries;

        const getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamID}`);

        fetch(getRequest).then((response) => {
          if (!response.ok) {
            sendResponse('error');
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          } else return response.json();
        }).then((body) => {
          try {
            sendResponse({
              personastate: body.response.players[0].personastate,
              apiKeyValid: true,
            });
          } catch (e) {
            console.log(e);
            sendResponse('error');
          }
        }).catch((err) => {
          console.log(err);
          sendResponse('error');
        });
      } else sendResponse({ apiKeyValid: false });
    });
    return true; // async return to signal that it will return later
  } else if (request.fetchFloatInfo !== undefined) {
    const inspectLink = request.fetchFloatInfo;
    if (inspectLink !== null) {
      const assetID = getAssetIDFromInspectLink(inspectLink);
      const getRequest = new Request(`https://api.csgofloat.com/?url=${inspectLink}`);

      fetch(getRequest).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          sendResponse('error');
        } else return response.json();
      }).then((body) => {
        if (body.iteminfo.floatvalue !== undefined) {
          const usefulFloatInfo = extractUsefulFloatInfo(body.iteminfo);
          addToFloatCache(assetID, usefulFloatInfo);
          if (usefulFloatInfo.floatvalue !== 0) sendResponse({ floatInfo: usefulFloatInfo });
          else sendResponse('nofloat');
        } else sendResponse('error');
      }).catch((err) => {
        console.log(err);
        sendResponse('error');
      });
    } else sendResponse('nofloat');
    return true; // async return to signal that it will return later
  } else if (request.getSteamRepInfo !== undefined) {
    const steamID = request.getSteamRepInfo;

    const getRequest = new Request(`https://steamrep.com/api/beta4/reputation/${steamID}?json=1`);

    fetch(getRequest).then((response) => {
      if (!response.ok) {
        sendResponse('error');
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      } else return response.json();
    }).then((body) => {
      sendResponse({ SteamRepInfo: body.steamrep });
    }).catch((err) => {
      console.log(err);
      sendResponse({ SteamRepInfo: 'error' });
    });
    return true; // async return to signal that it will return later
  } else if (request.getTradeOffers !== undefined) {
    chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], (result) => {
      if (result.apiKeyValid) {
        const apiKey = result.steamAPIKey;
        const activesOnly = request.getTradeOffers === 'historical' ? 0 : 1;
        const descriptions = request.getTradeOffers === 'historical' ? 0 : 1;

        const getRequest = new Request(`https://api.steampowered.com/IEconService/GetTradeOffers/v1/?get_received_offers=1&get_sent_offers=1&active_only=${activesOnly}&get_descriptions=${descriptions}&language=english&key=${apiKey}`);

        fetch(getRequest).then((response) => {
          if (!response.ok) {
            sendResponse('error');
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          } else return response.json();
        }).then((body) => {
          try { sendResponse({ offers: body.response, apiKeyValid: true }); } catch (e) {
            console.log(e);
            sendResponse('error');
          }
        }).catch((err) => {
          console.log(err);
          sendResponse('error');
        });
      } else sendResponse({ apiKeyValid: false });
    });
    return true; // async return to signal that it will return later
  } else if (request.getBuyOrderInfo !== undefined) {
    const getRequest = new Request(`https://steamcommunity.com/market/listings/${request.getBuyOrderInfo.appID}/${request.getBuyOrderInfo.market_hash_name}`);

    fetch(getRequest).then((response) => {
      if (!response.ok) {
        sendResponse('error');
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      } else return response.text();
    }).then((body1) => {
      let itemNameId = '';
      try { itemNameId = body1.split('Market_LoadOrderSpread( ')[1].split(' ')[0]; } catch (e) {
        console.log(e);
        console.log(body1);
        sendResponse('error');
      }
      const getRequest2 = new Request(`https://steamcommunity.com/market/itemordershistogram?country=US&language=english&currency=${request.getBuyOrderInfo.currencyID}&item_nameid=${itemNameId}`);
      fetch(getRequest2).then((response) => {
        if (!response.ok) {
          sendResponse('error');
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        } else return response.json();
      }).then((body2) => {
        sendResponse({ getBuyOrderInfo: body2 });
      }).catch((err) => {
        console.log(err);
        sendResponse('error');
      });
    }).catch((err) => {
      console.log(err);
      sendResponse('error');
    });

    return true; // async return to signal that it will return later
  }
});

chrome.runtime.onConnect.addListener(() => {});
