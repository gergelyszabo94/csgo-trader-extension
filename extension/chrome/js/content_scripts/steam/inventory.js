overridePopulateActions();

updateLoggedInUserID();

const upperModule = `
<div class="upperModule">
    <div class="nametag"></div>
    <div class="descriptor customStickers"></div>
    <div class="duplicate">x1</div>
    <div class="floatBar">
    <div class="floatToolTip">
        <div>Float: <span class="floatDropTarget">Waiting for csgofloat.com</span></div>
        <svg class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
     <div class="progress">
        <div class="progress-bar floatBarFN" title="Factory New"></div>
        <div class="progress-bar floatBarMW" title="Minimal Wear"></div>
        <div class="progress-bar floatBarFT" title="Field-Tested"></div>
        <div class="progress-bar floatBarWW" title="Well-Worn"></div>
         <div class="progress-bar floatBarBS" title="Battle-Scarred"></div>
     </div>
      <div class="showTechnical">Show Technical</div>
    </div>
    <div class="patternInfo"></div>
</div>
`;

const lowerModule = `<a class="lowerModule">
    <div class="descriptor tradability tradabilityDiv"></div>
    <div class="descriptor countdown"></div>
    <div class="descriptor tradability bookmark">Bookmark and Notify</div>
</a>`;

// const note0 = `<div class="descriptor note" id="note0"></div>`;
// const note1 = `<div class="descriptor note" id="note1"></div>`;

const tradable = "<span class='tradable'>Tradable</span>";
const notTradable = "<span class='not_tradable'>Not Tradable</span>";
const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

// the promise will be stored here temporarily
let inventoryPromise = undefined;

//listens to the message events on the extension side of the communication
window.addEventListener('message', e => {
    if (e.data.type === 'inventory') {
        inventoryPromise(e.data);
        inventoryPromise = undefined;
    }
    else if (e.data.type === 'allItemsLoaded') {
        if(e.data.allItemsLoaded){
            doInitSorting();
        }
        else{
            loadFullInventory();
        }
    }
});

//sends the message to the page side to get the info
const getInventory = function() {
    window.postMessage(
        {
            type: 'requestInventory'
        },
        '*'
    );
    return new Promise(resolve => {
        inventoryPromise = resolve;
    });
};

//this injected script listens to the messages from the extension side and responds with the page context info needed
let getItems = `
    window.addEventListener('message', (e) => {
        if (e.data.type == 'requestInventory') {
            let inventory = UserYou.getInventory(730,2);
            let assets = inventory.m_rgAssets;
            let assetKeys= Object.keys(assets);
            let trimmedAssets = [];
            
            for(let assetKey of assetKeys){
                let asset = {
                    amount: assets[assetKey].amount,
                    assetid: assets[assetKey].assetid,
                    contextid: assets[assetKey].contextid,
                    description: assets[assetKey].description
                };
                trimmedAssets.push(asset);
            }
            window.postMessage({
                type: 'inventory',
                inventory: trimmedAssets
            }, '*');
        }
    });`;
injectToPage(getItems, false, "getItems");

//mutation observer observes changes on the right side of the inventory interface, this is a workaround for waiting for ajax calls to finish when the page changes
MutationObserver = window.MutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    if($(".games_list_tab.active").first().attr("href")==="#730"){
        addElements();
        addFunctionBar();
    }
    else{
        cleanUpElements(true);
    }
});

let observer2 = new MutationObserver(function(mutations, observer) {
    addPerItemInfo(false);
});

//does not execute if inventory is private or failed to load the page (502 for example, mostly when steam is dead)
if($("#no_inventories").length!==1&&$("#iteminfo0").length!==0){
    observer.observe(document.getElementById("iteminfo0"), {
        subtree: false,
        attributes: true
    });

    observer2.observe(document.getElementById("inventories"),{
        subtree: false,
        attributes: true
    });
}

