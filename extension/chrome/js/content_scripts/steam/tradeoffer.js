function getInventories(){
    yourInventory = getItemInfoFromPage('You');
    theirInventory = getItemInfoFromPage('Them');

    if(yourInventory !== null && theirInventory !== null){
        let yourBuiltInventory = buildInventoryStructure(yourInventory);
        let theirBuiltInventory = buildInventoryStructure(theirInventory);

        chrome.runtime.sendMessage({addPricesAndFloatsToInventory: yourBuiltInventory}, (response) => {
            let yourInventoryWithPrices = response.addPricesAndFloatsToInventory;
            chrome.runtime.sendMessage({addPricesAndFloatsToInventory: theirBuiltInventory}, (response) => {
                let theirInventoryWithPrices = response.addPricesAndFloatsToInventory;
                for (let assetid in yourInventoryWithPrices) combinedInventories.push(yourInventoryWithPrices[assetid]);
                for (let assetid in theirInventoryWithPrices) combinedInventories.push(theirInventoryWithPrices[assetid]);
                addItemInfo();
                addInventoryTotals(yourInventoryWithPrices, theirInventoryWithPrices);
                addInTradeTotals('your');
                addInTradeTotals('their');
                periodicallyUpdateTotals();
                doInitSorting();
            });
        });
    }
    else setTimeout(() => {getInventories()}, 500);
}

function findElementByAssetID(assetID){ return document.getElementById(`item730_2_${assetID}`)}

function addItemInfo() {
    removeSIHStuff();

    let itemElements = document.querySelectorAll('.item.app730.context2');
    if (itemElements.length !== 0){
        chrome.storage.local.get(['colorfulItems', 'autoFloatOffer'], (result) => {
            itemElements.forEach(itemElement =>{
                if (itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false'){
                    // in case the inventory is not loaded yet it retires in a second
                    if (itemElement.id === undefined) {
                        setTimeout( () =>{addItemInfo()}, 1000);
                        return false
                    }
                    else{
                        let item = getItemByAssetID(combinedInventories, getAssetIDOfElement(itemElement));
                        addDopplerPhase(itemElement, item.dopplerInfo);
                        makeItemColorful(itemElement, item, result.colorfulItems);
                        addSSTandExtIndicators(itemElement, item);
                        addPriceIndicator(itemElement, item.price);
                        if (result.autoFloatOffer) addFloatIndicator(itemElement, item.floatInfo);

                        // marks the item "processed" to avoid additional unnecessary work later
                        itemElement.setAttribute('data-processed', 'true');
                    }
                }
            });
        });
    }
    // in case the inventory is not loaded yet
    else{setTimeout( () => {addItemInfo()}, 1000)}
}

function buildInventoryStructure(inventory) {
    let inventoryArrayToReturn = [];
    let duplicates = {};

    inventory.forEach((item) => {
        if (duplicates[item.market_hash_name] === undefined){
            let instances = [item.assetid];
            duplicates[item.market_hash_name] = {
                num: 1,
                instances: instances
            };
        }
        else{
            duplicates[item.market_hash_name].num += 1;
            duplicates[item.market_hash_name].instances.push(item.assetid);
        }
    });

    inventory.forEach((item) => {
        let exterior = getExteriorFromTags(item.tags);
        let marketlink = `https://steamcommunity.com/market/listings/730/${item.market_hash_name}`;
        let quality = getQuality(item.tags);
        let stickers =  parseStickerInfo(item.descriptions, 'direct');
        let nametag = undefined;
        let inspectLink = null;
        let dopplerInfo = /Doppler/.test(item.name) ? getDopplerInfo(item.icon) : undefined;
        let isStatrack = /StatTrak™/.test(item.name);
        let isSouvenir = /Souvenir/.test(item.name);
        let starInName = /★/.test(item.name);
        let type = getType(item.tags);

        try {if (item.fraudwarnings !== undefined || item.fraudwarnings[0] !== undefined) nametag = item.fraudwarnings[0].split('Name Tag: \'\'')[1].split('\'\'')[0]}
        catch(error) {}

        try {
            if (item.actions !== undefined && item.actions[0] !== undefined){
                let beggining = item.actions[0].link.split('%20S')[0];
                let end = item.actions[0].link.split('%assetid%')[1];
                inspectLink = (`${beggining}%20S${item.owner}A${item.assetid}${end}`);
            }
        }
        catch(error) {}

        inventoryArrayToReturn.push({
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
            duplicates: duplicates[item.market_hash_name],
            owner: item.owner,
            type: type,
            floatInfo: null,
            patternInfo: null
        })
    });

    return inventoryArrayToReturn.sort((a, b) => { return a.position - b.position});
}

