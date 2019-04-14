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
    $fnst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("fn_long"));

    $mwst=$("#mwSTLink");
    $mwst.attr("href", genericMarketLink + souvenir + weaponName + "%28Minimal%20Wear%29");
    $mwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("mw_long"));

    $ftst=$("#ftSTLink");
    $ftst.attr("href", genericMarketLink + souvenir + weaponName + "%28Field-Tested%29");
    $ftst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("ft_long"));

    $wwst=$("#wwSTLink");
    $wwst.attr("href", genericMarketLink + souvenir + weaponName + "%28Well-Worn%29");
    $wwst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("ww_long"));

    $bsst=$("#bsSTLink");
    $bsst.attr("href", genericMarketLink + souvenir + weaponName + "%28Battle-Scarred%29");
    $bsst.find("span").text(chrome.i18n.getMessage("souvenir")+" " + chrome.i18n.getMessage("bs_long"));
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

$("#inbrowser_inspect").hover(function () {
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