chrome.storage.local.get('hideOtherExtensionPrices', function(result) {
    if(result.hideOtherExtensionPrices){
        hideOtherExtensionPrices();
    }
});

// sends a message to the "back end" to request inventory contents

let items = [];

function requestInventory(){
    chrome.runtime.sendMessage({inventory: getInventoryOwnerID()}, function(response) {
        if(!(response===undefined||response.inventory===undefined||response.inventory===""||response.inventory==="error")){
            items = response.inventory;
            addElements();
            addPerItemInfo();
            setInventoryTotal(items);
            addClickListener();
            addFunctionBar();
            loadFullInventory();
        }
        else{
            console.log("Wasn't able to get the inventory, it's most likely steam not working properly or you loading inventory pages at the same time");
            console.log("Retrying in 30 seconds");
            setTimeout(function () {
                requestInventory();
            }, 30000);

        }
    });
}
requestInventory();

// to refresh the trade lock remaining indicators
setInterval(() =>{if(!document.hidden) addPerItemInfo(true)}, 60000); // true means it's only for updating the time remaining indicators

//adds everything that is per item, like trade lock, exterior, doppler phases, border colors
function addPerItemInfo(updating){
    $(".slot_app_fraudwarning").css({"top":"19px", "left":"75px"});
    $items = $(".item.app730.context2");
    if($items.length!==0){
        chrome.storage.local.get(['colorfulItems'], function(result) {
            $items.each(function () {
                $item = $(this);
                if($item.attr("data-processed")===undefined||$item.attr("data-processed")==="false"||updating){
                    if($item.attr('id')===undefined){ //in case the inventory is not loaded yet
                        setTimeout(function () {
                            addPerItemInfo(false);
                        }, 1000);
                        return false;
                    }
                    else{
                        let assetID = $item.attr('id').split("730_2_")[1]; //gets the assetid of the item from the html
                        let item = getItemByAssetID(assetID); //matches it with the info from the api call

                        if(updating){
                            $itemDate = $item.find($(".perItemDate"));
                            let tradableShort = getShortDate(item.tradability);
                            if(tradableShort==="T"){
                                $itemDate.removeClass("not_tradable");
                                $itemDate.addClass("tradable");
                                $itemDate.text("T");
                            }
                            else{
                                $itemDate.removeClass("tradable");
                                $itemDate.addClass("not_tradable");
                                $itemDate.text(tradableShort);
                            }
                        }
                        else{
                            if(item.tradability==="Tradable"){
                                $item.append(`<div class='perItemDate tradable'>T</div>`);
                            }
                            else if(item.tradability!=="Not Tradable"){
                                $item.append(`<div class='perItemDate not_tradable'>${item.tradabilityShort}</div>`);
                            }

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

                            if(item.exterior!==undefined){
                                $item.append(`<div class='exteriorSTInfo'><span class="souvenirYellow">${souvenir}</span><span class="stattrakOrange">${stattrak}</span><span class="exteriorIndicator">${item.exterior.localized_short}</span></div>`);
                            }

                            if(item.price!==undefined && item.price !== "null"){
                                $item.append(`<div class='priceIndicator'>${item.price.display}</div>`);
                            }

                            $(this).attr("data-processed", true);
                        }
                    }
                }
            });
        });
    }
    else{ //in case the inventory is not loaded yet
        setTimeout(function () {
            addPerItemInfo(false);
        }, 1000);
    }
}

//variables for the countdown recursive logic
let countingDown = false;
let countDownID = "";

