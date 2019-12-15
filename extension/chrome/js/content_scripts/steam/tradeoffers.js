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

        if (isOfferActive(offerElement)) {
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
        let totalProfit = 0.0;
        let activeOfferCount = 0;
        let numberOfProfitableOffers = 0;

        offers.forEach(offer => {
            let yourItemsTotal = 0.0;
            let theirItemsTotal = 0.0;
            let yourIncludesItemWIthNoPrice = false;
            let theirIncludesItemWIthNoPrice = false;

            if (offer.items_to_give !== undefined) offer.items_to_give.forEach(item => {
                if (item.appid === 730) {
                    let itemWithAllInfo = getItemByAssetID(items, item.assetid);
                    if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) yourItemsTotal += parseFloat(itemWithAllInfo.price.price);
                    else yourIncludesItemWIthNoPrice = true;
                }
            });
            if (offer.items_to_receive !== undefined) offer.items_to_receive.forEach(item => {
                if (item.appid === 730) {
                    let itemWithAllInfo = getItemByAssetID(items, item.assetid);
                    if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) theirItemsTotal += parseFloat(itemWithAllInfo.price.price);
                    else theirIncludesItemWIthNoPrice = true;
                }
            });

            let offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);
            if (isOfferActive(offerElement)) {
                activeOfferCount++;
                let primaryHeader = offerElement.querySelector('.tradeoffer_items.primary').querySelector('.tradeoffer_items_header');
                primaryHeader.innerText += ` ${prettyPrintPrice(result.currency, (theirItemsTotal).toFixed(2))}`;
                theirIncludesItemWIthNoPrice ? primaryHeader.innerText += ' - includes items with no price' : null;
                let secondaryHeader = offerElement.querySelector('.tradeoffer_items.secondary').querySelector('.tradeoffer_items_header');
                secondaryHeader.innerText += ` ${prettyPrintPrice(result.currency, (yourItemsTotal).toFixed(2))}`;
                yourIncludesItemWIthNoPrice ? secondaryHeader.innerText += ' - includes items with no price' : null;

                let profitOrLoss = theirItemsTotal - yourItemsTotal;
                let PLPercentage = theirItemsTotal / yourItemsTotal;
                if (profitOrLoss > 0.0) {
                    totalProfit += profitOrLoss;
                    numberOfProfitableOffers++;
                }
                offerElement.querySelector('.tradeoffer_header').insertAdjacentHTML('beforeend', `
                    <span class="profitOrLoss" data-profit-or-loss="${profitOrLoss}" data-p-l-percentage="${PLPercentage}" data-updated="${offer.time_updated}">
                    ${prettyPrintPrice(result.currency, (profitOrLoss).toFixed(2))}</span>`);
            }
        });

        document.getElementById('tradeoffers_summary').innerHTML = `
                                                                   <div id="active_offers_count"><b>Active Offers: </b>${activeOfferCount}</div>
                                                                   <div id="profitable_offers_count"><b>Profitable Offers: </b>${numberOfProfitableOffers}</div>
                                                                   <div id="potential_profit"><b>Potential profit: </b>${prettyPrintPrice(result.currency, (totalProfit).toFixed(2))}</div>
                                                                    `;
    });
}

function sortOffers(sortingMode){
    let activeOffers = [...document.querySelectorAll('.tradeoffer')].filter(offerElement => isOfferActive(offerElement));
    let sortedOffers = [];

    if (sortingMode === 'profit_amount') {
        sortedOffers = activeOffers.sort((a, b) => {
            let profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            let profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            return profitOnB - profitOnA;
        });
    }
    else if (sortingMode === 'loss_amount') {
        sortedOffers = activeOffers.sort((a, b) => {
            let profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            let profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            return profitOnA - profitOnB;
        });
    }
    else if (sortingMode === 'profit_percentage') {
        sortedOffers = activeOffers.sort((a, b) => {
            let pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            let pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            return pLB - pLA;
        });
    }
    else if (sortingMode === 'loss_percentage') {
        sortedOffers = activeOffers.sort((a, b) => {
            let pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            let pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            return pLA - pLB
        });
    }
    else if (sortingMode === 'default') {
        sortedOffers = activeOffers.sort((a, b) => {
            let updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
            let updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
            return updatedB - updatedA;
        });
    }
    else if (sortingMode === 'reverse') {
        sortedOffers = activeOffers.sort((a, b) => {
            let updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
            let updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
            return updatedA - updatedB;
        });
    }

    sortedOffers.reverse();

    // removes offer elements
    activeOffers.forEach(offer => {offer.parentNode.removeChild(offer)});
    document.querySelector('.profile_leftcol').querySelectorAll('.tradeoffer_rule').forEach( rulerElement => rulerElement.parentNode.removeChild(rulerElement));

    // adds sorted offer elements to page
    let offerSection = document.querySelector('.profile_leftcol');
    sortedOffers.forEach(offer => {
        let currentTopOffer = offerSection.querySelector('.tradeoffer');
        if (currentTopOffer !== null) currentTopOffer.insertAdjacentElement('beforebegin', offer);
        else offerSection.insertAdjacentElement('beforeend', offer);
    });
}

