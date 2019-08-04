chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason === "install"){
        //setting default options
        chrome.storage.local.set(
            {
                quickDeclineOffer: true,
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
                colorfulItems: true,
                loungeBump: true,
                tradersBump: true,
                markScammers: true,
                numberOfListings: 10,
                storageMigrated: true,
                itemPricing: true,
                pricingProvider: pricingProviders.csgotrader.name,
                pricingMode: pricingProviders.csgotrader.pricing_modes["csgotrader"].name,
                pricesLastRefreshed: null,
                prices: null,
                currency: currencies.USD.short,
                exchangeRate: 1.0,
                exchangeRates: null,
                hideOtherExtensionPrices: true
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
        chrome.storage.local.get(['quickDeclineOffer','openOfferInTab', 'showPlusRepButton','reputationMessage', 'showReoccButton', 'reoccuringMessage', 'nsfwFilter', 'flagScamComments', 'bookmarks', 'steamAPIKey', 'apiKeyValid', 'showRealStatus', 'colorfulItems', 'loungeBump', 'tradersBump', 'markScammers', 'numberOfListings', 'itemPricing', 'pricingProvider', 'pricingMode', 'pricesLastRefreshed', 'prices', 'currency', 'exchangeRate', 'exchangeRates', 'hideOtherExtensionPrices'], function(result) {
            if(result.quickDeclineOffer===undefined){
                chrome.storage.local.set({quickDeclineOffer: true}, function() {});
            }
            if(result.openOfferInTab===undefined){
                chrome.storage.local.set({openOfferInTab: true}, function() {});
            }
            if(result.showPlusRepButton===undefined){
                chrome.storage.local.set({showPlusRepButton: true}, function() {});
            }
            if(result.reputationMessage===undefined){
                chrome.storage.local.set({reputationMessage: "+rep"}, function() {});
            }
            if(result.showReoccButton===undefined){
                chrome.storage.local.set({showReoccButton: true}, function() {});
            }
            if(result.reoccuringMessage===undefined){
                chrome.storage.local.set({reoccuringMessage: "I don't have other accounts. If someone adds you with my name and picture they are scammers."}, function() {});
            }
            if(result.nsfwFilter===undefined){
                chrome.storage.local.set({nsfwFilter: false}, function() {});
            }
            if(result.flagScamComments===undefined){
                chrome.storage.local.set({flagScamComments: true}, function() {});
            }
            if(result.bookmarks===undefined){
                chrome.storage.local.set({bookmarks: []}, function() {});
            }
            if(result.steamAPIKey===undefined){
                chrome.storage.local.set({steamAPIKey: ""}, function() {});
            }
            if(result.apiKeyValid===undefined){
                chrome.storage.local.set({apiKeyValid: false}, function() {});
            }
            if(result.showRealStatus===undefined){
                chrome.storage.local.set({showRealStatus: true}, function() {});
            }
            if(result.colorfulItems===undefined){
                chrome.storage.local.set({colorfulItems: true}, function() {});
            }
            if(result.loungeBump===undefined){
                chrome.storage.local.set({loungeBump: true}, function() {});
            }
            if(result.tradersBump===undefined){
                chrome.storage.local.set({tradersBump: true}, function() {});
            }
            if(result.markScammers===undefined){
                chrome.storage.local.set({markScammers: true}, function() {});
            }
            if(result.numberOfListings===undefined){
                chrome.storage.local.set({numberOfListings: 10}, function() {});
            }
            if(result.itemPricing===undefined){
                chrome.storage.local.set({itemPricing: true}, function() {});
            }
            if(result.pricingProvider===undefined){
                chrome.storage.local.set({pricingProvider: pricingProviders.csgotrader.name}, function() {});
            }
            if(result.pricingMode===undefined){
                chrome.storage.local.set({pricingMode: pricingProviders.csgotrader.pricing_modes["csgotrader"].name}, function() {});
            }
            if(result.pricesLastRefreshed===undefined){
                chrome.storage.local.set({pricesLastRefreshed: null}, function() {});
            }
            if(result.prices===undefined){
                chrome.storage.local.set({prices: null}, function() {});
            }
            if(result.currency===undefined){
                chrome.storage.local.set({currency: currencies.USD.short}, function() {});
            }
            if(result.exchangeRate===undefined){
                chrome.storage.local.set({exchangeRate: 1.0}, function() {});
            }
            if(result.exchangeRates===undefined){
                chrome.storage.local.set({exchangeRates: null}, function() {});
            }
            if(result.hideOtherExtensionPrices===undefined){
                chrome.storage.local.set({hideOtherExtensionPrices: true}, function() {});
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

    updatePrices();
    updateExchangeRates();
    chrome.alarms.create("updatePricesAndExchangeRates", {periodInMinutes: 1440});
    chrome.alarms.create("retryUpdatePricesAndExchangeRates", {periodInMinutes: 1});
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
    if(alarm.name === "updatePricesAndExchangeRates"){
        updatePrices();
        updateExchangeRates();
    }
    else if(alarm.name === "retryUpdatePricesAndExchangeRates"){
        chrome.storage.local.get('prices', function(result) {
            if(result.prices === null){
                updatePrices();
            }
            else{
                chrome.alarms.clear("retryUpdatePricesAndExchangeRates", function (wasCleared) {});
            }
        });
    }
    else{
        chrome.browserAction.getBadgeText({}, function (result) {
            if(result===""){
                chrome.browserAction.setBadgeText({text:"1"});
            }
            else{
                chrome.browserAction.setBadgeText({text: (parseInt(result)+1).toString()});
            }
        });
        chrome.storage.local.get('bookmarks', function(result) {
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
    }
});