function addElements(){
    // only add elements if the CS:GO inventory is the active one
    if(document.querySelector(".games_list_tab.active").getAttribute("href") === "#730"){
        let activeID = undefined;
        try {activeID = getAssetIDofActive()}
        catch (e) { console.log("Could not get assetID of active item"); return false}
        let item = getItemByAssetID(activeID);

        // removes "tags" and "tradable after" in one's own inventory
        document.querySelectorAll("#iteminfo1_item_tags, #iteminfo0_item_tags, #iteminfo1_item_owner_descriptors, #iteminfo0_item_owner_descriptors").forEach((tagsElement) => tagsElement.parentNode.removeChild(tagsElement));

        // cleans up previously added elements
        cleanUpElements(false);

        // removes previously added listeners
        document.querySelectorAll(".showTechnical").forEach(showTechnical => showTechnical.removeEventListener("click"));

        // adds float bar, sticker info, nametag
        document.querySelectorAll(".item_desc_icon").forEach((icon) =>{icon.insertAdjacentHTML("afterend", upperModule)});

        // listens to click on "show technical"
        document.querySelectorAll(".showTechnical").forEach(showTechnical => {
            showTechnical.addEventListener("click", event =>{
                document.querySelectorAll(".floatTechnical").forEach(floatTechnical => floatTechnical.classList.toggle("hidden"));
            })
        });

        // allows the float pointer's text to go outside the boundaries of the item - they would not be visible otherwise on high-float items
        // also removes background from the right side of the page
        document.querySelectorAll(".item_desc_content").forEach((item_desc_content) => item_desc_content.setAttribute("style", "overflow: visible; background-image: url()"));

        // adds the lower module that includes tradability, countdown  and bookmarking
        document.querySelectorAll("#iteminfo1_item_actions, #iteminfo0_item_actions").forEach((action) => action.insertAdjacentHTML("afterend", lowerModule));

        if(item){
            // adds the nametag text to nametags
            document.querySelectorAll(".nametag").forEach((nametag) =>{
                if(item.nametag !== undefined){
                    nametag.innerText = item.nametag;
                    document.querySelectorAll(".fraud_warning").forEach((fraud_warning) => fraud_warning.outerHTML = "");
                }
                else{
                    nametag.style.display = "none";
                }
            });

            // repositions stickers
            if(item.stickers.length !== 0){
                // removes the original stickers elements
                let originalStickers = document.getElementById("sticker_info");
                if(originalStickers !== null) originalStickers.outerHTML = "";

                // sometimes it is added slowly so it does not get removed the first time..
                setTimeout(() =>{if(originalStickers !== null && originalStickers.parentNode !== null) originalStickers.outerHTML = ""}, 1000);

                // adds own sticker elements
                item.stickers.forEach((stickerInfo) =>{
                    document.querySelectorAll(".customStickers").forEach((customStickers) =>{
                        customStickers.innerHTML = customStickers.innerHTML + `
                        <div class="stickerSlot" data-tooltip="${stickerInfo.name}">
                            <a href="${stickerInfo.marketURL}" target="_blank">
                                <img src="${stickerInfo.iconURL}" class="stickerIcon">
                            </a>
                        </div>
                        `
                    });
                })
            }

            // adds duplicates counts
            document.querySelectorAll(".duplicate").forEach (duplicate => {
                duplicate.style.display = "block";
                duplicate.innerText = "x" + item.duplicates.num;
            });

            // sets the tradability info
            document.querySelectorAll(".tradabilityDiv").forEach (tradabilityDiv => {
                if(item.tradability === "Tradable"){
                    tradabilityDiv.innerHTML = tradable;
                    document.querySelectorAll(".countdown").forEach((countdown) => countdown.style.display = "none");
                }
                else if(item.tradability === "Not Tradable"){
                    tradabilityDiv.innerHTML = notTradable;
                    document.querySelectorAll(".countdown").forEach((countdown) => countdown.style.display = "none");
                }
                else{
                    let tradableAt = new Date(item.tradability).toString().split("GMT")[0];
                    tradabilityDiv.innerHTML = `<span class='not_tradable'>Tradable After ${tradableAt}</span>`;
                    countDown(tradableAt);
                    document.querySelectorAll(".countdown").forEach((countdown) => countdown.style.display = "block");
                }
            });


            // adds doppler phase  to the name and makes it a link to the market listings page
            let name = item.name;

            getInventory().then(inventory => {
                inventory.inventory.forEach((onPageItem) => {if(onPageItem.assetid === activeID) name = onPageItem.description.name});
                if(item.dopplerInfo !== undefined){changeName(name + " ("+ item.dopplerInfo.name+")", item.name_color, item.marketlink);}
                else{ changeName(name, item.name_color, item.marketlink)}
            });

            // removes sih "Get Float" button - does not really work since it's loaded after this script..
            if(isSIHActive()){
                document.querySelectorAll(".float_block").forEach(e => e.parentNode.removeChild(e));
                setTimeout(() =>{document.querySelectorAll(".float_block").forEach(e => e.parentNode.removeChild(e));}, 1000);
            }

            let inspectLink = item.inspectLink;
            let float = "";
            let paintIndex = "";
            let paintSeed = "";
            let origin = "";
            let min = "";
            let max = "";
            let stickers = [];

            if(inspectLink !== "" && inspectLink !== undefined){
                chrome.runtime.sendMessage({getFloatInfo: inspectLink}, (response) =>{
                    try{
                        float = response.floatInfo.floatvalue;
                        paintIndex = response.floatInfo.paintindex;
                        paintSeed = response.floatInfo.paintseed;
                        origin = response.floatInfo.origin_name;
                        min = response.floatInfo.min;
                        max = response.floatInfo.max;
                        stickers = response.floatInfo.stickers;

                    }
                    catch{

                    }

                    let floatTechnical = `
                        <div class="floatTechnical hidden">
                            Technical:<br>
                            Float Value: ${float}<br>
                            Paint Index: ${paintIndex}<br>
                            Paint Seed: ${paintSeed}<br>
                            Origin: ${origin}<br>
                            Best Possible Float: ${min}<br>
                            Worst Possible Float: ${max}<br>
                            <br>
                            Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>
                        </div>`;

                    document.querySelectorAll(".showTechnical").forEach (showTechnical => showTechnical.insertAdjacentHTML("afterend", floatTechnical));

                    let patternInfo =  getPattern(item.market_hash_name, paintSeed);
                    let position = float.toFixed(2)*100-2;
                    document.querySelectorAll(".floatToolTip").forEach(floatToolTip => floatToolTip.setAttribute("style", `left: ${position}%`));
                    document.querySelectorAll(".floatDropTarget").forEach(floatDropTarget => floatDropTarget.innerText = float.toFixed(4));

                    document.querySelectorAll(".patternInfo").forEach(patternInfoElement => {
                        if(patternInfo !== undefined){
                            if(patternInfo.type === "fade"){
                                patternInfoElement.classList.add("fadeGradient");
                            }
                            else if(patternInfo.type === "marble_fade"){
                                patternInfoElement.classList.add("marbleFadeGradient");
                            }
                            else if(patternInfo.type === "case_hardened"){
                                patternInfoElement.classList.add("caseHardenedGradient");
                            }
                            patternInfoElement.innerText = "Pattern: " + patternInfo.value;
                        }
                    });

                    // sticker wear to sticker icon tooltip
                    stickers.forEach((stickerInfo, index) =>{
                        let wear = 100;
                        if(stickerInfo.wear !== undefined){
                            wear =  Math.trunc(Math.abs( 1 - stickerInfo.wear) * 100);
                        }
                        document.querySelectorAll(".customStickers").forEach(customStickers => {
                            let currentSticker = customStickers.querySelectorAll(".stickerSlot")[index];
                            currentSticker.setAttribute("data-tooltip", stickerInfo.name + " - Condition: " + wear + "%");
                            currentSticker.querySelector("img").setAttribute("style", `opacity: ${(wear > 10) ? wear/100 : (wear/100) + 0.1}`);
                        });
                    });

                    if(float===0){
                        document.querySelectorAll(".floatBar").forEach(floatBar => floatBar.classList.add("hidden"));
                    }
                });
            }
            else{
                document.querySelectorAll(".floatBar").forEach(floatBar => floatBar.classList.add("hidden"));
            }

            // it takes the visible descriptors and checks if the collection includes souvenirs
            let textOfDescriptors = '';
            document.querySelectorAll('.descriptor').forEach(descriptor => {
                if(descriptor.parentNode.classList.contains('item_desc_descriptors') && descriptor.parentNode.parentNode.parentNode.parentNode.style.display !== 'none'){
                    textOfDescriptors += descriptor.innerText;
                }

            });
            let thereSouvenirForThisItem =  souvenirExists(textOfDescriptors);

            let genericMarketLink = 'https://steamcommunity.com/market/listings/730/';
            let weaponName = '';
            let stattrak = 'StatTrak%E2%84%A2%20';
            let stattrakPretty = 'StatTrak™';
            let souvenir = 'Souvenir ';
            let star = '';

            if(item.starInName){
                star = '%E2%98%85%20';
            }

            if(item.isStatrack){
                weaponName = item.market_hash_name.split("StatTrak™ ")[1].split("(")[0];
            }
            else if(item.isSouvenir){
                weaponName = item.market_hash_name.split("Souvenir ")[1].split("(")[0];
            }
            else{
                weaponName = item.market_hash_name.split("(")[0].split("★ ")[1];
                if(weaponName===undefined){
                    weaponName = item.market_hash_name.split("(")[0];
                }
            }

            let stOrSv = stattrakPretty;
            let stOrSvClass = "stattrakOrange";
            let linkMidPart = star + stattrak;
            if(item.isSouvenir||thereSouvenirForThisItem){
                stOrSvClass = "souvenirYellow";
                stOrSv = souvenir;
                linkMidPart = souvenir;
            }

            let otherExteriors = `
            <div class="descriptor otherExteriors">
                <span>${chrome.i18n.getMessage("links_to_other_exteriors")}:</span>
                <ul>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Factory%20New%29"}" target="_blank">${exteriors.factory_new.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Factory%20New%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.factory_new.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Minimal%20Wear%29"}"" target="_blank">${exteriors.minimal_wear.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Minimal%20Wear%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.minimal_wear.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Field-Tested%29"}"" target="_blank">${exteriors.field_tested.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Field-Tested%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.field_tested.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Well-Worn%29"}"" target="_blank">${exteriors.well_worn.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Well-Worn%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.well_worn.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Battle-Scarred%29"}"" target="_blank">${exteriors.battle_scarred.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Battle-Scarred%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.battle_scarred.localized_name}</span></a></li>
                </ul>
                <span>${chrome.i18n.getMessage("not_every_available")}</span>
            </div>
            `;

            if(item.exterior !== undefined){
                document.querySelectorAll("#iteminfo1_item_descriptors, #iteminfo0_item_descriptors").forEach((descriptor) => descriptor.insertAdjacentHTML("afterend", otherExteriors));
            }
        }
    }
    else{
        document.querySelectorAll(".countdown").forEach((countdown) => countdown.style.display = "none");
    }
}