function removeSIHStuff() {document.querySelectorAll('.des-tag, .p-price, .price-tag').forEach(element => {element.parentNode.removeChild(element)})}

function addInventoryTotals(yourInventory, theirInventory){
    chrome.runtime.sendMessage({inventoryTotal: yourInventory}, (response) => {
        if (!(response === undefined || response.inventoryTotal === undefined || response.inventoryTotal === '' || response.inventoryTotal === 'error')){
            let yourInventoryTitleDiv = document.getElementById('inventory_select_your_inventory').querySelector('div');
            yourInventoryTitleDiv.style.fontSize = '16px';
            yourInventoryTitleDiv.innerText = `${yourInventoryTitleDiv.innerText} (${response.inventoryTotal})`;
        }
    });
    chrome.runtime.sendMessage({inventoryTotal: theirInventory}, (response) => {
        if (!(response === undefined || response.inventoryTotal === undefined || response.inventoryTotal === '' || response.inventoryTotal === 'error')){
            let theirInventoryTitleDiv = document.getElementById('inventory_select_their_inventory').querySelector('div');
            theirInventoryTitleDiv.style.fontSize = '16px';
            theirInventoryTitleDiv.innerText = `${theirInventoryTitleDiv.innerText} (${response.inventoryTotal})`;
        }
    });
}

function addInTradeTotals(whose){
    let itemsInTrade = document.getElementById(`${whose}_slots`).querySelectorAll('.item.app730.context2');
    let inTradeTotal = 0;

    itemsInTrade.forEach((inTradeItem) =>{
        let item = getItemByAssetID(combinedInventories, getAssetIDOfElement(inTradeItem));
        if (item.price !== undefined) inTradeTotal += parseFloat(item.price.price);
    });

    if (document.getElementById(`${whose}InTradeTotal`) === null){
        let itemsTextDiv;
        if (whose === 'your') itemsTextDiv = document.getElementById('trade_yours').querySelector('h2.ellipsis');
        else itemsTextDiv = document.getElementById('trade_theirs').querySelector('.offerheader').querySelector('h2');
        chrome.storage.local.get('currency', (result) => {
            itemsTextDiv.innerHTML = `${itemsTextDiv.innerText.split(':')[0]} (<span id="${whose}InTradeTotal">${prettyPrintPrice(result.currency, inTradeTotal)}</span>):`;
        });
    }
    else chrome.storage.local.get('currency', (result) => {document.getElementById(`${whose}InTradeTotal`).innerText = prettyPrintPrice(result.currency, inTradeTotal)});
}

function periodicallyUpdateTotals(){setInterval(() => {if (!document.hidden) addInTradeTotals('your'); addInTradeTotals('their')}, 1000)}

function sortItems(method, type) {
    if (isCSGOInventoryActive('offer')){
        if (type === 'offer'){
            let activeInventory = getActiveInventory();

            let items = activeInventory.querySelectorAll('.item.app730.context2');
            let offerPages = activeInventory.querySelectorAll('.inventory_page');
            doTheSorting(combinedInventories, Array.from(items), method, offerPages, type);
        }
        else {
            let items = document.getElementById(`trade_${type}s`).querySelectorAll('.item.app730.context2');
            doTheSorting(combinedInventories, Array.from(items), method, document.getElementById(`${type}_slots`), type);
        }

        loadAllItemsProperly();
    }
}

