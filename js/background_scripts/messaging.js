chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.inventory !==undefined) {
            let steamID = request.inventory;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://steamcommunity.com/profiles/' + steamID + '/inventory/json/730/2/?l=english', true);
            xhr.onload = function (e) {
                let body = JSON.parse(xhr.responseText);
                let items = body.rgDescriptions;
                let ids = body.rgInventory;

                let itemsPropertiesToReturn = [];
                let duplicates = {};

                for (let asset in ids) {
                    let assetid = ids[asset].id;

                    for (let item in items) {
                        if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                            let market_hash_name = items[item].market_hash_name;
                            if(duplicates[market_hash_name]===undefined){
                                let instances = [assetid];
                                duplicates[market_hash_name] =
                                    {
                                        num: 1,
                                        instances: instances
                                    }
                            }
                            else{
                                duplicates[market_hash_name].num=duplicates[market_hash_name].num+1;
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
                            let marketlink = "https://steamcommunity.com/market/listings/730/" + items[item].market_hash_name;
                            let classid = items[item].classid;
                            let instanceid = items[item].instanceid;
                            let exterior = items[item].descriptions[0].value.split('Exterior: ')[1];
                            exterior = exterior === undefined ? "" : exterior;
                            let shortExterior = shortenExterior(exterior);
                            let tradability = "Tradable";
                            let tradabilityShort = "T";
                            let dopplerInfo = undefined;
                            let isStatrack = false;
                            let isSouvenir = false;
                            let starInName = false;
                            let icon = items[item].icon_url;
                            let quality = getQuality(items[item].type);
                            let stickers =  parseStickerInfo(items[item].descriptions, "direct");
                            let nametag =undefined;

                            try {
                                if(items[item].fraudwarnings!==undefined||items[item].fraudwarnings[0]!==undefined){
                                    nametag = items[item].fraudwarnings[0].split('Name Tag: ')[1];
                                }
                            }
                            catch(error) {
                            }

                            if (items[item].tradable === 0) {
                                tradability = items[item].cache_expiration;
                                tradabilityShort = getShortDate(tradability);
                            }
                            if (items[item].marketable === 0) {
                                tradability = "Not Tradable";
                                tradabilityShort = "";
                            }
                            if(/Doppler/.test(name)){
                                dopplerInfo = getDopplerInfo(icon);
                            }
                            if(/StatTrak™/.test(name)){
                                isStatrack = true;
                            }
                            if(/Souvenir/.test(name)){
                                isSouvenir = true;
                            }
                            if(/★/.test(name)){
                                starInName = true;
                            }

                            let inspectLink ="";
                            try {
                                if(items[item].actions!==undefined&&items[item].actions[0]!==undefined){
                                    let beggining = items[item].actions[0].link.split('%20S')[0];
                                    let end = items[item].actions[0].link.split('%assetid%')[1];
                                    inspectLink = (beggining + "%20S"+steamID + "A"+ assetid + end);
                                }
                            }
                            catch(error) {
                            }

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
                                shortExterior: shortExterior,
                                iconURL: icon,
                                inspectLink: inspectLink,
                                quality: quality,
                                isStatrack: isStatrack,
                                isSouvenir: isSouvenir,
                                starInName: starInName,
                                stickers: stickers,
                                nametag: nametag,
                                duplicates: duplicates[market_hash_name]
                            })
                        }
                    }
                }

                function compare(a, b) {
                    return a.position - b.position;
                }

                itemsPropertiesToReturn.sort(compare);
                sendResponse({inventory: itemsPropertiesToReturn});
            };
            try {
                xhr.send();
            }
            catch (e) {
                console.log(e);
                sendResponse("error");
            }
            return true; //async return to signal that it will return later
        }
        else if (request.badgetext!==undefined){
            chrome.browserAction.setBadgeText({text: request.badgetext});
            sendResponse({badgetext: request.badgetext})
        }
        else if (request.openInternalPage!==undefined){
            chrome.permissions.contains({
                permissions: ['tabs']
            }, function(result) {
                if (result) {
                    goToInternalPage(request.openInternalPage);
                    sendResponse({openInternalPage: request.openInternalPage});
                }
                else{
                    sendResponse({openInternalPage: "no_tabs_api_access"});
                }
            });
            return true;
        }
        else if (request.setAlarm!==undefined){
            chrome.alarms.create(request.setAlarm.name, {when: new Date(request.setAlarm.when).valueOf()});
            // chrome.alarms.getAll(function(alarms){
            //     console.log(alarms);
            // });
            sendResponse({setAlarm: request.setAlarm})
        }
        else if (request.apikeytovalidate !==undefined) {
            let apiKey = request.apikeytovalidate;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apiKey + '&steamids=76561198036030455', true);
            xhr.onload = function (e) {
                try {
                    let body = JSON.parse(xhr.responseText);
                    if(body.response.players[0].steamid==="76561198036030455"){
                        sendResponse({valid: true});
                    }
                    else{
                        sendResponse({valid: false});
                    }
                }
                catch (e) {
                    console.log(e);
                    sendResponse({valid: false});
                }
            };
            try {
                xhr.send();
            }
            catch (e) {
                console.log(e);
                sendResponse("error");
            }
            return true; //async return to signal that it will return later
        }
        else if (request.GetPlayerSummaries !==undefined) {
            chrome.storage.sync.get(['apiKeyValid', 'steamAPIKey'], function(result) {
                if(result.apiKeyValid){
                    let apiKey = result.steamAPIKey;
                    let steamid = request.GetPlayerSummaries;
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apiKey + '&steamids=' + steamid, true);
                    xhr.onload = function (e) {
                        try {
                            let body = JSON.parse(xhr.responseText);
                            sendResponse({personastate: body.response.players[0].personastate, apiKeyValid: true});
                        }
                        catch (e) {
                            console.log(e);
                        }
                    };
                    try {
                        xhr.send();
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else{
                    sendResponse({apiKeyValid: false});
                }
            });
            return true; //async return to signal that it will return later
        }
        else if (request.getFloatInfo !==undefined) {
            let inspectLink = request.getFloatInfo;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://api.csgofloat.com/?url=' + inspectLink, true);
            xhr.onload = function (e) {
                try {
                    let body = JSON.parse(xhr.responseText);
                    sendResponse({floatInfo: body.iteminfo});
                }
                catch (e) {
                    console.log(e);
                }
            };
            try {
                xhr.send();
            }
            catch (e) {
                console.log(e);
            }
            return true; //async return to signal that it will return later
        }
        else if (request.getSteamRepInfo !==undefined) {
            let steamID = request.getSteamRepInfo;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://steamrep.com/api/beta4/reputation/' + steamID + "?json=1", true);
            xhr.onload = function (e) {
                try {
                    let body = JSON.parse(xhr.responseText);
                    sendResponse({SteamRepInfo: body.steamrep});
                }
                catch (e) {
                    console.log(e);
                }
            };
            try {
                xhr.send();
            }
            catch (e) {
                console.log(e);
            }
            return true; //async return to signal that it will return later
        }
    });