function isOfferActive(offerElement) {
    if (offerElement === null) return null;
    let offerItemsElement = offerElement.querySelector('.tradeoffer_items_ctn');
    if (offerItemsElement !== null) return !offerItemsElement.classList.contains('inactive');
    else return false
}

function addPartnerOfferSummary(offers) {
    offers.forEach(offer => {
        let partnerID = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
        let storageKey = `offerHistory_${partnerID}`;
        chrome.storage.local.get(storageKey, (result) => {
            let offerHistorySummary = result[storageKey];
            if (offerHistorySummary !== undefined) {
                console.log(offerHistorySummary);
                let offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);

                if (isOfferActive(offerElement)) {
                    if (offerHistorySummary.offers_received !== 0) {
                        let receivedElement = `<span>Received: ${offerHistorySummary.offers_received} Last: ${(new Date(offerHistorySummary.last_received)).toISOString()}</span>`;
                        offerElement.querySelector('.tradeoffer_items.primary').insertAdjacentHTML('afterbegin', receivedElement);
                    }
                    else offerElement.querySelector('.tradeoffer_items.primary').insertAdjacentHTML('afterbegin', `<span>Received: 0</span>`);

                    if (offerHistorySummary.offers_sent !== 0) {
                        let sentElement = `<span>Sent: ${offerHistorySummary.offers_sent} Last: ${(new Date(offerHistorySummary.last_sent)).toISOString()}</span>`;
                        offerElement.querySelector('.tradeoffer_items.secondary').insertAdjacentHTML('afterbegin', sentElement);
                    }
                    else offerElement.querySelector('.tradeoffer_items.secondary').insertAdjacentHTML('afterbegin', `<span>Sent: 0</span>`);
                }
            }
        });
    });
}

logExtensionPresence();
overrideDecline();
overrideShowTradeOffer();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'TradeOffersPageView'
});

let activePage = 'incoming_offers';
if (location.href.includes('/tradeoffers/?history=1')) activePage ='incoming_offers_history';
else if (location.href.includes('/tradeoffers/sent/?history=1')) activePage ='sent_offers_history';
else if (location.href.includes('/tradeoffers/sent/')) activePage ='sent_offers';

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

// makes our items the same size (larger) as their items
if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
    chrome.storage.local.get('tradeOffersLargerItems', (result) => {
        if (result.tradeOffersLargerItems) {
            injectStyle(`.tradeoffer_items.secondary .trade_item{
                     width: 96px;
                     height: 96px;
                     margin-right: 8px;
                     margin-bottom: 8px;`, 'itemsSameSize');

            // adjust the icon sizes accordingly
            document.querySelectorAll('.tradeoffer_items.secondary').forEach(secondaryElement => {
                secondaryElement.querySelectorAll('.trade_item').forEach(itemElement => {
                    let iconElement = itemElement.querySelector('img');
                    iconElement.src = iconElement.src.replace('73fx73f', '96fx96f');
                    iconElement.setAttribute('srcset', iconElement.getAttribute('srcset').replace('73fx73f', '96fx96f'));
                });
            });
        }
    });
}

// makes clicking on profile avatars open profiles on a new tab
document.querySelectorAll('.playerAvatar').forEach(avatarDiv => {
    let link = avatarDiv.querySelector('a');
    if (link !== null) link.setAttribute('target', '_blank');
});

// makes the middle of the active trade offers a bit bigger making it the same size as a declined offer so it does not jerk the page when declining
if (activePage === 'incoming_offers') document.querySelectorAll('.tradeoffer_items_rule').forEach(rule => {rule.style.height = '46px'});

// adds "accept trade" action to offers
if (activePage === 'incoming_offers') {
    document.querySelectorAll('.tradeoffer').forEach(offerElement => {
        if (isOfferActive(offerElement)) {
            let offerID = offerElement.id.split('tradeofferid_')[1];
            let partnerID = getPoperStyleSteamIDFromOfferStyle(offerElement.querySelector('.playerAvatar').getAttribute('data-miniprofile'));
            offerElement.querySelector('.tradeoffer_footer_actions').insertAdjacentHTML('afterbegin', `<a href="javascript:AcceptTradeOffer( '${offerID}', '${partnerID}' );" class="whiteLink">Accept Trade</a> | `)
        }
    });
}