// forces steam to load the item images
function loadAllItemsProperly(){
    let loadAllItemsProperly = `
        g_ActiveInventory.pageList.forEach(function (page, index) {
            g_ActiveInventory.pageList[index].images_loaded = false;
            g_ActiveInventory.LoadPageImages(page);
        });`;
    injectToPage(loadAllItemsProperly, true, 'loadAllItemsProperly', null);
}

function addFunctionBars(){
    if (document.getElementById('responsivetrade_itemfilters') !== null) {
        if (document.getElementById('offer_function_bar') === null) {
            // inserts left side function bar
            document.getElementById('responsivetrade_itemfilters').insertAdjacentHTML('beforebegin', `
            <div id="offer_function_bar">
                <div id="offer_sorting">
                    <span>Sorting:</span>
                    <select id="offer_sorting_mode"></select>
                </div>
                <div id="offer_take">
                    <span>Take: </span>
                    <span class="offer_action" id="take_all_button">All page</span>
                    <span class="offer_action" id="take_everything_button">Everything</span>
                    <input type="number" id="take_number_of_keys" class="keyNumberInput">
                    <span class="offer_action" id="take_keys">Keys</span>
                    <input type="number" id="take_number_of_selected" class="keyNumberInput">
                    <span class="offer_action" id="take_selected">Selected</span>
                </div>
            </div>
            `);

            // take all from page functionality
            document.getElementById('take_all_button').addEventListener('click', () => {
                let activePage = null;

                getActiveInventory().querySelectorAll('.inventory_page').forEach(page => {if (page.style.display !== 'none') activePage = page});
                activePage.querySelectorAll('.item').forEach(item => {moveItem(item)});
            });

            // take everything functionality
            document.getElementById('take_everything_button').addEventListener('click', () => {
                getActiveInventory().querySelectorAll('.item').forEach(item => {moveItem(item)});
            });

            // add keys functionality
            document.getElementById('take_keys').addEventListener('click', () => {
                let numberOfKeys = document.getElementById('take_number_of_keys').value;
                let keysTaken = 0;
                getActiveInventory().querySelectorAll('.item').forEach((item) => {
                    if (keysTaken < numberOfKeys && getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).type.internal_name === itemTypes.key.internal_name){
                        moveItem(item);
                        keysTaken++;
                    }
                });
            });

            // add selected functionality
            document.getElementById('take_selected').addEventListener('click', () => {
                let numberOfSelected = document.getElementById('take_number_of_selected').value;
                let selectedItems = [];
                let selectedTaken = 0;

                let itemElements = getActiveInventory().querySelectorAll('.item');

                itemElements.forEach((item) => { // goes through the items and collects the names of the selected ones
                    if (item.classList.contains('selected')) {
                        selectedItems.push(getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name);
                    }
                });

                itemElements.forEach((item) => {
                    if (selectedTaken < numberOfSelected && selectedItems.includes(getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name)){
                        moveItem(item);
                        selectedTaken++;
                    }
                });
            });

            addAPartysFunctionBar('your');
            addAPartysFunctionBar('their');

            let sortingSelect = document.getElementById('offer_sorting_mode');
            let yourSortingSelect = document.getElementById('offer_your_sorting_mode');
            let theirSortingSelect = document.getElementById('offer_their_sorting_mode');

            let keys = Object.keys(sortingModes);
            for (let key of keys) {
                let option = document.createElement('option');
                if (key !== 'tradability_desc' && key !== 'tradability_asc') {
                    option.value = sortingModes[key].key;
                    option.text = sortingModes[key].name;
                    sortingSelect.appendChild(option);
                    yourSortingSelect.appendChild(option.cloneNode(true));
                    theirSortingSelect.appendChild(option.cloneNode(true));
                }
            }
            sortingSelect.addEventListener('change', () => {
                // analytics
                trackEvent({
                    type: 'event',
                    action: 'OfferSorting'
                });

                sortItems(sortingSelect.options[sortingSelect.selectedIndex].value, 'offer');
                addFloatIndicatorsToPage('page');
            });
            yourSortingSelect.addEventListener('change', () => {
                // analytics
                trackEvent({
                    type: 'event',
                    action: 'OfferSorting'
                });

                sortItems(yourSortingSelect.options[yourSortingSelect.selectedIndex].value, 'your');
                addFloatIndicatorsToPage('your');
            });
            theirSortingSelect.addEventListener('change', () => {
                // analytics
                trackEvent({
                    type: 'event',
                    action: 'OfferSorting'
                });

                sortItems(theirSortingSelect.options[theirSortingSelect.selectedIndex].value, 'their');
                addFloatIndicatorsToPage('their');
            });
        }
    }
    else setTimeout(() => {addFunctionBars()}, 500);
}

