chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.inventory !== undefined) {
        chrome.storage.local.get(['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider', 'floatCache'], (result) => {
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
                for (let asset in ids) {
                    let assetid = ids[asset].id;
                    let position = ids[asset].pos;

                    for (let item in items) {
                        if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                            let name = items[item].name;
                            let market_hash_name = items[item].market_hash_name;
                            let name_color = items[item].name_color;
                            let marketlink = `https://steamcommunity.com/market/listings/730/${items[item].market_hash_name}`;
                            let classid = items[item].classid;
                            let instanceid = items[item].instanceid;
                            let exterior = getExteriorFromTags(items[item].tags);
                            let tradability = 'Tradable';
                            let tradabilityShort = 'T';
                            let icon = items[item].icon_url;
                            let dopplerInfo = /Doppler/.test(items[item].name) ? getDopplerInfo(icon) : undefined;
                            let isStatrack = /StatTrak™/.test(items[item].name);
                            let isSouvenir = /Souvenir/.test(items[item].name);
                            let starInName = /★/.test(items[item].name);
                            let quality = getQuality(items[item].tags);
                            let stickers =  parseStickerInfo(items[item].descriptions, 'direct');
                            let nametag = undefined;
                            let inspectLink = null;
                            let owner = steamID;
                            let price = null;
                            let type = getType(items[item].tags);
                            let floatInfo = null;
                            if (result.floatCache[assetid] !== undefined) {
                                floatInfo = result.floatCache[assetid].floatInfo;
                                floatCacheAssetIDs.push(assetid);
                            }
                            let patternInfo = floatInfo !== null ? getPattern(market_hash_name, floatInfo.paintSeed) : null;

                            if (result.itemPricing) price = getPrice(market_hash_name, dopplerInfo, prices, result.pricingProvider, result.exchangeRate, result.currency);
                            else{price = {price: '', display: ''}}

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
                                name: name,
                                market_hash_name: market_hash_name,
                                name_color: name_color,
                                marketlink: marketlink,
                                classid: classid,
                                instanceid: instanceid,
                                assetid: assetid,
                                position: position,
                                tradability: tradability,
                                tradabilityShort: tradabilityShort,
                                dopplerInfo: dopplerInfo,
                                exterior: exterior,
                                iconURL: icon,
                                inspectLink: inspectLink,
                                quality: quality,
                                isStatrack: isStatrack,
                                isSouvenir: isSouvenir,
                                starInName: starInName,
                                stickers: stickers,
                                nametag: nametag,
                                duplicates: duplicates[market_hash_name],
                                owner: owner,
                                price: price,
                                type: type,
                                floatInfo: floatInfo,
                                patternInfo: patternInfo
                            })
                        }
                    }
                }
                sendResponse({inventory: itemsPropertiesToReturn.sort((a, b) => { return a.position - b.position})});
                updateFloatCache(result.floatCache, floatCacheAssetIDs);
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
    else if (request.addPricesToInventory !== undefined){
        let inventory = request.addPricesToInventory;
        chrome.storage.local.get(['prices', 'exchangeRate', 'currency', 'itemPricing', 'pricingProvider', 'floatCache'], (result) =>{
            if (result.itemPricing){
                let floatCacheAssetIDs = [];
                inventory.forEach(item => {
                    if (result.prices[item.market_hash_name] !== undefined && result.prices[item.market_hash_name] !== 'null'){
                        item.price =  getPrice(item.market_hash_name, item.dopplerInfo, result.prices, result.pricingProvider, result.exchangeRate, result.currency);
                    }
                    if (result.floatCache[item.assetid] !== undefined) {
                        item.floatInfo = result.floatCache[item.assetid].floatInfo;
                        item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintSeed);
                        floatCacheAssetIDs.push(item.assetid);
                    }
                    else {
                        item.floatInfo = null;
                        item.patternInfo = null;
                    }
                });
                sendResponse({addPricesToInventory: inventory});
            }
            else sendResponse({addPricesToInventory: inventory});
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
        let getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${request.apikeytovalidate}&steamids=76561198036030455`);

        fetch(getRequest).then((response) => {
            if (!response.ok) {
                sendResponse('error');
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            }
            else return response.json();
        }).then((body) => {
            try {
                if (body.response.players[0].steamid === '76561198036030455') sendResponse({valid: true});
                else sendResponse({valid: false});
            }
            catch (e) {
                console.log(e);
                sendResponse({valid: false});
            }
        }).catch(err => {
                console.log(err);
                sendResponse({valid: false});
            });
        return true; // async return to signal that it will return later
    }
    else if (request.GetPlayerSummaries !== undefined) {
        chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], (result) => {
            if(result.apiKeyValid){
                let apiKey = result.steamAPIKey;
                let steamID = request.GetPlayerSummaries;

                let getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamID}`);

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
    else if (request.getFloatInfo !== undefined) {
        let inspectLink = request.getFloatInfo;
        if (inspectLink !== null) {
            let assetID = getAssetIDFromInspectLink(inspectLink);
            chrome.storage.local.get('floatCache', (result) => {
                if (result.floatCache[assetID] !== undefined) {
                    updateFloatCache(result.floatCache, assetID);
                    sendResponse({floatInfo: result.floatCache[assetID].floatInfo});
                }
                else {
                    let getRequest = new Request(`https://api.csgofloat.com/?url=${inspectLink}`);

                    fetch(getRequest).then((response) => {
                        if (!response.ok) {
                            sendResponse('error');
                            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                        }
                        else return response.json();
                    }).then((body) => {
                        if (body.iteminfo.floatvalue !== undefined) {
                            let usefulFloatInfo = extractUsefulFloatInfo(body.iteminfo);
                            updateFloatCache(result.floatCache, assetID, usefulFloatInfo);
                            if (usefulFloatInfo.floatvalue !== 0.0) sendResponse({floatInfo: usefulFloatInfo});
                            else sendResponse('nofloat');
                        }
                        else sendResponse('error');
                    }).catch(err => {
                        console.log(err);
                        sendResponse('error');
                    });
                }
            });
        }
        else sendResponse('nofloat');
        return true; // async return to signal that it will return later
    }
    else if (request.getSteamRepInfo !==undefined) {
        let steamID = request.getSteamRepInfo;

        let getRequest = new Request(`https://steamrep.com/api/beta4/reputation/${steamID}?json=1`);

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
});

chrome.runtime.onConnect.addListener(port => {});