function cleanUpElements(nonCSGOInventory) {
    document.querySelectorAll(".upperModule, .lowerModule, .otherExteriors, .custom_name").forEach((element) => element.parentNode.removeChild(element));
    if(nonCSGOInventory) document.querySelectorAll(".hover_item_name").forEach((name) => name.classList.remove("hidden"));
}

// gets the asset id of the item that is currently selected
function getAssetIDofActive() {return getAssetIDOfElement(document.querySelector(".activeInfo"))}

// gets the details of an item by matching the passed asset id with the ones from the api call
function getItemByAssetID(assetidToFind){
    if (items === undefined || items.length === 0) return false;
    return $.grep(items, function(e){ return e.assetid === assetidToFind; })[0];
}

function countDown(dateToCountDownTo){
    if(!countingDown){
        countingDown = true;
        countDownID = setInterval(() =>{
            document.querySelectorAll(".countdown").forEach((countdown) => {
                let now = new Date().getTime();
                let distance = new Date(dateToCountDownTo) - now;
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdown.innerText = days + "d " + hours + "h " + minutes + "m " + seconds + "s " + "remains";

                if (distance < 0) {
                    clearInterval(countDownID);
                    countdown.style.display = "none";
                    document.querySelectorAll(".tradabilityDiv").forEach (tradabilityDiv => {
                        tradabilityDiv.innerText = "Tradable";
                        tradabilityDiv.classList.add("tradable");
                    });

                }
            });
        }, 1000);
    }
    else{
        clearInterval(countDownID);
        countingDown = false;
        countDown(dateToCountDownTo);
    }
}

