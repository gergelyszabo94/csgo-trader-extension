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
                showRealStatus: true,
                colorfulItems: true
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
        chrome.storage.sync.get(['quickDeclineOffer','openOfferInTab', 'showPlusRepButton','reputationMessage', 'reoccuringMessage', 'nsfwFilter', 'flagScamComments', 'bookmarks', 'steamAPIKey', 'apiKeyValid', 'showRealStatus', 'colorfulItems'], function(result) {
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
            if(result.colorfulItems===undefined){
                chrome.storage.sync.set({colorfulItems: true}, function() {});
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

chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSeOpZilYGr3JAPd7_GSh-tCJShVWHpNFoW8joxStzZf1PFq5A/viewform?usp=sf_link", function(){});

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
        else{
            if (notificationID==="installed"){
                chrome.runtime.openOptionsPage(function(){})
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