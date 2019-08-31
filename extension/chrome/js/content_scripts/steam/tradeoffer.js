const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

let yourInventory = undefined;
let theirInventory = undefined;
let combinedInventories = [];

// the promise will be stored here temporarily
let yourInventoryPromise = undefined;
let theirInventoryPromise = undefined;

//listens to the message events on the extension side of the communication
window.addEventListener('message', e => {
    if (e.data.type === 'yourInventory') {
        yourInventoryPromise(e.data);
        yourInventoryPromise = undefined;
    }
    else if (e.data.type === 'theirInventory') {
        theirInventoryPromise(e.data);
        theirInventoryPromise = undefined;
    }
});

//sends the message to the page side to get the info
const getYourInventory = function() {
    window.postMessage(
        {
            type: 'requestYourInventory'
        },
        '*'
    );
    return new Promise(resolve => {
        yourInventoryPromise = resolve;
    });
};

const getTheirInventory = function() {
    window.postMessage(
        {
            type: 'requestTheirInventory'
        },
        '*'
    );
    return new Promise(resolve => {
        theirInventoryPromise = resolve;
    });
};

//this injected script listens to the messages from the extension side and responds with the page context info needed
let inventoryAccessScript = `
    window.addEventListener('message', (e) => {
        if (e.data.type === 'requestYourInventory' || e.data.type === 'requestTheirInventory') {
            let inventory = undefined;
            if(e.data.type === 'requestYourInventory'){
                inventory = UserYou.getInventory(730,2);
            }
            else{
                inventory = UserThem.getInventory(730,2);
            }
            let assets = inventory.rgInventory;
            let steamID = inventory.owner.strSteamId;
            if(assets!==null){
                let assetKeys= Object.keys(assets);
                let trimmedAssets = [];
                
                for(let assetKey of assetKeys){
                    let asset = {
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
                    };
                    trimmedAssets.push(asset);
                }
                    if(e.data.type === 'requestYourInventory'){
                        window.postMessage({
                            type: 'yourInventory',
                            inventory: trimmedAssets
                        }, '*');
                    }
                    else{
                        window.postMessage({
                            type: 'theirInventory',
                            inventory: trimmedAssets
                        }, '*');
                    }
                }
            else{
                if(e.data.type === 'requestYourInventory'){
                        window.postMessage({
                            type: 'yourInventory',
                            inventory: null
                        }, '*');
                    }
                    else{
                        window.postMessage({
                            type: 'theirInventory',
                            inventory: null
                        }, '*');
                    }
            }
        }
    });`;
injectToPage(inventoryAccessScript, false, 'inventoryAccessScript', null);

let tryGettingInventories = setInterval(getInventories,500);

function getInventories(){
    getYourInventory().then(inventory => {
        if(inventory.inventory!==null){
            yourInventory = inventory.inventory;
        }
    });

    getTheirInventory().then(inventory => {
        if(inventory.inventory!==null){
            theirInventory = inventory.inventory;
        }
    });

    if(yourInventory !== undefined && theirInventory !== undefined){
        clearInterval(tryGettingInventories);
        let yourBuiltInventory = buildInventoryStructure(yourInventory);
        let theirBuiltInventory = buildInventoryStructure(theirInventory);

        chrome.runtime.sendMessage({addPricesToInventory: yourBuiltInventory}, function(response) {
            let yourInventoryWithPrices = response.addPricesToInventory;
            chrome.runtime.sendMessage({addPricesToInventory: theirBuiltInventory}, function(response) {
                let theirInventoryWithPrices = response.addPricesToInventory;
                for (let assetid in yourInventoryWithPrices){
                    combinedInventories.push(yourInventoryWithPrices[assetid])
                }
                for (let assetid in theirInventoryWithPrices){
                    combinedInventories.push(theirInventoryWithPrices[assetid])
                }
                addItemInfo();
                addInventoryTotals(yourInventoryWithPrices, theirInventoryWithPrices);
                addInTradeTotals("your");
                addInTradeTotals("their");
                periodicallyUpdateTotals();
                doInitSorting();
            });

        });
    }
}

// adds "get float value" action item
overrideHandleTradeActionMenu();

updateLoggedInUserID();

// changes background and adds a banner if steamrep banned scammer detected
chrome.storage.local.get('markScammers', result => {if(result.markScammers) warnOfScammer(getTradePartnerSteamID(), 'offer')});

//this script gets injected, it allows communication between the page context and the content script initiated on the page
//when the function is called it dispatches a an event that we listen to from the content script
let sendMessageToContentScript = `
    function sendMessageToContentScript(message){
        let event = new CustomEvent('message', { 'detail': message });
        document.dispatchEvent(event);
    }`;
injectToPage(sendMessageToContentScript, false,'sendMessageToContentScript', null);

