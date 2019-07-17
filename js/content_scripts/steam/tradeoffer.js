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
let inventoryAccessScript = `<script id="getItems">
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
    });
</script>`;
$("body").append(inventoryAccessScript);

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
            });

        });
    }
}

//adds "get float value" action item
overrideHandleTradeActionMenu();

chrome.storage.local.get(['markScammers'], function(result) {
    if(result.markScammers){
        warnOfScammer(getTradePartnerSteamID(), "offer");
    }
});

//this script gets injected, it allows communication between the page context and the content script initiated on the page
//when the function is called it dispatches a an event that we listen to from the content script
let scriptToInject = `
    <script id="sendMessageToContentScript">
    function sendMessageToContentScript(message){
        let event = new CustomEvent("message", { "detail": message });
        document.dispatchEvent(event);
    }
</script>`;
$("body").append(scriptToInject);

setInterval(function () {
    removeSIHStuff();
}, 2000);

$(".inventory_user_tab").click(function () {
   addItemInfo();
});

document.addEventListener("message", function(e) {
    addFloatIndicator(e.detail);
});

function addFloatIndicator(inspectLink) {
    chrome.runtime.sendMessage({getFloatInfo: inspectLink}, function(response) {
        let float ="Waiting for csgofloat.com";
        try{
            float = response.floatInfo.floatvalue;
        }
        catch{

        }
        let itemToAddFloatTo = findElementByAssetID(inspectLink.split("A")[1].split("D")[0]);
        itemToAddFloatTo.append(`<span class='floatIndicator'>${float.toFixed(4)}</span>`);
    });
}

function findElementByAssetID(assetid){
    let elementid = "item730_2_" + assetid;
    return $("#" + elementid);
}

function addItemInfo() {
    $(".slot_app_fraudwarning").css({"top":"19px", "left":"75px"});
    $items = $(".item.app730.context2");
    removeSIHStuff();
    if($items.length!==0){
        chrome.storage.local.get(['colorfulItems'], function(result) {
            $items.each(function () {
                $item = $(this);
                if($item.attr("data-processed")===undefined||$item.attr("data-processed")==="false"){
                    if($item.attr('id')===undefined){ //in case the inventory is not loaded yet
                        setTimeout(function () {
                            addPerItemInfo(false);
                        }, 1000);
                        return false;
                    }
                    else{
                        let assetID = $item.attr('id').split("730_2_")[1]; //gets the assetid of the item from the html
                        let item = getItemByAssetID(assetID); //matches it with the info from the page variables


                        addDopplerPhase($item, item.dopplerInfo);
                        if(result.colorfulItems){
                            if(item.dopplerInfo!==undefined){
                                $item.css({"border-color": "#"+item.dopplerInfo.color, "background-image": "url()", "background-color": "#"+item.dopplerInfo.color});
                            }
                            else{
                                $item.css({"border-color": item.quality.backgroundcolor, "background-image": "url()", "background-color": item.quality.backgroundcolor});
                            }
                        }

                        let stattrak = "";
                        if(item.isStatrack){
                            stattrak = "ST";
                        }
                        let souvenir = "";
                        if(item.isSouvenir){
                            souvenir = "S";
                        }

                        let exterior = "";
                        if(item.exterior!==undefined){
                            exterior = item.exterior.localized_short;
                        }

                        $item.append(`<div class='exteriorSTInfo'><span class="souvenirYellow">${souvenir}</span><span class="stattrakOrange">${stattrak}</span><span class="exteriorIndicator">${exterior}</span></div>`);

                        if(item.price!==undefined && item.price !== "null"){
                            $item.append(`<div class='priceIndicator'>${item.price.display}</div>`);
                        }

                        $(this).attr("data-processed", true);
                    }
                }
            });
        });
    }
    else{ //in case the inventory is not loaded yet
        setTimeout(function () {
            addItemInfo();
        }, 1000);
    }
}

function buildInventoryStructure(inventory) {
    let inventoryArrayToReturn = [];
    let duplicates = {};

    inventory.forEach(function (item) {
        let market_hash_name = item.market_hash_name;
        if(duplicates[market_hash_name]===undefined){
            let instances = [item.assetid];
            duplicates[market_hash_name] =
                {
                    num: 1,
                    instances: instances
                }
        }
        else{
            duplicates[market_hash_name].num=duplicates[market_hash_name].num+1;
            duplicates[market_hash_name].instances.push(item.assetid);
        }
    });

    inventory.forEach(function (item) {
        let exterior = getExteriorFromTags(item.tags);
        let marketlink = "https://steamcommunity.com/market/listings/730/" + item.market_hash_name;
        let quality = getQualityFromTags(item.tags);
        let stickers =  parseStickerInfo(item.descriptions, "direct");
        let nametag = undefined;
        let inspectLink ="";
        let dopplerInfo = undefined;
        let isStatrack = false;
        let isSouvenir = false;
        let starInName = false;

        try {
            if(item.fraudwarnings!==undefined||item.fraudwarnings[0]!==undefined){
                nametag = item.fraudwarnings[0].split("Name Tag: ''")[1].split("''")[0];
            }
        }
        catch(error) {
        }

        if(/Doppler/.test(item.name)){
            dopplerInfo = getDopplerInfo(item.icon);
        }
        if(/StatTrak™/.test(item.name)){
            isStatrack = true;
        }
        if(/Souvenir/.test(item.name)){
            isSouvenir = true;
        }
        if(/★/.test(item.name)){
            starInName = true;
        }
        try {
            if(item.actions!==undefined&&item.actions[0]!==undefined){
                let beggining = item.actions[0].link.split('%20S')[0];
                let end = item.actions[0].link.split('%assetid%')[1];
                inspectLink = (beggining + "%20S"+item.owner + "A"+ item.assetid + end);
            }
        }
        catch(error) {
        }

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
            owner: item.owner
        })
    });

    function compare(a, b) {
        return a.position - b.position;
    }

    inventoryArrayToReturn.sort(compare);

    return inventoryArrayToReturn;
}

//gets the details of an item by matching the passed asset id with the ones from page variables
function getItemByAssetID(assetidToFind){
    if (combinedInventories === undefined || combinedInventories.length === 0) {
        return false
    }
    return $.grep(combinedInventories, function(e){ return e.assetid === assetidToFind; })[0];
}

function removeSIHStuff() {
    $(".des-tag").remove();
    $(".p-price").remove();
}

function addInventoryTotals(yourInventory, theirInventory){
    chrome.runtime.sendMessage({inventoryTotal: yourInventory}, function(response) {
        if(!(response===undefined||response.inventoryTotal===undefined||response.inventoryTotal===""||response.inventoryTotal==="error")){
            let yourInventoryTitleDiv = document.getElementById("inventory_select_your_inventory").querySelector("div");
            yourInventoryTitleDiv.style.fontSize = "16px";
            yourInventoryTitleDiv.innerText = yourInventoryTitleDiv.innerText + " (" + response.inventoryTotal + ")";
        }
    });
    chrome.runtime.sendMessage({inventoryTotal: theirInventory}, function(response) {
        if(!(response===undefined||response.inventoryTotal===undefined||response.inventoryTotal===""||response.inventoryTotal==="error")){
            let theirInventoryTitleDiv = document.getElementById("inventory_select_their_inventory").querySelector("div");
            theirInventoryTitleDiv.style.fontSize = "16px";
            theirInventoryTitleDiv.innerText = theirInventoryTitleDiv.innerText + " (" + response.inventoryTotal + ")";
        }
    });
}