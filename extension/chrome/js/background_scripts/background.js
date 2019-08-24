chrome.runtime.onInstalled.addListener((details) =>{
    if(details.reason === 'install'){
        // sets the default options for first run (on install from the webstore/amo or when loaded in developer mode)
        chrome.storage.local.set({
                quickDeclineOffer: true,
                openOfferInTab: true,
                showPlusRepButton: true,
                reputationMessage: '+rep',
                showReoccButton: true,
                reoccuringMessage: 'I don\'t have other accounts. If someone adds you with my name and picture they are scammers.',
                nsfwFilter: false,
                flagScamComments: true,
                bookmarks: [],
                steamAPIKey: '',
                apiKeyValid: false,
                showRealStatus: true,
                colorfulItems: true,
                loungeBump: false,
                tradersBump: false,
                markScammers: true,
                numberOfListings: 10,
                storageMigrated: true,
                itemPricing: true,
                pricingProvider: pricingProviders.csgotrader.name,
                pricingMode: pricingProviders.csgotrader.pricing_modes['csgotrader'].name,
                pricesLastRefreshed: null,
                prices: null,
                currency: currencies.USD.short,
                exchangeRate: 1.0,
                exchangeRates: null,
                hideOtherExtensionPrices: true,
                inventorySortingMode: sortingModes.default.key,
                notifyOnUpdate: false,
                offerSortingMode: sortingModes.default.key,
                switchToOtherInventory: false,
                popupLinks: defaultPopupLinks
            }, () =>{});
        chrome.browserAction.setBadgeText({text: 'I'});
        chrome.notifications.create('installed', {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension installed!',
            message: 'Go to the options to set your preferences and customize your experience!'
        },(notificationId) =>{});
    }
    else if(details.reason === 'update'){
        // sets defaults options for new options that haven't been set yet (for features introduced since the last version - runs when the extension updates or gets reloaded in developer mode)
        // it checks whether the setting has ever been set - I consider removing older ones since there is no one updating from version that old
        chrome.storage.local.get([
            'quickDeclineOffer', 'openOfferInTab', 'showPlusRepButton', 'reputationMessage', 'showReoccButton', 'reoccuringMessage',
            'nsfwFilter', 'flagScamComments', 'bookmarks', 'steamAPIKey', 'apiKeyValid', 'showRealStatus', 'colorfulItems',
            'loungeBump', 'tradersBump', 'markScammers', 'numberOfListings', 'itemPricing', 'pricingProvider', 'pricingMode',
            'pricesLastRefreshed', 'prices', 'currency', 'exchangeRate', 'exchangeRates', 'hideOtherExtensionPrices','inventorySortingMode',
            'notifyOnUpdate', 'offerSortingMode', 'switchToOtherInventory', 'popupLinks'], (result) =>{
            if(result.quickDeclineOffer === undefined) chrome.storage.local.set({quickDeclineOffer: true}, ()=>{});
            if(result.openOfferInTab === undefined) chrome.storage.local.set({openOfferInTab: true}, ()=>{});
            if(result.showPlusRepButton === undefined) chrome.storage.local.set({showPlusRepButton: true}, () =>{});
            if(result.reputationMessage === undefined) chrome.storage.local.set({reputationMessage: '+rep'}, () =>{});
            if(result.showReoccButton === undefined) chrome.storage.local.set({showReoccButton: true}, () =>{});
            if(result.reoccuringMessage === undefined) chrome.storage.local.set({reoccuringMessage: 'I don\'t have other accounts. If someone adds you with my name and picture they are scammers.'}, () =>{});
            if(result.nsfwFilter === undefined) chrome.storage.local.set({nsfwFilter: false}, () =>{});
            if(result.flagScamComments === undefined) chrome.storage.local.set({flagScamComments: true}, () =>{});
            if(result.bookmarks === undefined) chrome.storage.local.set({bookmarks: []}, () =>{});
            if(result.steamAPIKey === undefined) chrome.storage.local.set({steamAPIKey: ''}, () =>{});
            if(result.apiKeyValid === undefined) chrome.storage.local.set({apiKeyValid: false}, () =>{});
            if(result.showRealStatus === undefined) chrome.storage.local.set({showRealStatus: true}, () =>{});
            if(result.colorfulItems === undefined) chrome.storage.local.set({colorfulItems: true}, () =>{});
            if(result.loungeBump === undefined) chrome.storage.local.set({loungeBump: false}, () =>{});
            if(result.tradersBump === undefined) chrome.storage.local.set({tradersBump: false}, () =>{});
            if(result.markScammers === undefined) chrome.storage.local.set({markScammers: true}, () =>{});
            if(result.numberOfListings === undefined) chrome.storage.local.set({numberOfListings: 10}, () =>{});
            if(result.itemPricing === undefined) chrome.storage.local.set({itemPricing: true}, () =>{});
            if(result.pricingProvider === undefined) chrome.storage.local.set({pricingProvider: pricingProviders.csgotrader.name},() =>{});
            if(result.pricingMode === undefined) chrome.storage.local.set({pricingMode: pricingProviders.csgotrader.pricing_modes['csgotrader'].name}, () =>{});
            if(result.pricesLastRefreshed === undefined) chrome.storage.local.set({pricesLastRefreshed: null}, () =>{});
            if(result.prices === undefined) chrome.storage.local.set({prices: null}, () =>{});
            if(result.currency === undefined) chrome.storage.local.set({currency: currencies.USD.short}, () =>{});
            if(result.exchangeRate === undefined) chrome.storage.local.set({exchangeRate: 1.0}, () =>{});
            if(result.exchangeRates === undefined) chrome.storage.local.set({exchangeRates: null}, () =>{});
            if(result.hideOtherExtensionPrices === undefined) chrome.storage.local.set({hideOtherExtensionPrices: true}, () =>{});
            if(result.inventorySortingMode === undefined) chrome.storage.local.set({inventorySortingMode: sortingModes.default.key}, () =>{});
            if(result.notifyOnUpdate === undefined) chrome.storage.local.set({notifyOnUpdate: false}, () =>{});
            if(result.offerSortingMode === undefined) chrome.storage.local.set({offerSortingMode: sortingModes.default.key}, () =>{});
            if(result.switchToOtherInventory === undefined) chrome.storage.local.set({switchToOtherInventory: false}, () =>{});
            if(result.popupLinks === undefined) chrome.storage.local.set({popupLinks: defaultPopupLinks}, () =>{});
        });

        chrome.browserAction.setBadgeText({text: 'U'});

        // notifies the user when the extension is updated
        chrome.storage.local.get('updateNotifications', (result) =>{
            if(result.updateNotifications){
                let thisVersion = chrome.runtime.getManifest().version;
                chrome.permissions.contains({
                    permissions: ['tabs']
                }, (result) =>{
                    let message = 'Check the changelog for the hot new stuff!';
                    if (result) {
                        message = 'You can check the changelog by clicking here!';
                    }
                    chrome.notifications.create('updated', {
                        type: 'basic',
                        iconUrl: '/images/cstlogo128.png',
                        title: `Extension updated to ${thisVersion}!`,
                        message: message
                    }, (notificationId) =>{});
                });
            }
        });
    }

    // updates the prices and exchange rates - retries periodically if it's the first time (on install) and it fails to update prices/exchange rates
    updatePrices();
    updateExchangeRates();
    chrome.alarms.create('updatePricesAndExchangeRates', {periodInMinutes: 1440});
    chrome.alarms.create('retryUpdatePricesAndExchangeRates', {periodInMinutes: 1});
});