// function addNote(note){
//     if(!$("#note1").length) {
//         $("#iteminfo1_item_descriptors").before(note1);
//     }
//     if(!$("#note0").length) {
//         $("#iteminfo0_item_descriptors").before(note0);
//     }
//     $("#note1").text("Note: " + note);
//     $("#note0").text("Note: " + note);
// }
//
// function removeNote(){
//     $("#note1").remove();
//     $("#note0").remove();
// }

function changeName(name, color, link){
    let newNameElement = `<a class="hover_item_name custom_name" style="color: ${color}" href="${link}" target="_blank">${name}</a>`;

    document.querySelectorAll(".hover_item_name").forEach((name) => {
        name.insertAdjacentHTML("afterend", newNameElement);
        name.classList.add("hidden");
    });
}

function addClickListener(){
    $(".lowerModule").click(function () {
        $module = $(this);
        let bookmark = {
            itemInfo: getItemByAssetID(getAssetIDofActive()),
            owner: getInventoryOwnerID(),
            comment: " ",
            notify: true,
            notifTime: getItemByAssetID(getAssetIDofActive()).tradability.toString(),
            notifType: "chrome"
        };
        chrome.storage.local.get('bookmarks', function(result) {
            let bookmarks = result.bookmarks;
            bookmarks.push(bookmark);
            chrome.storage.local.set({'bookmarks': bookmarks}, function() {
                if(bookmark.itemInfo.tradability!=="Tradable"){
                    chrome.runtime.sendMessage({setAlarm: {name:  bookmark.itemInfo.assetid, when: bookmark.itemInfo.tradability}}, function(response) {});
                }
                chrome.runtime.sendMessage({openInternalPage: "/html/bookmarks.html"}, function(response) {
                    if(response.openInternalPage==="no_tabs_api_access"){
                        $module.find($(".descriptor.tradability.bookmark")).text("Bookmarked! Open the bookmarks menu to see what you have saved!");
                    }
                });
            });
        });
    });

    let sihSort = document.getElementById("Lnk_SortItems");
    if(isSIHActive() && sihSort !== null){
        sihSort.addEventListener("click", function () {
            addPerItemInfo(false);
        })
    }
}

