import { getFloatInfoFromCache, extractUsefulFloatInfo, addToFloatCache } from 'utils/floatCaching';
import {
  parseStickerInfo, getPattern, goToInternalPage, validateSteamAPIKey,
  getAssetIDFromInspectLink, getSteamRepInfo,
} from 'utils/utilsModular';
import { getStickerPriceTotal, getPrice, prettyPrintPrice } from 'utils/pricing';
import itemTypes from 'utils/static/itemTypes';
import { getPlayerSummaries } from 'utils/ISteamUser';
import getUserCSGOInventory from 'utils/getUserCSGOInventory';

// content scripts can't make cross domain requests because of security
// most of the messaging required is to work around this limitation
// and make the request from background script context
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.inventory !== undefined) {
    getUserCSGOInventory(request.inventory).then(({ items, total }) => {
      sendResponse({ items, total });
    }).catch(() => {
      sendResponse('error');
    });
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
  } else if (request.GetPersonaState !== undefined) {
    getPlayerSummaries([request.GetPersonaState]).then((summaries) => {
      sendResponse({
        personastate: summaries[request.GetPersonaState].personastate,
        apiKeyValid: true,
      });
    }).catch((err) => {
      console.log(err);
      if (err === 'api_key_invalid') {
        sendResponse({ apiKeyValid: false });
      } else sendResponse('error');
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
    getSteamRepInfo(request.getSteamRepInfo).then((steamRepInfo) => {
      sendResponse({ SteamRepInfo: steamRepInfo });
    }).catch(() => {
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
    const getRequest = new Request(`https://steamcommunity.com/market/listings/${request.getBuyOrderInfo.appID}/${request.getBuyOrderInfo.marketHashName}`);

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