// injects accept trade functionality to page
let acceptTradeScriptString = `
                function AcceptTradeOffer(offerID, partnerID){
                    let myHeaders = new Headers();
                    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
                    
                    fetch(
                        'https://steamcommunity.com/tradeoffer/' + offerID + '/accept',
                        {"referrer":'https://steamcommunity.com/tradeoffer/' + offerID + '/',
                            "body":'sessionid=' + g_sessionID + '&serverid=1&tradeofferid=' + offerID + '&partner=' + partnerID + '&captcha=',
                            "headers": myHeaders,
                            "method":"POST"}
                    ).then((response) => {
                        if (!response.ok) {
                            console.log('error');
                        }
                        else return response.json();
                    }).then((body) => {
                        let offerElement = document.getElementById('tradeofferid_' + offerID);
                        let offerContent = offerElement.querySelector('.tradeoffer_items_ctn');
                        offerContent.classList.remove('active');
                        offerContent.classList.add('inactive');
                        let middleElement = offerContent.querySelector('.tradeoffer_items_rule');
                        middleElement.classList.remove('tradeoffer_items_rule');
                        middleElement.classList.add('tradeoffer_items_banner');
                        middleElement.style.height = '';
                        offerElement.querySelector('.tradeoffer_footer').style.display = 'none';
                
                        if (body.needs_email_confirmation || body.needs_mobile_confirmation)  middleElement.innerText = 'Accepted - Awaiting Confirmation';
                        else  {
                            middleElement.innerText = 'Trade Accepted';
                            middleElement.classList.add('accepted');
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                }`;
if (activePage === 'incoming_offers') injectToPage(acceptTradeScriptString, false, 'acceptTradeScript', false);

// adds trade offer summary/help bar and sorting
if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
    let tradeOffersList = document.querySelector('.profile_leftcol');
    if (tradeOffersList !== null && document.querySelector('.profile_fatalerror') === null) {
        tradeOffersList.insertAdjacentHTML('afterbegin', `
        <div id="tradeoffers_summary" class="trade_offers_module">Waiting for Steam API...</div>
        <div id="tradeOffersSortingMenu" class="trade_offers_module hidden"><span>Sorting: </span><select id="offerSortingMethod"></select></div>`);
        // populates and adds listener to sorting select
        let sortingSelect = document.getElementById('offerSortingMethod');
        let keys = Object.keys(offersSortingModes);

        for (let key of keys) {
            let option = document.createElement('option');
            option.value = offersSortingModes[key].key;
            option.text = offersSortingModes[key].name;
            sortingSelect.add(option);
        }

        sortingSelect.addEventListener('change', () => {
            // analytics
            trackEvent({
                type: 'event',
                action: 'TradeOffersPageSorting'
            });

            sortOffers(sortingSelect.options[sortingSelect.selectedIndex].value);
        });

        getOffersFromAPI('active').then(
            offers => {
                let allItemsInOffer = extractItemsFromOffers(offers.trade_offers_sent);
                allItemsInOffer = allItemsInOffer.concat(extractItemsFromOffers(offers.trade_offers_received));

                let itemsWithMoreInfo = [];
                if (allItemsInOffer) {
                    allItemsInOffer.forEach(item => {
                        let itemDescription = offers.descriptions.find(description => description.classid === item.classid && description.instanceid === item.instanceid);
                        itemsWithMoreInfo.push({...item, ...itemDescription}); // combines the properties of the two objects in a new object
                    });
                }

                let matchedItems = matchItemsWithDescriptions(itemsWithMoreInfo);

                chrome.runtime.sendMessage({addPricesAndFloatsToInventory: matchedItems}, (response) => {
                    let itemsWithAllInfo = response.addPricesAndFloatsToInventory;
                    addItemInfo(itemsWithAllInfo);

                    if (activePage === 'incoming_offers') {
                        addTotals(offers.trade_offers_received, itemsWithAllInfo);
                        addPartnerOfferSummary(offers.trade_offers_received);
                    }
                    else if (activePage === 'sent_offers') {
                        addTotals(offers.trade_offers_sent, itemsWithAllInfo);
                        addPartnerOfferSummary(offers.trade_offers_sent);
                    }

                    document.getElementById('tradeoffers_summary').innerHTML = `<b>Trade offer summary:</b>`;

                    chrome.storage.local.get('tradeOffersSortingMode', (result) => {
                        document.querySelector(`#offerSortingMethod [value="${result.tradeOffersSortingMode}"]`).selected = true;
                        sortOffers(result.tradeOffersSortingMode);
                        document.getElementById('tradeOffersSortingMenu').classList.remove('hidden');
                    });
                });

            }, (error) => {
                if (error === 'apiKeyInvalid') {
                    document.getElementById('tradeoffers_summary').innerHTML = `<b>CSGOTrader Extension:</b> You don't have your Steam API key set.<br> 
            For more functionality on this page you must set your API key.
             You can do so by <a href="https://steamcommunity.com/dev/apikey" target="_blank">clicking here</a>.
            Check what you are missing in the <a href="https://csgotrader.app/release-notes#1.20" target="_blank">Release Notes</a>`;
                }
            }
        );

        updateOfferHistoryData();
    }
}

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});