function hideOtherExtensionPrices(){
    if(!document.hidden && isSIHActive()){
        //sih
        document.querySelectorAll(".price_flag").forEach((price)=>{
            price.remove();
        });
    }
    setTimeout(() =>{hideOtherExtensionPrices()}, 2000);
}

function setInventoryTotal(items){
    let inventoryTotalValueElement = document.getElementById("inventoryTotalValue");
    chrome.runtime.sendMessage({inventoryTotal: items}, (response) =>{
        if(!(response===undefined||response.inventoryTotal===undefined||response.inventoryTotal===""||response.inventoryTotal==="error"||inventoryTotalValueElement===null)){
            inventoryTotalValueElement.innerText = response.inventoryTotal;
        }
        else setTimeout(() =>{setInventoryTotal(items)}, 1000)
    });
}

let listenSelectClicks = function (event){
    if (event.target.parentElement.classList.contains('item') && event.target.parentElement.classList.contains('app730') && event.target.parentElement.classList.contains('context2')) {
        event.target.parentElement.classList.toggle("selected");
        updateSelectedValue();
    }
};

function addFunctionBar(){
    if(document.getElementById("inventory_function_bar") === null){
        let hand_pointer = chrome.runtime.getURL("images/hand-pointer-solid.svg");
        document.querySelector(".filter_ctn.inventory_filters").insertAdjacentHTML('afterend', `
                <div id="inventory_function_bar">
                    <div id="functionBarValues" class="functionBarRow">
                        <span id="selectedTotal"><span>Selected Items Value: </span><span id="selectedTotalValue">0.00</span></span>
                        <span id="inventoryTotal"><span>Total Inventory Value: </span><span id="inventoryTotalValue">0.00</span></span>
                    </div>
                    <div id="functionBarActions" class="functionBarRow">
                        <span id="selectMenu">
                            <img id ="selectButton" src="${hand_pointer}">
                        </span>
                        <div id="sortingMenu">
                            <span>Sorting:</span>
                            <select id="sortingMethod">
                            </select>
                        </div>
                    </div>
                </div>
                `);

        let sortingSelect = document.getElementById("sortingMethod");

        let keys = Object.keys(sortingModes);
        for (let key of keys){
            let option = document.createElement("option");
            option.value = sortingModes[key].key;
            option.text = sortingModes[key].name;
            sortingSelect.add(option);
        }

        document.getElementById("selectButton").addEventListener("click", function (event) {
            if(event.target.classList.contains("selectionActive")){
                unselectAllItems();
                updateSelectedValue();
                event.target.classList.remove("selectionActive");
                document.body.removeEventListener('click', listenSelectClicks, false);
            }
            else{
                document.body.addEventListener('click', listenSelectClicks, false);
                event.target.classList.add("selectionActive");
            }
        });

        sortingSelect.addEventListener("change", function () {
            let selected = sortingSelect.options[sortingSelect.selectedIndex].value;
            sortItems(selected);
        });
    }
    else{
        setTimeout(function () {
            setInventoryTotal(items);
        }, 1000);
    }
}

