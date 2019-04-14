const exteriors = `
    <div class="descriptor otherExteriors" id="otherExteriors">
        <span>${chrome.i18n.getMessage("links_to_other_exteriors")}:</span>
        <ul>
            <li><a href="" target="_blank" id="fnLink">${chrome.i18n.getMessage("fn_long")}</a> - <a href="" target="_blank" id="fnSTLink"><span class="stattrakOrange">StatTrak™ ${chrome.i18n.getMessage("fn_long")}</span></a></li>
            <li><a href="" target="_blank" id="mwLink">${chrome.i18n.getMessage("mw_long")}</a> - <a href="" target="_blank" id="mwSTLink"><span class="stattrakOrange">StatTrak™ ${chrome.i18n.getMessage("mw_long")}</span></a></li>
            <li><a href="" target="_blank" id="ftLink">${chrome.i18n.getMessage("ft_long")}</a> - <a href="" target="_blank" id="ftSTLink"><span class="stattrakOrange">StatTrak™ ${chrome.i18n.getMessage("ft_long")}</span></a></li>
            <li><a href="" target="_blank" id="wwLink">${chrome.i18n.getMessage("ww_long")}</a> - <a href="" target="_blank" id="wwSTLink"><span class="stattrakOrange">StatTrak™ ${chrome.i18n.getMessage("ww_long")}</span></a></li>
            <li><a href="" target="_blank" id="bsLink">${chrome.i18n.getMessage("bs_long")}</a> - <a href="" target="_blank" id="bsSTLink"><span class="stattrakOrange">StatTrak™ ${chrome.i18n.getMessage("bs_long")}</span></a></li>
        </ul>
        <span>${chrome.i18n.getMessage("not_every_available")}</span>
    </div>`;

const inBrowserInspectButton =`<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect_button" href="http://csgo.gallery/" target="_blank"><span>${chrome.i18n.getMessage("inspect_in_browser")}</span></a>`;
const inBrowserInspectButtonPopupLink = `<a class="popup_menu_item" id="inbrowser_inspect" href="http://csgo.gallery/" target="_blank">${chrome.i18n.getMessage("inspect_in_browser")}</a>`;
const getFloatInfoMenuItem = `<span class="popup_menu_item" id="get_float">${chrome.i18n.getMessage("get_float_info")}</span>`;


const dopplerPhase = "<div class='dopplerPhaseMarket'><span></span></div>";

let thereSouvenirForThisItem = souvenirExists($(".descriptor").text());

$("#largeiteminfo_item_descriptors").append(exteriors);

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
    $fnst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("fn_long"));

    $mwst=$("#mwSTLink");
    $mwst.attr("href", genericMarketLink + souvenir + weaponName + "(Minimal Wear)");
    $mwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("mw_long"));

    $ftst=$("#ftSTLink");
    $ftst.attr("href", genericMarketLink + souvenir + weaponName + "(Field-Tested)");
    $ftst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("ft_long"));

    $wwst=$("#wwSTLink");
    $wwst.attr("href", genericMarketLink + souvenir + weaponName + "(Well-Worn)");
    $wwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("ww_long"));

    $bsst=$("#bsSTLink");
    $bsst.attr("href", genericMarketLink + souvenir + weaponName + "(Battle-Scarred)");
    $bsst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("bs_long"));
}
else{
    $("#fnSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "(Factory New)");
    $("#mwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "(Minimal Wear)");
    $("#ftSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "(Field-Tested)");
    $("#wwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "(Well-Worn)");
    $("#bsSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "(Battle-Scarred)");
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

    $(".popup_body.popup_menu").hide();

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
    <div class="progress-bar floatBarFN" title="${chrome.i18n.getMessage("fn_long")}"></div>
    <div class="progress-bar floatBarMW" title="${chrome.i18n.getMessage("mw_long")}"></div>
    <div class="progress-bar floatBarFT" title="${chrome.i18n.getMessage("ft_long")}"></div>
    <div class="progress-bar floatBarWW" title="${chrome.i18n.getMessage("ww_long")}"></div>
     <div class="progress-bar floatBarBS" title="${chrome.i18n.getMessage("bs_long")}"></div>
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
            $("#listing_"+listingID+"_name").parent().append("<div>Could not get Float from csgofloat.com</div>");
        }
        else{
            $("#listing_"+listingID+"_name").parent().append(floatBar);
        }


        $(".showTechnical").click(function () {
            $(".floatTechnical").toggle();
        });
    });

});

if(/Doppler/.test(window.location.href)){
    function addPhasesIndicator(){
        $(".market_listing_item_img_container").each(function(){
            $container = $(this);
            $container.append(dopplerPhase);

            let phase = getDopplerInfo($(this).find("img").attr("src").split("economy/image/")[1].split("/")[0]);

            if(phase.short==="SH"){
                $container.find(".dopplerPhaseMarket").append(sapphire);
            }
            else if(phase.short==="RB"){
                $container.find(".dopplerPhaseMarket").append(ruby);
            }
            else if(phase.short==="EM"){
                $container.find(".dopplerPhaseMarket").append(emerald);
            }
            else if(phase.short==="BP"){
                $container.find(".dopplerPhaseMarket").append(blackPearl);
            }
            else{
                $container.find(".dopplerPhaseMarket").find("span").text(phase.short);
            }
        });
    }

    addPhasesIndicator();

    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver(function(mutations, observer) {
        for(var mutation of mutations) {
            if (mutation.target.id === 'searchResultsRows') {
                addPhasesIndicator();
            }
        }
    });

    observer.observe(document.getElementById("searchResultsRows"), {
        subtree: true,
        attributes: false,
        childList: true
    });
}