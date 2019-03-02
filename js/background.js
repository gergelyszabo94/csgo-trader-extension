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
                steamAPIKey: "not set"
            }, function() {
        });

        chrome.notifications.create("installed", {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension installed!',
            message: 'You can check the options by clicking here'
        }, function(notificationId) {});

        chrome.notifications.onClicked.addListener(function(notificationId) {
            if(notificationId==="installed"){
                chrome.tabs.create({ url: "/html/options.html" });
            }
        });
    }else if(details.reason === "update"){
        //setting defaults options for new options that haven't been set yet
        chrome.storage.sync.get(['quickDeclineOffer','openOfferInTab', 'showPlusRepButton','reputationMessage', 'reoccuringMessage', 'nsfwFilter', 'flagScamComments', 'bookmarks', 'steamAPIKey'], function(result) {
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
            //console.log(steamAPIKey);
            if(result.steamAPIKey===undefined){
                chrome.storage.sync.set({steamAPIKey: "not set"}, function() {});
            }
        });

        chrome.browserAction.setBadgeText({text: "1"});

        let thisVersion = chrome.runtime.getManifest().version;
        chrome.notifications.create(thisVersion+"changelog", {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension updated to ' + thisVersion + "!",
            message: 'You can check the changelog by clicking here!'
        }, function(notificationId) {});

        chrome.notifications.onClicked.addListener(function() {
            chrome.browserAction.setBadgeText({text: ""});
            let newURL = "/html/changelog.html";
            chrome.tabs.create({ url: newURL });
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
                            itemsPropertiesToReturn.push({
                                name: name,
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
                                iconURL: icon
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
            chrome.tabs.create({url: request.openInternalPage}, function(){
                sendResponse({openInternalPage: request.openInternalPage})
            });
        }
        else if (request.setAlarm!==undefined){
            chrome.alarms.create(request.setAlarm.name, {when: new Date(request.setAlarm.when).valueOf()});
            chrome.alarms.getAll(function(alarms){
                console.log(alarms);
            });
            sendResponse({setAlarm: request.setAlarm})
        }
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
        let iconFullURL= 'https://steamcommunity.com/economy/image/' + item.itemInfo.iconURL + '/128x128';
        chrome.notifications.create(alarm.name, {
            type: 'basic',
            iconUrl: iconFullURL,
            title: item.itemInfo.name + ' is tradable!',
            message: 'Click here to see your bookmarks!'
        }, function(notificationId) {});
        chrome.notifications.onClicked.addListener(function() {
            let newURL = "/html/bookmarks.html";
            chrome.tabs.create({ url: newURL });
        });
    });
});