function updateSelectedValue(){
    let selectedItems = document.querySelectorAll(".item.app730.context2.selected");
    let selectedTotal = 0;
    selectedItems.forEach(itemelement =>{
        let assetID = getAssetIDOfElement(itemelement);
        let item = getItemByAssetID(assetID);
        selectedTotal += parseFloat(item.price.price);
    });
    chrome.storage.local.get('currency', (result) =>{
        document.getElementById("selectedTotalValue").innerText = prettyPrintPrice(result.currency, selectedTotal);
    });
}

function unselectAllItems() {
    let items = document.querySelectorAll(".item.app730.context2");
    items.forEach(item =>{
        item.classList.remove("selected");
    })
}

function sortItems(method) {
    let items = document.querySelectorAll(".item.app730.context2");
    let inventoryPages = document.getElementById("inventories").querySelectorAll(".inventory_page");
    doTheSorting(items, method, Array.from(inventoryPages), "inventory");
    addPerItemInfo(false);
}

function loadFullInventory() {
    if(!isSIHActive()){
        let loadFullInventory = `
        g_ActiveInventory.LoadCompleteInventory().done(function () {
            for (let i = 0; i < g_ActiveInventory.m_cPages; i++) {
                g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated();
                g_ActiveInventory.PreloadPageImages(i);
            }
            window.postMessage({
                type: 'allItemsLoaded',
                allItemsLoaded: true
            }, '*');
        });`;
        injectToPage(loadFullInventory, true, "loadFullInventory");
    }
    else{
        doInitSorting();
    }
}

function doInitSorting() {
    chrome.storage.local.get('inventorySortingMode', function(result) {
        sortItems(result.inventorySortingMode);
        document.querySelector('#sortingMethod [value="' + result.inventorySortingMode + '"]').selected = true;
    });
}

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});
