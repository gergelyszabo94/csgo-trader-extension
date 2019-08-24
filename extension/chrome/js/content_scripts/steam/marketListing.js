updateLoggedInUserID();

// the promise will be stored here temporarily
let itemsPromise = undefined;

//listens to the message events on the extension side of the communication
window.addEventListener('message', e => {
    if (e.data.type === 'items') {
        let assets = e.data.assets[730][2];
        let listings = e.data.listings;
        for (let listing in listings){
            let assetid = listings[listing].asset.id;

            for(let asset in assets){
                let stickers = parseStickerInfo(assets[asset].descriptions, 'search');

                if(assetid === assets[asset].id){
                    listings[listing].asset = assets[asset];
                    listings[listing].asset.stickers = stickers;
                }
            }
        }
        itemsPromise(listings);
        itemsPromise = undefined;
    }
});

//sends the message to the page side to get the info
const getItems = () =>{
    window.postMessage(
        {
            type: 'requestItems'
        },
        '*'
    );
    return new Promise(resolve => {
        itemsPromise = resolve;
    });
};

// this injected script listens to the messages from the extension side and responds with the page context info needed
let getItemsScript = `
    window.addEventListener('message', (e) => {
        if (e.data.type == 'requestItems') {
            window.postMessage({
                type: 'items',
                listings: g_rgListingInfo,
                assets: g_rgAssets
            }, '*');
        }
    });
    `;
injectToPage(getItemsScript, false, 'getItems', null);

const exteriorselement = `
    <div class="descriptor otherExteriors" id="otherExteriors">
        <span>${chrome.i18n.getMessage("links_to_other_exteriors")}:</span>
        <ul>
            <li><a href="" target="_blank" id="fnLink">${exteriors.factory_new.localized_name}</a> - <a href="" target="_blank" id="fnSTLink"><span class="stattrakOrange">StatTrak™ ${exteriors.factory_new.localized_name}</span></a></li>
            <li><a href="" target="_blank" id="mwLink">${exteriors.minimal_wear.localized_name}</a> - <a href="" target="_blank" id="mwSTLink"><span class="stattrakOrange">StatTrak™ ${exteriors.minimal_wear.localized_name}</span></a></li>
            <li><a href="" target="_blank" id="ftLink">${exteriors.field_tested.localized_name}</a> - <a href="" target="_blank" id="ftSTLink"><span class="stattrakOrange">StatTrak™ ${exteriors.field_tested.localized_name}</span></a></li>
            <li><a href="" target="_blank" id="wwLink">${exteriors.well_worn.localized_name}</a> - <a href="" target="_blank" id="wwSTLink"><span class="stattrakOrange">StatTrak™ ${exteriors.well_worn.localized_name}</span></a></li>
            <li><a href="" target="_blank" id="bsLink">${exteriors.battle_scarred.localized_name}</a> - <a href="" target="_blank" id="bsSTLink"><span class="stattrakOrange">StatTrak™ ${exteriors.battle_scarred.localized_name}</span></a></li>
        </ul>
        <span>${chrome.i18n.getMessage("not_every_available")}</span>
    </div>`;

const inBrowserInspectButton =`<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect_button" href="http://csgo.gallery/" target="_blank"><span>${chrome.i18n.getMessage("inspect_in_browser")}</span></a>`;
const inBrowserInspectButtonPopupLink = `<a class="popup_menu_item" id="inbrowser_inspect" href="http://csgo.gallery/" target="_blank">${chrome.i18n.getMessage("inspect_in_browser")}</a>`;
const getFloatInfoMenuItem = `<span class="popup_menu_item" id="get_float">${chrome.i18n.getMessage("get_float_info")}</span>`;


const dopplerPhase = "<div class='dopplerPhaseMarket'><span></span></div>";

let thereSouvenirForThisItem = souvenirExists($(".descriptor").text());

$("#largeiteminfo_item_descriptors").append(exteriorselement);

const genericMarketLink = "https://steamcommunity.com/market/listings/730/";
const stattrak = "StatTrak%E2%84%A2%20";
const souvenir = "Souvenir%20";
const fullName = decodeURIComponent(window.location.href).split("listings/730/")[1];
let weaponName = "";
let isSouvenir = false;
let star = "";


if(/★/.test(fullName)){
    star = "★ ";
}

