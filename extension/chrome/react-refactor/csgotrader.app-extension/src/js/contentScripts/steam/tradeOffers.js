import {
    getExteriorFromTags, getQuality, getDopplerInfo,
    getType, addDopplerPhase, makeItemColorful,
    addSSTandExtIndicators, addPriceIndicator, addFloatIndicator,
    getItemByAssetID, getPoperStyleSteamIDFromOfferStyle, prettyTimeAgo,
    logExtensionPresence, updateLoggedInUserID, reloadPageOnExtensionReload,
    extractItemsFromOffers } from 'js/utils/utilsModular';
import { genericMarketLink } from 'js/utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from "js/utils/floatQueueing";
import itemTypes from 'js/utils/static/itemTypes';
import { prettyPrintPrice } from 'js/utils/pricing';
import { overrideDecline, overrideShowTradeOffer } from 'js/utils/steamOverriding';
import { trackEvent } from "js/utils/analytics";
import { offersSortingModes } from 'js/utils/static/sortingModes';
import { injectScript, injectStyle } from 'js/utils/injection';

const matchItemsWithDescriptions = (items) => {
    let itemsToReturn = [];
    items.forEach((item) => {
        if (item.market_hash_name !== undefined) { // some items don't have descriptions for some reason - will have to be investigated later
            const exterior = getExteriorFromTags(item.tags);
            const marketlink = genericMarketLink + item.market_hash_name;
            const quality = getQuality(item.tags);
            let nametag = undefined;
            let inspectLink = null;
            const dopplerInfo = (item.name.includes('Doppler') || item.name.includes('doppler')) ? getDopplerInfo(item.icon_url) : null;
            const isStatrack = item.name.includes('StatTrak™');
            const isSouvenir = item.name.includes('Souvenir');
            const starInName = item.name.includes('★');
            const type = getType(item.tags);

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
                name_color: item.name_color, marketlink,
                classid: item.classid,
                instanceid: item.instanceid,
                assetid: item.assetid,
                position: item.position, dopplerInfo, exterior,
                iconURL: item.icon_url,
                inspectLink, quality, isStatrack, isSouvenir, starInName, nametag,
                owner: item.owner, type,
                floatInfo: null,
                patternInfo: null,
                descriptions: item.descriptions
            })
        }
    });

    return itemsToReturn;
};

const isCSGOItemElement = (element) => {
    return element.getAttribute('data-economy-item').includes('classinfo/730/');
};

const getIDsFromElement = (element) => {
    const splitString = element.getAttribute('data-economy-item').split('/');
    return {
        classid: splitString[2] === undefined ? null : splitString[2],
        instanceid: splitString[3] === undefined ? null : splitString[3]
    };
};

const selectItemElementByIDs = (classid, instanceid) => {
    return document.querySelector(`[data-economy-item="classinfo/730/${classid}/${instanceid}"`);
};

const getItemByIDs = (items, IDs) => {
    if (IDs.instanceid !== null) return items.filter(item => item.classid === IDs.classid && item.instanceid === IDs.instanceid)[0];
    else return items.filter(item => item.classid === IDs.classid)[0];
};

