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
            let dopplerInfo = /Doppler/.test(item.name) ? getDopplerInfo(item.icon_url) : undefined;
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
                iconURL: item.icon_url,
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

function isCSGOItemElement(element) {
    return element.getAttribute('data-economy-item').includes('classinfo/730/');
}

function getIDsFromElement(element) {
    let splitString = element.getAttribute('data-economy-item').split('/');
    return {
        classid: splitString[2] === undefined ? null : splitString[2],
        instanceid: splitString[3] === undefined ? null : splitString[3]
    };
}

function getItemByIDs(items, IDs) {
    if (IDs.instanceid !== null) return items.filter(item => item.classid === IDs.classid && item.instanceid === IDs.instanceid)[0];
    else return items.filter(item => item.classid === IDs.classid)[0];
}

function addItemInfo(items) {
    let activeItemElements = [];
    document.querySelectorAll('.tradeoffer').forEach(offerElement => {
        let offerItemsElement = offerElement.querySelector('.tradeoffer_items_ctn');
        let offerActive = offerItemsElement.classList.contains('active');

        if (offerActive) {
            let offerItems = offerItemsElement.querySelectorAll('.trade_item');
            offerItems.forEach(item => {
                activeItemElements.push(item);
            });
        }
    });

    chrome.storage.local.get(['colorfulItems', 'autoFloatOffer'], (result) => {
        activeItemElements.forEach(itemElement => {
            if ((itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false') && isCSGOItemElement(itemElement)){
                let item = getItemByIDs(items, getIDsFromElement(itemElement));
                addDopplerPhase(itemElement, item.dopplerInfo);
                makeItemColorful(itemElement, item, result.colorfulItems);
                addSSTandExtIndicators(itemElement, item);
                addPriceIndicator(itemElement, item.price);
                if (result.autoFloatOffer) addFloatIndicator(itemElement, item.floatInfo);

                // marks the item "processed" to avoid additional unnecessary work later
                itemElement.setAttribute('data-processed', 'true');
            }
        });
    });
}

function addTotals(offers, items){
    chrome.storage.local.get('currency', (result) => {
        offers.trade_offers_received.forEach(offer => {
            let yourItemsTotal = 0.0;
            let theirItemTotal = 0.0;

            if (offer.items_to_give !== undefined) offer.items_to_give.forEach(item => {
                if (item.appid === 730) {
                    let itemWithAllInfo = getItemByAssetID(items, item.assetid);
                    if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) yourItemsTotal += parseFloat(itemWithAllInfo.price.price);
                    // TODO add warning text about items with no price
                }
            });
            if (offer.items_to_receive !== undefined) offer.items_to_receive.forEach(item => {
                if (item.appid === 730) {
                    let itemWithAllInfo = getItemByAssetID(items, item.assetid);
                    if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) theirItemTotal += parseFloat(itemWithAllInfo.price.price);
                }
            });

            let offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);
            let primaryHeader = offerElement.querySelector('.tradeoffer_items.primary').querySelector('.tradeoffer_items_header');
            primaryHeader.innerText += ` ${prettyPrintPrice(result.currency, (theirItemTotal).toFixed(2))}`;
            let secondaryHeader = offerElement.querySelector('.tradeoffer_items.secondary').querySelector('.tradeoffer_items_header');
            secondaryHeader.innerText += ` ${prettyPrintPrice(result.currency, (yourItemsTotal).toFixed(2))}`;
        });
    });
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

// adds trade offer summary/help bar
document.querySelector('.profile_leftcol').insertAdjacentHTML('afterbegin', `<div id="tradeoffers_summary" class="tradeoffer">Waiting for Steam API...</div>`);

getOffersFromAPI().then(
    offers => {
        console.log(offers);
        let allItemsInOffer = extractItemsFromOffers(offers.trade_offers_sent);
        allItemsInOffer = allItemsInOffer.concat(extractItemsFromOffers(offers.trade_offers_received));

        let itemsWithMoreInfo = [];
        allItemsInOffer.forEach(item => {
            let itemDescription = offers.descriptions.find(description => description.classid === item.classid && description.instanceid === item.instanceid);
            itemsWithMoreInfo.push({...item, ...itemDescription}); // combines the properties of the two objects in a new object
        });

        let matchedItems = matchItemsWithDescriptions(itemsWithMoreInfo);

        chrome.runtime.sendMessage({addPricesAndFloatsToInventory: matchedItems}, (response) => {
            let itemsWithAllInfo = response.addPricesAndFloatsToInventory;
            addItemInfo(itemsWithAllInfo);
            addTotals(offers, itemsWithAllInfo);
            document.getElementById('tradeoffers_summary').innerHTML = `<b>Trade offer summary:</b>`;
        });

    }, (error) => {
        if (error !== 'apiKeyInvalid') {
            // TODO retry logic because this should be happening if the error is Steam's side
        }
        else {
            document.getElementById('tradeoffers_summary').innerHTML = `<b>CSGOTrader Extension:</b> You don't have your Steam API key set.<br> 
            For more functionality on this page open the options page and set your API key in the General category.`;
        }
    }
);