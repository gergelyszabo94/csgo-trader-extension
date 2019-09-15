chrome.runtime.onInstalled.addListener((details) =>{
    if(details.reason === 'install'){
        // sets the default options for first run (on install from the webstore/amo or when loaded in developer mode)
        for (let key in storageKeys) {chrome.storage.local.set({[key]: storageKeys[key]}, () =>{});}

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
        let keysArray = [];
        for (let key in storageKeys) {keysArray.push(key)}

        chrome.storage.local.get(keysArray, (result) =>{
            for (let key in storageKeys) { if (result[key] === undefined) chrome.storage.local.set({[key]: storageKeys[key]}, () =>{}) }
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
    if (alarm.name === 'updatePricesAndExchangeRates'){
        chrome.storage.local.get('itemPricing', (result) =>{
            if (result.itemPricing === true) updatePrices();
        });
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
            if(result === '' || result === 'U' || result === 'I') chrome.browserAction.setBadgeText({text:'1'});
            else chrome.browserAction.setBadgeText({text: (parseInt(result) + 1).toString()});
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