function doInitSorting() {
    chrome.storage.local.get(['offerSortingMode', 'switchToOtherInventory'], (result) => {
        if(result.switchToOtherInventory) document.getElementById("inventory_select_their_inventory").click();
        sortItems(result.offerSortingMode, 'offer');
        sortItems(result.offerSortingMode, 'your');
        sortItems(result.offerSortingMode, 'their');
        addFloatIndicatorsToPage('their');
        addFloatIndicatorsToPage('page');
        addFloatIndicatorsToPage('your');
        document.querySelector(`#offer_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;
        document.querySelector(`#offer_your_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;
        document.querySelector(`#offer_their_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;
        singleClickControlClick();
    });
}

function getActiveInventory(){
    let activeInventory = null;
    document.querySelectorAll('.inventory_ctn').forEach(inventory => {if (inventory.style.display !== 'none') activeInventory = inventory});
    return activeInventory;
}

// moves items to/from being in the offer
function moveItem(item){
    let clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent ('dblclick', true, true);
    item.dispatchEvent (clickEvent);
}

// single click move, move same with ctrl+click, ctrl +right click to select item for mass moving
function singleClickControlClick(){
    document.querySelectorAll('.item.app730.context2').forEach(item => {
        item.removeEventListener('click', singleClickControlClickHandler);
        item.removeEventListener('click', singleClickControlClickHandler, false);

    });

    document.querySelectorAll('.item.app730.context2').forEach(item => {
        item.addEventListener('click', singleClickControlClickHandler);
        item.addEventListener('contextmenu', rightClickControlHandler, false);
    });
}

function singleClickControlClickHandler(event) {
    if (event.ctrlKey) {
        let marketHashNameToLookFor = getItemByAssetID(combinedInventories, getAssetIDOfElement(event.target.parentNode)).market_hash_name;
        let inInventory = null;
        if (event.target.parentNode.parentNode.parentNode.parentNode.id === 'their_slots') inInventory = document.getElementById('their_slots');
        else if (event.target.parentNode.parentNode.parentNode.parentNode.id === 'your_slots') inInventory = document.getElementById('your_slots');
        else inInventory = getActiveInventory();
        inInventory.querySelectorAll('.item.app730.context2').forEach(item => {
            if (getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name === marketHashNameToLookFor){
                moveItem(item);
            }
        });

        removeLeftOverSlots();
    }
    else moveItem(event.target);
}

// removes buggy slots that remain behind and break the ui
function removeLeftOverSlots(){
    setTimeout( () =>{
        document.querySelectorAll('.itemHolder.trade_slot').forEach(slot => {if (slot.parentNode.id !== 'your_slots' && slot.parentNode.id !== 'their_slots') slot.parentNode.removeChild(slot)})
    }, 500);
}

function addAPartysFunctionBar(whose){
    // inserts "your" function bar
    document.getElementById(`trade_${whose}s`).querySelector('.offerheader').insertAdjacentHTML('afterend', `
            <div id="offer_${whose}_function_bar">
                <div id="offer_${whose}_sorting">
                    <span>Sorting:</span>
                    <select id="offer_${whose}_sorting_mode"></select>
                </div>
                <div id="offer_${whose}_remove">
                    <span>Remove: </span>
                    <span class="offer_action" id="remove_${whose}_everything_button">Everything</span>
                    <input type="number" id="remove_${whose}_number_of_keys" class="keyNumberInput">
                    <span class="offer_action" id="remove_${whose}_keys">Keys</span>
                    <input type="number" id="remove_${whose}_number_of_selected" class="keyNumberInput">
                    <span class="offer_action" id="remove_${whose}_selected">Selected</span>
                </div>
            </div>
            `);

    // remove your/their everything functionality
    document.getElementById(`remove_${whose}_everything_button`).addEventListener('click', () => {
        document.getElementById(`trade_${whose}s`).querySelectorAll('.item').forEach(item => {moveItem(item)});
        removeLeftOverSlots();
    });

    // remove your/their keys functionality
    document.getElementById(`remove_${whose}_keys`).addEventListener('click', () => {
        let numberOfKeys = document.getElementById(`remove_${whose}_number_of_keys`).value;
        let keysRemoved = 0;
        document.getElementById(`trade_${whose}s`).querySelectorAll('.item').forEach((item) => {
            if (keysRemoved < numberOfKeys && getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).type.internal_name === itemTypes.key.internal_name){
                moveItem(item);
                keysRemoved++;
            }
            removeLeftOverSlots();
        });
    });

    // remove your/their selected items functionality
    document.getElementById(`remove_${whose}_selected`).addEventListener('click', () => {
        let numberOfSelected = document.getElementById(`remove_${whose}_number_of_selected`).value;
        let selectedRemoved = 0;
        let selectedItems = [];
        let itemElements = document.getElementById(`trade_${whose}s`).querySelectorAll('.item');
        itemElements.forEach((item) => {
            if (item.classList.contains('selected')) selectedItems.push(getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name);
        });

        itemElements.forEach((item) => {
            if (selectedRemoved < numberOfSelected && selectedItems.includes(getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name)){
                moveItem(item);
                selectedRemoved++;
            }
            removeLeftOverSlots();
        });
    });
}

function addFloatIndicatorsToPage(type) {
    chrome.storage.local.get('autoFloatOffer', (result) => {
        if (result.autoFloatOffer && isCSGOInventoryActive('offer')) {
            let itemElements;
            if (type === 'page'){
                let page = getActivePage('offer');
                if (page !== null) itemElements = page.querySelectorAll('.item.app730.context2');
                else setTimeout(() => {addFloatIndicatorsToPage(type)}, 1000)}
            else {
                let page = document.getElementById(`trade_${type}s`);
                if (page !== null) itemElements = page.querySelectorAll('.item.app730.context2');
                else setTimeout(() => {addFloatIndicatorsToPage(type)}, 1000)}
            itemElements.forEach(itemElement => {
                let item = getItemByAssetID(combinedInventories, getAssetIDOfElement(itemElement));
                if (item.inspectLink !== null){
                    if (item.floatInfo === null && itemTypes[item.type.key].float) {
                        floatQueue.jobs.push({
                            type: 'offer',
                            assetID: item.assetid,
                            inspectLink: item.inspectLink
                        });
                    }
                    else addFloatIndicator(itemElement, item.floatInfo);
                }
            });
            if (!floatQueue.active) workOnFloatQueue();
        }
    });
}

function getOfferID() {return location.href.split('tradeoffer/')[1].split('/')[0]}

function getItemInfoFromPage(who) {
    let getItemsSccript = `
            inventory = User${who}.getInventory(730,2);
            assets = inventory.rgInventory;
            steamID = inventory.owner.strSteamId;
            trimmedAssets = [];
            
            if(assets !== null){
                assetKeys = Object.keys(assets);
                
                for(let assetKey of assetKeys){
                    trimmedAssets.push({
                        amount: assets[assetKey].amount,
                        assetid: assets[assetKey].id,
                        actions: assets[assetKey].actions,
                        classid: assets[assetKey].classid,
                        icon: assets[assetKey].icon_url,
                        instanceid: assets[assetKey].instanceid,
                        contextid: assets[assetKey].contextid,
                        descriptions: assets[assetKey].descriptions,
                        market_actions: assets[assetKey].market_actions,
                        market_hash_name: assets[assetKey].market_hash_name,
                        name: assets[assetKey].name,
                        name_color: assets[assetKey].name_color,
                        position: assets[assetKey].pos,
                        type: assets[assetKey].type,
                        owner: steamID,
                        fraudwarnings: assets[assetKey].fraudwarnings,
                        tags: assets[assetKey].tags
                    });
                }
             }
             else trimmedAssets = null;
        document.querySelector('body').setAttribute('offerInventoryInfo', JSON.stringify(trimmedAssets));`;
    return JSON.parse(injectToPage(getItemsSccript, true, 'getOfferItemInfo', 'offerInventoryInfo'));
}

function rightClickControlHandler(event) {
    if (event.ctrlKey) {
        event.preventDefault(); // prevents the default behavior from happening - which would be the context menu appearing in this case
        event.target.parentNode.classList.toggle('selected');
        return false;
    }
}

const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

let yourInventory = null;
let theirInventory = null;
let combinedInventories = [];

logExtensionPresence();

// initiates all logic that needs access to item info
getInventories();


// adds "get float value" action item
overrideHandleTradeActionMenu();

injectStyle(`
    .slot_app_fraudwarning{
        top: 19px !important;
        left: 75px !important;
    }`, 'nametagWarning');
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'TradeOfferView'
});

// changes background and adds a banner if steamrep banned scammer detected
chrome.storage.local.get('markScammers', result => {if(result.markScammers) warnOfScammer(getTradePartnerSteamID(), 'offer')});

// add an info card to the top of the offer about offer history with the user (sent/received)
function addPartnerOfferSummary() {
    chrome.storage.local.get(['tradeHistoryOffers', `offerHistory_${getTradePartnerSteamID()}`], (result) => {
        let offerHistory = result[`offerHistory_${getTradePartnerSteamID()}`];
        if (result.tradeHistoryOffers) {
            if (offerHistory === undefined) {
                offerHistory = {
                    offers_received: 0,
                    offers_sent: 0,
                    last_received: 0,
                    last_sent: 0
                }
            }

            let headline = document.querySelector('.trade_partner_headline');
            if (headline !== null) {
                headline.insertAdjacentHTML('afterend', `
                        <div class="trade_partner_info_block offerHistoryCard"> 
                            <div>Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? dateToISODisplay(offerHistory.last_received) : '-'}</div>
                            <div>Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? dateToISODisplay(offerHistory.last_sent) : '-'}</div>
                        </div>`);
            }
        }
    });
}

setInterval(() => {chrome.storage.local.get('hideOtherExtensionPrices', (result) => { if (result.hideOtherExtensionPrices && !document.hidden) removeSIHStuff()})}, 2000);

document.querySelectorAll('.inventory_user_tab').forEach( (inventoryTab) => {
    inventoryTab.addEventListener('click', () => {
        addItemInfo();
        let sortingSelect = document.getElementById('offer_sorting_mode');
        sortItems(sortingSelect.options[sortingSelect.selectedIndex].value, 'offer');
    })
});

let inventorySelector = document.getElementById('appselect');
if (inventorySelector !== null) {
    document.getElementById('appselect').addEventListener('click', () => {
        setTimeout( () => {if (isCSGOInventoryActive('offer')) addItemInfo()}, 2000);
    });
}

addPageControlEventListeners('offer');

addSearchListener('offer');

let theirInventoryTab = document.getElementById('inventory_select_their_inventory');
if (theirInventoryTab !== null) document.getElementById('inventory_select_their_inventory').addEventListener('click', () => { // if the offer is "active"
    singleClickControlClick();
    setTimeout(() => {addFloatIndicatorsToPage('page')}, 500);
});

addFunctionBars();
addPartnerOfferSummary();

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});