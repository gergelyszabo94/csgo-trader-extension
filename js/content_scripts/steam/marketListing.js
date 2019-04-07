const exteriors = `
    <div class="descriptor otherExteriors" id="otherExteriors">
        <span>Links to other exteriors:</span>
        <ul>
            <li><a href="" target="_blank" id="fnLink">Factory New</a> - <a href="" target="_blank" id="fnSTLink"><span class="stattrakOrange">StatTrak™ Factory New</span></a></li>
            <li><a href="" target="_blank" id="mwLink">Minimal Wear</a> - <a href="" target="_blank" id="mwSTLink"><span class="stattrakOrange">StatTrak™ Minimal Wear</span></a></li>
            <li><a href="" target="_blank" id="ftLink">Field-Tested</a> - <a href="" target="_blank" id="ftSTLink"><span class="stattrakOrange">StatTrak™ Field-Tested</span></a></li>
            <li><a href="" target="_blank" id="wwLink">Well-Worn</a> - <a href="" target="_blank" id="wwSTLink"><span class="stattrakOrange">StatTrak™ Well-Worn</span></a></li>
            <li><a href="" target="_blank" id="bsLink">Battle-Scarred</a> - <a href="" target="_blank" id="bsSTLink"><span class="stattrakOrange">StatTrak™ Battle-Scarred</span></a></li>
        </ul>
        <span>Not every item is available in every exterior</span>
    </div>`;

const inBrowserInspectButton ='<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect_button" href="http://csgo.gallery/" target="_blank"><span>Inspect in Browser...</span></a>';
const inBrowserInspectButtonPopupLink = '<a class="popup_menu_item" id="inbrowser_inspect" href="http://csgo.gallery/" target="_blank">Inspect in Browser...</a>';

const dopplerPhase = "<div class='dopplerPhaseMarket'><span></span></div>";

let thereSouvenirForThisItem = souvenirExists($(".descriptor").text());

$("#largeiteminfo_item_descriptors").append(exteriors);

const genericMarketLink = "https://steamcommunity.com/market/listings/730/";
const stattrak = "StatTrak%E2%84%A2%20";
const souvenir = "Souvenir%20";
const fullName = $(".market_listing_nav").children($("a")).last().text();
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

$("#fnLink").attr("href", genericMarketLink + star + weaponName + "%28Factory%20New%29");
$("#mwLink").attr("href", genericMarketLink + star + weaponName + "%28Minimal%20Wear%29");
$("#ftLink").attr("href", genericMarketLink + star + weaponName + "%28Field-Tested%29");
$("#wwLink").attr("href", genericMarketLink + star + weaponName + "%28Well-Worn%29");
$("#bsLink").attr("href", genericMarketLink + star + weaponName + "%28Battle-Scarred%29");

if(isSouvenir||thereSouvenirForThisItem){
    $st = $(".stattrakOrange");
    $st.addClass("souvenirYellow");
    $st.removeClass("stattrakOrange");

    $fnst=$("#fnSTLink");
    $fnst.attr("href", genericMarketLink + souvenir + weaponName + "%28Factory%20New%29");
    $fnst.find("span").text("Souvenir Factory New");

    $mwst=$("#mwSTLink");
    $mwst.attr("href", genericMarketLink + souvenir + weaponName + "%28Minimal%20Wear%29");
    $mwst.find("span").text("Souvenir Minimal Wear");

    $ftst=$("#ftSTLink");
    $ftst.attr("href", genericMarketLink + souvenir + weaponName + "%28Field-Tested%29");
    $ftst.find("span").text("Souvenir Field-Tested");

    $wwst=$("#wwSTLink");
    $wwst.attr("href", genericMarketLink + souvenir + weaponName + "%28Well-Worn%29");
    $wwst.find("span").text("Souvenir Well-Worn");

    $bsst=$("#bsSTLink");
    $bsst.attr("href", genericMarketLink + souvenir + weaponName + "%28Battle-Scarred%29");
    $bsst.find("span").text("Souvenir Battle-Scarred");
}
else{
    $("#fnSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "%28Factory%20New%29");
    $("#mwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "%28Minimal%20Wear%29");
    $("#ftSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "%28Field-Tested%29");
    $("#wwSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "%28Well-Worn%29");
    $("#bsSTLink").attr("href", genericMarketLink + star + stattrak + weaponName + "%28Battle-Scarred%29");
}

$("#largeiteminfo_item_actions").append(inBrowserInspectButton);
$("#market_action_popup_itemactions").after(inBrowserInspectButtonPopupLink);

let inspectLink = $("#largeiteminfo_item_actions").find(".btn_small.btn_grey_white_innerfade").first().attr("href");
$("#inbrowser_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);

$(".market_actionmenu_button").on("click", function () {
    let inspectLink = $("#market_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
    $("#inbrowser_inspect").attr("href", "http://csgo.gallery/" + inspectLink);
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