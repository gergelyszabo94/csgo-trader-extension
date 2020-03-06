import { getFloatInfoFromCache, extractUsefulFloatInfo, addToFloatCache } from 'js/utils/floatCaching';
import {
    getExteriorFromTags, getDopplerInfo, getQuality, getType, parseStickerInfo, getPattern,
    goToInternalPage, validateSteamAPIKey, getAssetIDFromInspectLink
} from 'js/utils/utilsModular';
import { getShortDate } from 'js/utils/dateTime';
import { getStickerPriceTotal, getPrice, prettyPrintPrice } from 'js/utils/pricing';
import itemTypes from "js/utils/static/itemTypes";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.inventory !== undefined) {
        chrome.storage.local.get(['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider'], (result) => {
            let prices = result.prices;
            let steamID = request.inventory;

            let getRequest = new Request(`https://steamcommunity.com/profiles/${steamID}/inventory/json/730/2/?l=english`);

            fetch(getRequest).then((response) => {
                if (!response.ok) {
                    sendResponse('error');
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                }
                else return response.json();
            }).then((body) => {
                let items = body.rgDescriptions;
                let ids = body.rgInventory;

                let itemsPropertiesToReturn = [];
                let duplicates = {};
                let floatCacheAssetIDs = [];


                // counts duplicates
                for (let asset in ids) {
                    let assetid = ids[asset].id;
                    floatCacheAssetIDs.push(assetid);

                    for (let item in items) {
                        if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                            let market_hash_name = items[item].market_hash_name;
                            if (duplicates[market_hash_name] === undefined){
                                let instances = [assetid];
                                duplicates[market_hash_name] =
                                    {
                                        num: 1,
                                        instances: instances
                                    }
                            }
                            else{
                                duplicates[market_hash_name].num = duplicates[market_hash_name].num+1;
                                duplicates[market_hash_name].instances.push(assetid);
                            }
                        }
                    }
                }
                getFloatInfoFromCache(floatCacheAssetIDs).then(
                    floatCache => {
                        for (let asset in ids) {
                            let assetid = ids[asset].id;
                            let position = ids[asset].pos;

                            for (let item in items) {
                                if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                                    const name = items[item].name;
                                    const market_hash_name = items[item].market_hash_name;
                                    const name_color = items[item].name_color;
                                    const marketlink = `https://steamcommunity.com/market/listings/730/${items[item].market_hash_name}`;
                                    const classid = items[item].classid;
                                    const instanceid = items[item].instanceid;
                                    const exterior = getExteriorFromTags(items[item].tags);
                                    let tradability = 'Tradable';
                                    let tradabilityShort = 'T';
                                    let icon = items[item].icon_url;
                                    const dopplerInfo = (items[item].name.includes('Doppler') || items[item].name.includes('doppler')) ? getDopplerInfo(icon) : null;
                                    const isStatrack = items[item].name.includes('StatTrak™');
                                    const isSouvenir = items[item].name.includes('Souvenir');
                                    const starInName = items[item].name.includes('★');
                                    const quality = getQuality(items[item].tags);
                                    const stickers =  parseStickerInfo(items[item].descriptions, 'direct', prices, result.pricingProvider, result.exchangeRate, result.currency);
                                    const stickerPrice = getStickerPriceTotal(stickers, result.currency);
                                    let nametag = undefined;
                                    let inspectLink = null;
                                    const owner = steamID;
                                    let price = null;
                                    const type = getType(items[item].tags);
                                    let floatInfo = null;
                                    if (floatCache[assetid] !== undefined && floatCache[assetid] !== null && itemTypes[type.key].float) {
                                        floatInfo = floatCache[assetid];
                                    }
                                    const patternInfo = (floatInfo !== null) ? getPattern(market_hash_name, floatInfo.paintseed) : null;

                                    if (result.itemPricing) price = getPrice(market_hash_name, dopplerInfo, prices, result.pricingProvider, result.exchangeRate, result.currency);
                                    else price = {price: '', display: ''};

                                    try {if (items[item].fraudwarnings !== undefined || items[item].fraudwarnings[0] !== undefined) nametag = items[item].fraudwarnings[0].split('Name Tag: ')[1]}
                                    catch(error){}

                                    if (items[item].tradable === 0) {
                                        tradability = items[item].cache_expiration;
                                        tradabilityShort = getShortDate(tradability);
                                    }
                                    if (items[item].marketable === 0) {
                                        tradability = 'Not Tradable';
                                        tradabilityShort = '';
                                    }

                                    try {
                                        if (items[item].actions !== undefined && items[item].actions[0] !== undefined){
                                            let beggining = items[item].actions[0].link.split('%20S')[0];
                                            let end = items[item].actions[0].link.split('%assetid%')[1];
                                            inspectLink = (`${beggining}%20S${owner}A${assetid}${end}`);
                                        }
                                    }
                                    catch(error) {}

                                    itemsPropertiesToReturn.push({
                                        name, market_hash_name, name_color, marketlink, classid, instanceid, assetid, position, tradability, tradabilityShort,
                                        marketable: items[item].marketable,
                                        iconURL: icon,
                                        dopplerInfo, exterior, inspectLink, quality, isStatrack, isSouvenir, starInName, stickers, stickerPrice, nametag,
                                        duplicates: duplicates[market_hash_name],
                                        owner, price, type, floatInfo, patternInfo
                                    })
                                }
                            }
                        }
                        sendResponse({inventory: itemsPropertiesToReturn.sort((a, b) => { return a.position - b.position})});
                    }
                );

            }).catch(err => {
                console.log(err);
                sendResponse({inventory: 'error'});
            });
        });
        return true; // async return to signal that it will return later
    }
    else if (request.inventoryTotal !== undefined){
        let inventory = request.inventoryTotal;
        let total = 0.0;
        chrome.storage.local.get(['prices', 'exchangeRate', 'currency', 'pricingProvider'], (result) => {
            inventory.forEach(item => {
                total += parseFloat(getPrice(item.market_hash_name, item.dopplerInfo, result.prices, result.pricingProvider, result.exchangeRate, result.currency).price);
            });
            sendResponse({inventoryTotal: prettyPrintPrice(result.currency, (total).toFixed(0))});
        });
        return true;
    }
    else if (request.addPricesAndFloatsToInventory !== undefined){
        let inventory = request.addPricesAndFloatsToInventory;
        chrome.storage.local.get(['prices', 'exchangeRate', 'currency', 'itemPricing', 'pricingProvider'], (result) =>{
            if (result.itemPricing){
                const floatCacheAssetIDs = inventory.map(item => {
                    return item.assetid
                });
                getFloatInfoFromCache(floatCacheAssetIDs).then(
                    floatCache => {
                        inventory.forEach(item => {
                            if (result.prices[item.market_hash_name] !== undefined && result.prices[item.market_hash_name] !== 'null') {
                                item.price =  getPrice(item.market_hash_name, item.dopplerInfo, result.prices, result.pricingProvider, result.exchangeRate, result.currency);
                            }
                            if (floatCache[item.assetid] !== undefined && floatCache[item.assetid] !== null && itemTypes[item.type.key].float) {
                                item.floatInfo = floatCache[item.assetid];
                                item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintSeed);
                            }
                            const stickers = parseStickerInfo(item.descriptions, 'direct', result.prices, result.pricingProvider, result.exchangeRate, result.currency);
                            const stickerPrice = getStickerPriceTotal(stickers, result.currency);
                            item.stickers = stickers;
                            item.stickerPrice = stickerPrice;
                        });
                        sendResponse({addPricesAndFloatsToInventory: inventory});
                    }
                );
            }
            else sendResponse({addPricesAndFloatsToInventory: inventory});
        });
        return true;
    }
    else if (request.badgetext !== undefined){
        chrome.browserAction.setBadgeText({text: request.badgetext});
        sendResponse({badgetext: request.badgetext})
    }
    else if (request.openInternalPage !== undefined){
        chrome.permissions.contains({permissions: ['tabs']}, (result) => {
            if (result) {
                goToInternalPage(request.openInternalPage);
                sendResponse({openInternalPage: request.openInternalPage});
            }
            else sendResponse({openInternalPage: 'no_tabs_api_access'});
        });
        return true;
    }
    else if (request.setAlarm !== undefined){
        chrome.alarms.create(request.setAlarm.name, {when: new Date(request.setAlarm.when).valueOf()});
        // chrome.alarms.getAll((alarms) => {console.log(alarms)});
        sendResponse({setAlarm: request.setAlarm})
    }
    else if (request.apikeytovalidate !== undefined) {
        validateSteamAPIKey(request.apikeytovalidate).then(
            apiKeyValid => {
                sendResponse({valid: apiKeyValid});
            }, (error) => {
                console.log(error);
                sendResponse('error');
            });
        return true; // async return to signal that it will return later
    }
    else if (request.GetPlayerSummaries !== undefined) {
        chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], (result) => {
            if (result.apiKeyValid) {
                const apiKey = result.steamAPIKey;
                const steamID = request.GetPlayerSummaries;

                const getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamID}`);

                fetch(getRequest).then((response) => {
                    if (!response.ok) {
                        sendResponse('error');
                        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    }
                    else return response.json();
                }).then((body) => {
                    try {sendResponse({personastate: body.response.players[0].personastate, apiKeyValid: true})}
                    catch (e) {
                        console.log(e);
                        sendResponse('error');
                    }
                }).catch(err => {
                    console.log(err);
                    sendResponse('error');
                });
            }
            else sendResponse({apiKeyValid: false});
        });
        return true; // async return to signal that it will return later
    }
    else if (request.fetchFloatInfo !== undefined) {
        const inspectLink = request.fetchFloatInfo;
        if (inspectLink !== null) {
            const assetID = getAssetIDFromInspectLink(inspectLink);
            const getRequest = new Request(`https://api.csgofloat.com/?url=${inspectLink}`);

            fetch(getRequest).then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    sendResponse('error');
                }
                else return response.json();
            }).then((body) => {
                if (body.iteminfo.floatvalue !== undefined) {
                    const usefulFloatInfo = extractUsefulFloatInfo(body.iteminfo);
                    addToFloatCache(assetID, usefulFloatInfo);
                    if (usefulFloatInfo.floatvalue !== 0) sendResponse({floatInfo: usefulFloatInfo});
                    else sendResponse('nofloat');
                }
                else sendResponse('error');
            }).catch(err => {
                console.log(err);
                sendResponse('error');
            });
        }
        else sendResponse('nofloat');
        return true; // async return to signal that it will return later
    }
    else if (request.getSteamRepInfo !== undefined) {
        const steamID = request.getSteamRepInfo;

        const getRequest = new Request(`https://steamrep.com/api/beta4/reputation/${steamID}?json=1`);

        fetch(getRequest).then((response) => {
            if (!response.ok) {
                sendResponse('error');
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            }
            else return response.json();
        }).then((body) => {
            sendResponse({SteamRepInfo: body.steamrep});
        }).catch((err) => {
            console.log(err);
            sendResponse({SteamRepInfo: 'error'});
        });
        return true; // async return to signal that it will return later
    }
    else if (request.getTradeOffers !== undefined) {
        chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], (result) => {
            if (result.apiKeyValid) {
                const apiKey = result.steamAPIKey;
                const actives_only = request.getTradeOffers === 'historical' ? 0 : 1;
                const descriptions = request.getTradeOffers === 'historical' ? 0 : 1;

                const getRequest = new Request(`https://api.steampowered.com/IEconService/GetTradeOffers/v1/?get_received_offers=1&get_sent_offers=1&active_only=${actives_only}&get_descriptions=${descriptions}&language=english&key=${apiKey}`);

                fetch(getRequest).then((response) => {
                    if (!response.ok) {
                        sendResponse('error');
                        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    }
                    else return response.json();
                }).then((body) => {
                    try {sendResponse({offers: body.response, apiKeyValid: true})}
                    catch (e) {
                        console.log(e);
                        sendResponse('error');
                    }
                }).catch(err => {
                    console.log(err);
                    sendResponse('error');
                });
            }
            else sendResponse({apiKeyValid: false});
        });
        return true; // async return to signal that it will return later
    }
    else if (request.getBuyOrderInfo !== undefined) {
        const getRequest = new Request(`https://steamcommunity.com/market/listings/${request.getBuyOrderInfo.appID}/${request.getBuyOrderInfo.market_hash_name}`);

        fetch(getRequest).then((response) => {
            if (!response.ok) {
                sendResponse('error');
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            }
            else return response.text();
        }).then((body) => {
            let item_nameid = '';
            try {item_nameid = body.split('Market_LoadOrderSpread( ')[1].split(' ')[0]}
            catch (e) {
                console.log(e);
                console.log(body);
                sendResponse('error');
            }
            const getRequest2 = new Request(`https://steamcommunity.com/market/itemordershistogram?country=US&language=english&currency=${request.getBuyOrderInfo.currencyID}&item_nameid=${item_nameid}`);
            fetch(getRequest2).then((response) => {
                if (!response.ok) {
                    sendResponse('error');
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                }
                else return response.json();
            }).then((body) => {
                sendResponse({getBuyOrderInfo: body});
            }).catch(err => {
                console.log(err);
                sendResponse('error');
            });

        }).catch(err => {
            console.log(err);
            sendResponse('error');
        });

        return true; // async return to signal that it will return later
    }
});

chrome.runtime.onConnect.addListener(port => {});