const addItemInfo = (items) => {
    let activeItemElements = [];
    document.querySelectorAll('.tradeoffer').forEach(offerElement => {
        let offerItemsElement = offerElement.querySelector('.tradeoffer_items_ctn');

        if (isOfferActive(offerElement)) {
            activeItemElements = offerItemsElement.querySelectorAll('.trade_item').map( item => {
                return item;
            });
        }
    });

    chrome.storage.local.get(['colorfulItems', 'autoFloatOffer', 'showStickerPrice'], (result) => {
        activeItemElements.forEach(itemElement => {
            if ((itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false') && isCSGOItemElement(itemElement)){
                const item = getItemByIDs(items, getIDsFromElement(itemElement));

                if (item !== undefined) {
                    addDopplerPhase(itemElement, item.dopplerInfo);
                    makeItemColorful(itemElement, item, result.colorfulItems);
                    addSSTandExtIndicators(itemElement, item, result.showStickerPrice);
                    addPriceIndicator(itemElement, item.price);

                    if (result.autoFloatOffer && item.inspectLink !== null) {
                        if (item.floatInfo === null && itemTypes[item.type.key].float) {
                            floatQueue.jobs.push({
                                type: 'offersPage',
                                assetID: item.assetid,
                                classid: item.classid,
                                instanceid: item.instanceid,
                                inspectLink: item.inspectLink,
                                callBackFunction: addFloatDataToPage
                            });
                            if (!floatQueue.active) workOnFloatQueue();
                        } else addFloatIndicator(itemElement, item.floatInfo);
                    }
                }

                // marks the item "processed" to avoid additional unnecessary work later
                itemElement.setAttribute('data-processed', 'true');
            }
        });
    });
}

const addTotals = (offers, items) => {
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
                const primaryHeader = offerElement.querySelector('.tradeoffer_items.primary').querySelector('.tradeoffer_items_header');
                const secondaryHeader = offerElement.querySelector('.tradeoffer_items.secondary').querySelector('.tradeoffer_items_header');
                const theirHeader = activePage === 'incoming_offers' ? primaryHeader : secondaryHeader;
                const yourHeader = activePage === 'incoming_offers' ? secondaryHeader : primaryHeader;

                theirHeader.innerText += ` ${prettyPrintPrice(result.currency, (theirItemsTotal).toFixed(2))}`;
                theirHeader.innerText = theirIncludesItemWIthNoPrice ? theirHeader.innerText += ' - includes items with no price' : theirHeader.innerText;
                yourHeader.innerText += ` ${prettyPrintPrice(result.currency, (yourItemsTotal).toFixed(2))}`;
                yourHeader.innerText = yourIncludesItemWIthNoPrice ? yourHeader.innerText += ' - includes items with no price' : yourHeader.innerText;

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
            <div id="potential_profit"><b>Potential profit: </b>${prettyPrintPrice(result.currency, (totalProfit).toFixed(2))}</div>`;
    });
};

const sortOffers = (sortingMode) => {
    const activeOffers = [...document.querySelectorAll('.tradeoffer')].filter(offerElement => isOfferActive(offerElement));
    let sortedOffers = [];

    if (sortingMode === 'profit_amount') {
        sortedOffers = activeOffers.sort((a, b) => {
            const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            return profitOnB - profitOnA;
        });
    }
    else if (sortingMode === 'loss_amount') {
        sortedOffers = activeOffers.sort((a, b) => {
            const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
            return profitOnA - profitOnB;
        });
    }
    else if (sortingMode === 'profit_percentage') {
        sortedOffers = activeOffers.sort((a, b) => {
            const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            return pLB - pLA;
        });
    }
    else if (sortingMode === 'loss_percentage') {
        sortedOffers = activeOffers.sort((a, b) => {
            const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
            return pLA - pLB
        });
    }
    else if (sortingMode === 'default') {
        sortedOffers = activeOffers.sort((a, b) => {
            const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
            const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
            return updatedB - updatedA;
        });
    }
    else if (sortingMode === 'reverse') {
        sortedOffers = activeOffers.sort((a, b) => {
            const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
            const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
            return updatedA - updatedB;
        });
    }

    sortedOffers.reverse();

    // removes offer elements
    activeOffers.forEach(offer => {
        offer.remove();
    });
    document.querySelector('.profile_leftcol').querySelectorAll('.tradeoffer_rule').forEach( rulerElement => {
        rulerElement.remove();
    });

    // adds sorted offer elements to page
    const offerSection = document.querySelector('.profile_leftcol');
    sortedOffers.forEach(offer => {
        const currentTopOffer = offerSection.querySelector('.tradeoffer');
        if (currentTopOffer !== null) currentTopOffer.insertAdjacentElement('beforebegin', offer);
        else offerSection.insertAdjacentElement('beforeend', offer);
    });
};

const isOfferActive = (offerElement) => {
    if (offerElement === null) return null;
    const offerItemsElement = offerElement.querySelector('.tradeoffer_items_ctn');
    if (offerItemsElement !== null) return !offerItemsElement.classList.contains('inactive');
    else return false;
};

const addPartnerOfferSummary = (offers, nthRun) => {
    if (nthRun < 2) {
        chrome.storage.local.get('tradeHistoryOffers', (result) => {
            if (result.tradeHistoryOffers) {
                offers.forEach(offer => {
                    const partnerID = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
                    const storageKey = `offerHistory_${partnerID}`;
                    chrome.storage.local.get(storageKey, (result) => {
                        const offerHistorySummary = result[storageKey];
                        if (offerHistorySummary !== undefined) {
                            const offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);

                            // removes elements from previous runs
                            offerElement.querySelectorAll('.offerHistory').forEach(offerHistoryElement =>  offerHistoryElement.remove());

                            if (isOfferActive(offerElement)) {
                                let receivedElement = `<span class="offerHistory">Received: ${offerHistorySummary.offers_received} Last: ${prettyTimeAgo(offerHistorySummary.last_received)}</span>`;
                                if (offerHistorySummary.offers_received === 0) receivedElement = `<span  class="offerHistory">Received: 0</span>`;
                                offerElement.querySelector('.tradeoffer_items.primary').insertAdjacentHTML('beforeend', receivedElement);

                                let sentElement = `<span  class="offerHistory">Sent: ${offerHistorySummary.offers_sent} Last: ${prettyTimeAgo(offerHistorySummary.last_sent)}</span>`;
                                if (offerHistorySummary.offers_sent === 0) sentElement = `<span  class="offerHistory">Sent: 0</span>`;
                                offerElement.querySelector('.tradeoffer_items.secondary').insertAdjacentHTML('beforeend', sentElement);
                            }
                        }
                    });
                });
            }
        });
        if (nthRun === 0) setTimeout(() => {addPartnerOfferSummary(offers, 1)}, 15000);
    }
};

const updateOfferHistoryData = () => {
    getOffersFromAPI('historical').then(
        offers => {
            chrome.storage.local.get('tradeHistoryLastUpdate', (result) => {
                const allOffers = offers.trade_offers_received.concat(offers.trade_offers_sent);
                let offerHistoryToAdd = {};

                allOffers.forEach(offer => {
                    if (offer.time_updated > result.tradeHistoryLastUpdate) {
                        const partnerID = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
                        const offerSummary = {
                            timestamp: offer.time_updated,
                            partner: partnerID,
                            ours:  offer.is_our_offer
                        };

                        if (offerHistoryToAdd[partnerID] !== undefined) offerHistoryToAdd[partnerID].push(offerSummary);
                        else offerHistoryToAdd[partnerID] = [offerSummary];
                    }
                });

                for (let steamID in offerHistoryToAdd) {
                    const offersToAdd = offerHistoryToAdd[steamID];
                    const storageKey = `offerHistory_${steamID}`;

                    let received = 0;
                    let last_received = 0;
                    let sent = 0;
                    let last_sent = 0;

                    offersToAdd.forEach(offer => {
                        if (offer.ours) {
                            sent++;
                            last_sent = offer.timestamp > last_sent ? offer.timestamp : last_sent;
                        }
                        else {
                            received++;
                            last_received = offer.timestamp > last_received ? offer.timestamp : last_received;
                        }
                    });

                    chrome.storage.local.get(storageKey, (result) => {
                        const offerSummaryFromStorage = result[storageKey];

                        if (offerSummaryFromStorage === undefined) {
                            chrome.storage.local.set({
                                [storageKey]: {
                                    offers_received: received,
                                    offers_sent: sent,
                                    last_received: last_received,
                                    last_sent: last_sent
                                }
                            }, () => {});
                        }
                        else {
                            chrome.storage.local.set({
                                [storageKey]: {
                                    offers_received: offerSummaryFromStorage.offers_received + received,
                                    offers_sent: offerSummaryFromStorage.offers_sent + sent,
                                    last_received: last_received > offerSummaryFromStorage.last_received ? last_received : offerSummaryFromStorage.last_received,
                                    last_sent: last_sent > offerSummaryFromStorage.last_sent ? last_sent : offerSummaryFromStorage.last_sent
                                }
                            }, () => {});
                        }
                    });
                }
                chrome.storage.local.set({tradeHistoryLastUpdate: Math.floor(Date.now() / 1000)}, () => {});
            });

        }, (error) => {
            if (error === 'apiKeyInvalid') {
                console.log('API key invalid');
            }
        }
    );
};

// sends a message to the "back end" to request offers (history or active only with descriptions)
const getOffersFromAPI = (type) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({getTradeOffers: type}, (response) => {
            if (response.apiKeyValid === false) reject('apiKeyInvalid');
            else {
                if (!(response.offers === undefined || response === 'error')) resolve(response.offers);
                else reject('steamError');
            }
        });
    });
};

const addFloatDataToPage = (job, floatQueue, floatInfo, items) => {
    addFloatIndicator(selectItemElementByIDs(job.classid, job.instanceid), floatInfo);
};

logExtensionPresence();
overrideDecline();
overrideShowTradeOffer();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'TradeOffersPageView'
});

let activePage = 'incoming_offers';
if (window.location.href.includes('/tradeoffers/?history=1')) activePage ='incoming_offers_history';
else if (window.location.href.includes('/tradeoffers/sent/?history=1')) activePage ='sent_offers_history';
else if (window.location.href.includes('/tradeoffers/sent/')) activePage ='sent_offers';

// chrome background tab throttling causes steam's own js files to load later than the these injections, so it does not override the functions
// this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
// this is a dirty but working fix for that
let thisManyTimes = 15;
let intervalID = setInterval(() =>{
    if (thisManyTimes > 0) {
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
                    const iconElement = itemElement.querySelector('img');
                    iconElement.src = iconElement.src.replace('73fx73f', '96fx96f');
                    iconElement.setAttribute('srcset', iconElement.getAttribute('srcset').replace('73fx73f', '96fx96f'));
                });
            });
        }
    });
}

// makes clicking on profile avatars open profiles on a new tab
document.querySelectorAll('.playerAvatar').forEach(avatarDiv => {
    const link = avatarDiv.querySelector('a');
    if (link !== null) link.setAttribute('target', '_blank');
});

// makes the middle of the active trade offers a bit bigger making it the same size as a declined offer so it does not jerk the page when declining
if (activePage === 'incoming_offers') document.querySelectorAll('.tradeoffer_items_rule').forEach(rule => {
    rule.style.height = '46px';
});

// adds "accept trade" action to offers
if (activePage === 'incoming_offers') {
    document.querySelectorAll('.tradeoffer').forEach(offerElement => {
        if (isOfferActive(offerElement)) {
            const offerID = offerElement.id.split('tradeofferid_')[1];
            const partnerID = getPoperStyleSteamIDFromOfferStyle(offerElement.querySelector('.playerAvatar').getAttribute('data-miniprofile'));
            offerElement.querySelector('.tradeoffer_footer_actions').insertAdjacentHTML('afterbegin',
                `<a href="javascript:AcceptTradeOffer( '${offerID}', '${partnerID}' );" class="whiteLink">Accept Trade</a> | `)
        }
    });
}

// injects accept trade functionality to page
const acceptTradeScriptString = `
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
if (activePage === 'incoming_offers') injectScript(acceptTradeScriptString, false, 'acceptTradeScript', false);

// adds trade offer summary/help bar and sorting
if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
    const tradeOffersList = document.querySelector('.profile_leftcol');
    if (tradeOffersList !== null && document.querySelector('.profile_fatalerror') === null) {
        updateOfferHistoryData();

        tradeOffersList.insertAdjacentHTML('afterbegin', `
        <div id="tradeoffers_summary" class="trade_offers_module">Waiting for Steam API...</div>
        <div id="tradeOffersSortingMenu" class="trade_offers_module hidden"><span>Sorting: </span><select id="offerSortingMethod"></select></div>`);

        // populates and adds listener to sorting select
        const sortingSelect = document.getElementById('offerSortingMethod');
        const keys = Object.keys(offersSortingModes);

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
                        addPartnerOfferSummary(offers.trade_offers_received, 0);
                    }
                    else if (activePage === 'sent_offers') {
                        addTotals(offers.trade_offers_sent, itemsWithAllInfo);
                        addPartnerOfferSummary(offers.trade_offers_sent, 0);
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
    }
}

reloadPageOnExtensionReload();