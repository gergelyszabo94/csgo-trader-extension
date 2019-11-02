function matchItemsWithDescriptions(items) {
    let itemsToReturn = [];
    items.forEach((item) => {
        if (item.market_hash_name !== undefined) { // some items don't have descriptions for some reason - will have to be investigated later
            let exterior = getExteriorFromTags(item.tags);
            let marketlink = `https://steamcommunity.com/market/listings/730/${item.market_hash_name}`;
            let quality = getQuality(item.tags);
            let stickers = parseStickerInfo(item.descriptions, 'direct');
            let nametag = undefined;
            let inspectLink = null;
            let dopplerInfo = /Doppler/.test(item.name) ? getDopplerInfo(item.icon) : undefined;
            let isStatrack = /StatTrak™/.test(item.name);
            let isSouvenir = /Souvenir/.test(item.name);
            let starInName = /★/.test(item.name);
            let type = getType(item.tags);

            try {
                if (item.fraudwarnings !== undefined || item.fraudwarnings[0] !== undefined) nametag = item.fraudwarnings[0].split('Name Tag: \'\'')[1].split('\'\'')[0]
            }
            catch (error) {
            }

            try {
                if (item.actions !== undefined && item.actions[0] !== undefined) {
                    let beggining = item.actions[0].link.split('%20S')[0];
                    let end = item.actions[0].link.split('%assetid%')[1];
                    inspectLink = (`${beggining}%20S${item.owner}A${item.assetid}${end}`);
                }
            }
            catch (error) {
            }

            itemsToReturn.push({
                name: item.name,
                market_hash_name: item.market_hash_name,
                name_color: item.name_color,
                marketlink: marketlink,
                classid: item.classid,
                instanceid: item.instanceid,
                assetid: item.assetid,
                position: item.position,
                dopplerInfo: dopplerInfo,
                exterior: exterior,
                iconURL: item.icon,
                inspectLink: inspectLink,
                quality: quality,
                isStatrack: isStatrack,
                isSouvenir: isSouvenir,
                starInName: starInName,
                stickers: stickers,
                nametag: nametag,
                owner: item.owner,
                type: type,
                floatInfo: null,
                patternInfo: null
            })
        }
    });

    return itemsToReturn;
}

overrideDecline();
overrideShowTradeOffer();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'TradeOffersPageView'
});

// chrome background tab throttling causes steam's own js files to load later than the these injections, so it does not override the functions
// this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
// this is a dirty but working fix for that
let thisManyTimes = 15;
let intervalID = setInterval(() =>{
    if(thisManyTimes > 0){
        overrideShowTradeOffer();
        overrideDecline();
    }
    else clearInterval(intervalID);
    thisManyTimes--;
}, 1000);

// makes the middle of the active trade offers a bit bigger making it the same size as a declined offer so it does not jerk the page when declining
document.querySelectorAll('.tradeoffer_items_rule').forEach(rule => {rule.style.height = '46px'});

getOffersFromAPI().then(
    offers => {
        let allItemsInOffer = extractItemsFromOffers(offers.trade_offers_sent);
        allItemsInOffer = allItemsInOffer.concat(extractItemsFromOffers(offers.trade_offers_received));

        let itemsWithMoreInfo = [];
        allItemsInOffer.forEach(item => {
            let itemDescription = offers.descriptions.find(description => description.classid === item.classid && description.instanceid === item.instanceid);
            itemsWithMoreInfo.push({...item, ...itemDescription}); // combines the properties of the two objects in a new object
        });

        let matchedItems = matchItemsWithDescriptions(itemsWithMoreInfo);

        chrome.runtime.sendMessage({addPricesAndFloatsToInventory: matchedItems}, (response) => {
            //console.log(response.addPricesAndFloatsToInventory);
        });

    }, (error) => {
        if (error !== 'apiKeyInvalid') {
            // TODO retry logic because this should be happening if the error is Steam's side
        }
    }
);