if(/StatTrak™/.test(fullName)){
    weaponName = fullName.split("StatTrak™ ")[1].split("(")[0];
}
else if(/Souvenir/.test(fullName)){
    isSouvenir = true;
    weaponName = fullName.split("Souvenir ")[1].split("(")[0];
}
else {
    weaponName = fullName.split("(")[0].split("★ ")[1];
    if(weaponName===undefined){
        weaponName = fullName.split("(")[0];
    }
}

if(fullName.split("(")[1]===undefined){ // in case there is no exterior (vanilla)
    $("#otherExteriors").hide();
}

$("#fnLink").attr("href", genericMarketLink + star + weaponName + "(Factory New)");
$("#mwLink").attr("href", genericMarketLink + star + weaponName + "(Minimal Wear)");
$("#ftLink").attr("href", genericMarketLink + star + weaponName + "(Field-Tested)");
$("#wwLink").attr("href", genericMarketLink + star + weaponName + "(Well-Worn)");
$("#bsLink").attr("href", genericMarketLink + star + weaponName + "(Battle-Scarred)");

if(isSouvenir||thereSouvenirForThisItem){
    $st = $(".stattrakOrange");
    $st.addClass("souvenirYellow");
    $st.removeClass("stattrakOrange");

    $fnst=$("#fnSTLink");
    $fnst.attr("href", genericMarketLink + souvenir + weaponName + "(Factory New)");
    $fnst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + exteriors.factory_new.localized_name);

    $mwst=$("#mwSTLink");
    $mwst.attr("href", genericMarketLink + souvenir + weaponName + "(Minimal Wear)");
    $mwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + exteriors.minimal_wear.localized_name);

    $ftst=$("#ftSTLink");
    $ftst.attr("href", genericMarketLink + souvenir + weaponName + "(Field-Tested)");
    $ftst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + exteriors.field_tested.localized_name);

    $wwst=$("#wwSTLink");
    $wwst.attr("href", genericMarketLink + souvenir + weaponName + "(Well-Worn)");
    $wwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + exteriors.well_worn.localized_name);

    $bsst=$("#bsSTLink");
    $bsst.attr("href", genericMarketLink + souvenir + weaponName + "(Battle-Scarred)");
    $bsst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + exteriors.battle_scarred.localized_name);
}
else{
    $("#fnSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + `(${exteriors.factory_new.name})`);
    $("#mwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + `(${exteriors.minimal_wear.name})`);
    $("#ftSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + `(${exteriors.field_tested.name})`);
    $("#wwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + `(${exteriors.well_worn.name})`);
    $("#bsSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + `(${exteriors.battle_scarred.name})`);
}

$("#largeiteminfo_item_actions").append(inBrowserInspectButton);
$("#market_action_popup_itemactions").after(inBrowserInspectButtonPopupLink, getFloatInfoMenuItem);

let inspectLink = $("#largeiteminfo_item_actions").find(".btn_small.btn_grey_white_innerfade").first().attr("href");
$("#inbrowser_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);

$("#inbrowser_inspect").hover(function () {
    let inspectLink = $("#market_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
    $("#inbrowser_inspect").attr("href", "http://csgo.gallery/" + inspectLink);
});

$("#get_float").hover(function () {
    let inspectLink = $("#market_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
    let listingID = inspectLink.split("preview%20M")[1].split("A")[0];
    $("#get_float").attr({"data-listing-id": listingID, "inspect-link": inspectLink});
});


$("#get_float").click(function () {
    let listingID = $(this).attr("data-listing-id");
    let inspectLink = $(this).attr("inspect-link");

    $parentElement= $("#listing_"+listingID+"_name").parent();
    if($parentElement.attr("data-floatBar-added")){

    }
    else{
        chrome.runtime.sendMessage({getFloatInfo: inspectLink}, function(response) {
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

            let position = float.toFixed(2)*100-2;

            let floatBar = `
<div class="floatBarMarket">
    <div class="floatToolTip" style="left: ${position}%">
        <div>Float: <span id="float1DropTarget">${float.toFixed(4)}</span></div>
        <svg id="floatPointer" class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
 <div class="progress">
    <div class="progress-bar floatBarFN" title="${exteriors.factory_new.localized_name}"></div>
    <div class="progress-bar floatBarMW" title="${exteriors.minimal_wear.localized_name}"></div>
    <div class="progress-bar floatBarFT" title="${exteriors.field_tested.localized_name}"></div>
    <div class="progress-bar floatBarWW" title="${exteriors.well_worn.localized_name}"></div>
     <div class="progress-bar floatBarBS" title="${exteriors.battle_scarred.localized_name}"></div>
 </div>
  <div class="showTechnical">Show Technical</div>
 <div class="floatTechnical">
        Technical:<br>
        Float Value: ${float}<br>
        Paint Index: ${paintIndex}<br>
        Paint Seed: ${paintSeed}<br>
        Origin: ${origin}<br>
        Best Possible Float: ${min}<br>
        Worst Possible Float: ${max}<br>
        <br>
        Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>
</div>
</div>`;

            // //sticker wear to sticker icon tooltip
            // stickers.forEach(function (stickerInfo, index) {
            //     let wear = 100;
            //     if(stickerInfo.wear!==null){
            //         wear =  Math.trunc(stickerInfo.wear*100);
            //     }
            //     $currentSticker1 = $("#stickers1").find($(".stickerSlot")).eq(index);
            //     $currentSticker0 = $("#stickers0").find($(".stickerSlot")).eq(index);
            //     $currentSticker1.attr("data-tooltip", stickerInfo.name + " - Condition: " + wear + "%");
            //     $currentSticker0.attr("data-tooltip", stickerInfo.name + " - Condition: " + wear + "%");
            //     $currentSticker1.find("img").css("opacity", wear/100);
            //     $currentSticker0.find("img").css("opacity", wear/100);
            // });
            //

            if(float===0){
                $parentElement.append("<div>Could not get Float from csgofloat.com</div>");
            }
            else{
                $parentElement.attr("data-floatBar-added", true);
                $parentElement.append(floatBar);
            }


            $(".showTechnical").click(function () {
                $(".floatTechnical").toggle();
            });
        });
    }
});

addPhasesIndicator();
addStickers();

let observer = new MutationObserver(function(mutations, observer) {
    for(var mutation of mutations) {
        if (mutation.target.id === 'searchResultsRows') {
            addPhasesIndicator();
            addStickers();
        }
    }
});

if($("#searchResultsRows").length!==0){
    observer.observe(document.getElementById("searchResultsRows"), {
        subtree: true,
        attributes: false,
        childList: true
    });
}

chrome.storage.local.get(['numberOfListings'], function(result) {
    if(result.numberOfListings!==10){
        $("body").append(`<script>g_oSearchResults.m_cPageSize = ${result.numberOfListings}; g_oSearchResults.GoToPage(0, true);</script>`);
    }
});


function addPhasesIndicator(){
    if(/Doppler/.test(window.location.href)) {
        $(".market_listing_item_img_container").each(function () {
            $container = $(this);
            $container.append(dopplerPhase);

            let phase = getDopplerInfo($(this).find("img").attr("src").split("economy/image/")[1].split("/")[0]);

            if (phase.short === "SH") {
                $container.find(".dopplerPhaseMarket").append(sapphire);
            }
            else if (phase.short === "RB") {
                $container.find(".dopplerPhaseMarket").append(ruby);
            }
            else if (phase.short === "EM") {
                $container.find(".dopplerPhaseMarket").append(emerald);
            }
            else if (phase.short === "BP") {
                $container.find(".dopplerPhaseMarket").append(blackPearl);
            }
            else {
                $container.find(".dopplerPhaseMarket").find("span").text(phase.short);
            }
        });
    }
}

function addStickers() {
    //remove sih sticker info
    $(".sih-images").remove();

    getItems().then(listings => {
        $(".market_listing_row.market_recent_listing_row").each(function () {
            if(!($(this).parent().attr("id")==="tabContentsMyActiveMarketListingsRows")){
                let listingID = $(this).attr("id").split("listing_")[1];
                $(this).find(".market_listing_item_name_block").append(`<div class="stickerHolderMarket" id="stickerHolder_${listingID}"></div>`);
                let stickers = listings[listingID].asset.stickers;

                stickers.forEach(function (stickerInfo) {
                    $("#stickerHolder_" + listingID).append(`<span class="stickerSlotMarket" data-tooltip-market="${stickerInfo.name}"><a href="${stickerInfo.marketURL}" target="_blank"><img src="${stickerInfo.iconURL}" class="stickerIcon"></a></span>`);
                })
            }
        });
    });
}

//reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(function() {
    location.reload();
});
