chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason === "install"){
        //setting default options
        chrome.storage.sync.set(
            {quickDeclineOffer: true,
                openOfferInTab: true,
                showPlusRepButton: true,
                reputationMessage: "+rep",
                showReoccButton: true,
                reoccuringMessage: "I don't have other accounts. If someone adds you with my name and picture they are scammers.",
                nsfwFilter: false,
                flagScamComments: true,
                bookmarks: [],
                steamAPIKey: "",
                apiKeyValid: false,
                showRealStatus: true
            }, function() {
            });
        chrome.browserAction.setBadgeText({text: "1"});
        chrome.notifications.create("installed", {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension installed!',
            message: 'Go to the options to set your preferences and customize your experience!'
        }, function(notificationId) {});
    }
    else if(details.reason === "update"){
        //setting defaults options for new options that haven't been set yet
        chrome.storage.sync.get(['quickDeclineOffer','openOfferInTab', 'showPlusRepButton','reputationMessage', 'reoccuringMessage', 'nsfwFilter', 'flagScamComments', 'bookmarks', 'steamAPIKey', 'apiKeyValid', 'showRealStatus'], function(result) {
            if(result.quickDeclineOffer===undefined){
                chrome.storage.sync.set({quickDeclineOffer: true}, function() {});
            }
            if(result.openOfferInTab===undefined){
                chrome.storage.sync.set({openOfferInTab: true}, function() {});
            }
            if(result.showPlusRepButton===undefined){
                chrome.storage.sync.set({showPlusRepButton: true}, function() {});
            }
            if(result.reputationMessage===undefined){
                chrome.storage.sync.set({reputationMessage: "+rep"}, function() {});
            }
            if(result.showReoccButton===undefined){
                chrome.storage.sync.set({showReoccButton: true}, function() {});
            }
            if(result.reoccuringMessage===undefined){
                chrome.storage.sync.set({reoccuringMessage: "I don't have other accounts. If someone adds you with my name and picture they are scammers."}, function() {});
            }
            if(result.nsfwFilter===undefined){
                chrome.storage.sync.set({nsfwFilter: false}, function() {});
            }
            if(result.flagScamComments===undefined){
                chrome.storage.sync.set({flagScamComments: true}, function() {});
            }
            if(result.bookmarks===undefined){
                chrome.storage.sync.set({bookmarks: []}, function() {});
            }
            if(result.steamAPIKey===undefined){
                chrome.storage.sync.set({steamAPIKey: ""}, function() {});
            }
            if(result.apiKeyValid===undefined){
                chrome.storage.sync.set({steamAPIKey: false}, function() {});
            }
            if(result.showRealStatus===undefined){
                chrome.storage.sync.set({showRealStatus: true}, function() {});
            }
        });

        chrome.browserAction.setBadgeText({text: "1"});

        let thisVersion = chrome.runtime.getManifest().version;
        chrome.permissions.contains({
            permissions: ['tabs']
        }, function(result) {
            let message = 'Check the changelog for the hot new stuff!';
            if (result) {
                message = 'You can check the changelog by clicking here!';
            }
            chrome.notifications.create("updated", {
                type: 'basic',
                iconUrl: '/images/cstlogo128.png',
                title: 'Extension updated to ' + thisVersion + "!",
                message: message
            }, function(notificationId) {});
        });
    }
});

//loads inventory and extract information
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.inventory !==undefined) {
            let steamID = request.inventory;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://steamcommunity.com/profiles/' + steamID + '/inventory/json/730/2', true);
            xhr.onload = function (e) {
                let body = JSON.parse(xhr.responseText);
                let items = body.rgDescriptions;
                let ids = body.rgInventory;

                let itemsPropertiesToReturn = [];

                for (let asset in ids) {
                    let assetid = ids[asset].id;
                    let position = ids[asset].pos;

                    for (let item in items) {
                        if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                            let name = items[item].name;
                            let market_hash_name = items[item].market_hash_name;
                            let marketlink = "https://steamcommunity.com/market/listings/730/" + items[item].market_hash_name;
                            let classid = items[item].classid;
                            let instanceid = items[item].instanceid;
                            let exterior = items[item].descriptions[0].value.split('Exterior: ')[1];
                            exterior = exterior === undefined ? "" : exterior;
                            let shortExterior = shortenExterior(exterior);
                            let tradability = "Tradable";
                            let tradabilityShort = "T";
                            let dopplerPhase = "";
                            let icon = items[item].icon_url;

                            if (items[item].tradable === 0) {
                                tradability = items[item].cache_expiration;
                                tradabilityShort = getShortDate(tradability);
                            }
                            if (items[item].marketable === 0) {
                                tradability = "Not Tradable";
                                tradabilityShort = "";
                            }
                            if(/Doppler/.test(name)){
                                dopplerPhase = getDopplerPhase(icon);
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
                                marketlink: marketlink,
                                classid: classid,
                                instanceid: instanceid,
                                assetid: assetid,
                                position: position,
                                tradability: tradability,
                                tradabilityShort: tradabilityShort,
                                dopplerPhase: dopplerPhase,
                                exterior: exterior,
                                shortExterior: shortExterior,
                                iconURL: icon,
                                inspectLink: inspectLink
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
                    sendResponse({openInternalPage: "No permission"});
                }
            });
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
    });

chrome.notifications.onClicked.addListener(function(notificationID) {
    chrome.browserAction.setBadgeText({text: ""});
    chrome.permissions.contains({
        permissions: ['tabs']
    }, function(result) {
        if (result) {
            if(notificationID==="installed"){
                goToInternalPage("/html/options.html");
            }
            else if(notificationID==="updated"){
                goToInternalPage("/html/changelog.html");
            }
            else{
                goToInternalPage("/html/bookmarks.html");
            }
        }
    });
});

chrome.alarms.onAlarm.addListener(function(alarm){
    chrome.browserAction.getBadgeText({}, function (result) {
        if(result===""){
            chrome.browserAction.setBadgeText({text:"1"});
        }
        else{
            chrome.browserAction.setBadgeText({text: (parseInt(result)+1).toString()});
        }
    });
    chrome.storage.sync.get('bookmarks', function(result) {
        let item = result.bookmarks.find(function(element) {
            return element.itemInfo.assetid === alarm.name;
        });
        if(item.notifType==="chrome"){
            let iconFullURL= 'https://steamcommunity.com/economy/image/' + item.itemInfo.iconURL + '/128x128';
            chrome.permissions.contains({
                permissions: ['tabs']
            }, function(result) {
                let message = item.itemInfo.name + ' is tradable!';
                if (result) {
                    message = 'Click here to see your bookmarks!';
                }
                chrome.notifications.create(alarm.name, {
                    type: 'basic',
                    iconUrl: iconFullURL,
                    title: item.itemInfo.name + ' is tradable!',
                    message: message
                }, function(notificationId) {});
            });
        }
        else if(item.notifType==="alert"){
            chrome.permissions.contains({
                permissions: ['tabs']
            }, function(result) {
                if (result) {
                    goToInternalPage("/html/bookmarks.html");
                    setTimeout(function () {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                            chrome.tabs.sendMessage(tabs[0].id, {alert: item.itemInfo.name}, function(response) {});
                        });
                    }, 1000);
                }
            });
        }
    });
});