// redirects to feedback survey on uninstall
chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSeOpZilYGr3JAPd7_GSh-tCJShVWHpNFoW8joxStzZf1PFq5A/viewform?usp=sf_link', () =>{});

// handles what happens when one of the extension's notification gets clicked
chrome.notifications.onClicked.addListener((notificationID) =>{
    chrome.browserAction.setBadgeText({text: ''});
    chrome.permissions.contains({
        permissions: ['tabs']
    }, (result) =>{
        if (result) {
            if(notificationID === 'installed') goToInternalPage('/html/options.html');
            else if(notificationID === 'updated') chrome.tabs.create({url: 'https://csgotrader.app/changelog/'});
            else goToInternalPage('/html/bookmarks.html');
        }
        else{
            if (notificationID === 'installed') chrome.runtime.openOptionsPage(() =>{});
        }
    });
});

// handles periodic and timed events like bookmarked items getting tradable
chrome.alarms.onAlarm.addListener((alarm) =>{
    if(alarm.name === 'updatePricesAndExchangeRates'){
        updatePrices();
        updateExchangeRates();
    }
    else if(alarm.name === 'retryUpdatePricesAndExchangeRates'){
        chrome.storage.local.get('prices', (result) =>{
            if(result.prices === null) updatePrices();
            else chrome.alarms.clear('retryUpdatePricesAndExchangeRates', (wasCleared) =>{});
        });
    }
    else{
        chrome.browserAction.getBadgeText({}, (result) =>{
            if(result === '') chrome.browserAction.setBadgeText({text:'1'});
            else chrome.browserAction.setBadgeText({text: (parseInt(result)+1).toString()});
        });
        chrome.storage.local.get('bookmarks', (result) =>{
            let item = result.bookmarks.find((element) =>{return element.itemInfo.assetid === alarm.name});
            if(item.notifType === 'chrome'){
                let iconFullURL= `https://steamcommunity.com/economy/image/${item.itemInfo.iconURL}/128x128`;
                chrome.permissions.contains({permissions: ['tabs']}, (result) =>{
                    let message = `${item.itemInfo.name} is tradable!`;
                    if (result) message = 'Click here to see your bookmarks!';
                    chrome.notifications.create(alarm.name, {
                        type: 'basic',
                        iconUrl: iconFullURL,
                        title: `${item.itemInfo.name} is tradable!`,
                        message: message
                    }, (notificationId) =>{});
                });
            }
            else if(item.notifType === 'alert'){
                chrome.permissions.contains({permissions: ['tabs']}, (result) =>{
                    if (result) {
                        goToInternalPage('/html/bookmarks.html');
                        setTimeout(() =>{
                            chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
                                chrome.tabs.sendMessage(tabs[0].id, {alert: item.itemInfo.name}, (response) =>{});
                            });
                        }, 1000);
                    }
                });
            }
        });
    }
});