setInterval(() => {chrome.storage.local.get('hideOtherExtensionPrices', (result) => { if (result.hideOtherExtensionPrices && !document.hidden) removeSIHStuff()})}, 2000);

document.querySelectorAll('.inventory_user_tab').forEach( (inventoryTab) => {
    inventoryTab.addEventListener('click', () => {
        addItemInfo();
        let sortingSelect = document.getElementById('offer_sorting_mode');
        sortItems(sortingSelect.options[sortingSelect.selectedIndex].value);
    })
});

document.addEventListener('message', (e) => {addFloatIndicator(e.detail)});

function addFloatIndicator(inspectLink) {
    chrome.runtime.sendMessage({getFloatInfo: inspectLink}, (response) => {
        let float = 'Waiting for csgofloat.com';
        try{float = response.floatInfo.floatvalue}
        catch{}
        let itemToAddFloatTo = findElementByAssetID(inspectLink.split('A')[1].split('D')[0]);
        itemToAddFloatTo.insertAdjacentHTML('beforeend', `<span class='floatIndicator'>${float.toFixed(4)}</span>`);
    });
}

function findElementByAssetID(assetID){ return document.getElementById(`item730_2_${assetID}`)}

function addItemInfo() {
    removeSIHStuff();

    // moves the nametag warning icon to make space for other elements
    document.querySelectorAll('.slot_app_fraudwarning').forEach(fraudwarning => {fraudwarning.setAttribute('style', `${fraudwarning.getAttribute('style')}; top: 19px; left: 75px;`)});

    let itemElements = document.querySelectorAll('.item.app730.context2');
    if (itemElements.length !== 0){
        chrome.storage.local.get('colorfulItems', (result) => {
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

                        if(result.colorfulItems){
                            if (item.dopplerInfo !== undefined) itemElement.setAttribute('style', `background-image: url(); background-color: #${item.dopplerInfo.color}`);
                            else itemElement.setAttribute('style', `background-image: url(); background-color: ${item.quality.backgroundcolor}; border-color: ${item.quality.backgroundcolor}`);
                        }

                        let stattrak = item.isStatrack ? 'ST' : '';
                        let souvenir = item.isSouvenir ? 'S' : '';
                        let exterior = item.exterior !== undefined ? item.exterior.localized_short : '';

                        itemElement.insertAdjacentHTML('beforeend', `<div class='exteriorSTInfo'><span class="souvenirYellow">${souvenir}</span><span class="stattrakOrange">${stattrak}</span><span class="exteriorIndicator">${exterior}</span></div>`);

                        if(item.price !== undefined && item.price !== "null" && item.price !== null) itemElement.insertAdjacentHTML('beforeend', `<div class='priceIndicator'>${item.price.display}</div>`);
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
        let quality = getQuality(item.type);
        let stickers =  parseStickerInfo(item.descriptions, 'direct');
        let nametag = undefined;
        let inspectLink ="";
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
            type: type
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

function sortItems(method) {
    let activeInventory = getActiveInventory();

    let items = activeInventory.querySelectorAll('.item.app730.context2');
    let offerPages = activeInventory.querySelectorAll('.inventory_page');
    doTheSorting(combinedInventories, Array.from(items), method, offerPages, 'offer');

    loadAllItemsProperly();
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

function addFunctionBar(){
    if(document.getElementById('responsivetrade_itemfilters') !== null) {
        if (document.getElementById('offer_function_bar') === null) {
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
                    <input type="number" id="take_number_of_keys">
                    <span class="offer_action" id="take_keys">Keys</span>
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

            let sortingSelect = document.getElementById('offer_sorting_mode');

            let keys = Object.keys(sortingModes);
            for (let key of keys) {
                let option = document.createElement('option');
                if (key !== 'tradability_desc' && key !== 'tradability_asc') {
                    option.value = sortingModes[key].key;
                    option.text = sortingModes[key].name;
                    sortingSelect.appendChild(option);
                }
            }
            sortingSelect.addEventListener('change', () => {
                let selected = sortingSelect.options[sortingSelect.selectedIndex].value;
                sortItems(selected);
            });
        }
    }
    else setTimeout(() => {addFunctionBar()}, 500);
}

function doInitSorting() {
    chrome.storage.local.get(['offerSortingMode', 'switchToOtherInventory'], (result) => {
        if(result.switchToOtherInventory) document.getElementById("inventory_select_their_inventory").click();
        sortItems(result.offerSortingMode);
        document.querySelector('#offer_sorting_mode [value="' + result.offerSortingMode + '"]').selected = true;
    });
}

function getActiveInventory(){
    let activeInventory = null;
    document.querySelectorAll('.inventory_ctn').forEach(inventory => {if (inventory.style.display !== 'none') activeInventory = inventory});
    return activeInventory;
}

function moveItem(item){
    let clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent ('dblclick', true, true);
    item.dispatchEvent (clickEvent);
}

addFunctionBar();

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});