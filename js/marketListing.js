let exteriors = `
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

$("#largeiteminfo_item_descriptors").append(exteriors);

let genericMarketLink = "https://steamcommunity.com/market/listings/730/";
let weaponName = "";
let stattrak = "StatTrak%E2%84%A2%20";
let souvenir = "Souvenir%20";
let isSouvenir = false;

if(/StatTrak%E2%84%A2%20/.test(window.location.href)){
    if(window.location.href.split("/730/")[1].split(stattrak)[1]===window.location.href.split("/730/")[1].split(stattrak)[1].split("%28")[0]){
        weaponName = window.location.href.split("/730/")[1].split(stattrak)[1].split("(")[0]; //stupid sih inconsistency fix
    }
    else{
        weaponName = window.location.href.split("/730/")[1].split(stattrak)[1].split("%28")[0];
    }
}
else if(/Souvenir/.test(window.location.href)){
    isSouvenir = true;
    if(window.location.href.split("/730/")[1].split(souvenir)[1]===window.location.href.split("/730/")[1].split(souvenir)[1].split("%28")[0]){
        weaponName = window.location.href.split("/730/")[1].split(souvenir)[1].split("(")[0]; //stupid sih inconsistency fix
    }
    else{
        weaponName = window.location.href.split("/730/")[1].split(souvenir)[1].split("%28")[0];
    }

}
else {
    if(window.location.href.split("/730/")[1]===window.location.href.split("/730/")[1].split("%28")[0]){
        weaponName = window.location.href.split("/730/")[1].split("(")[0]; ////stupid sih inconsistency fix
    }
    else {
        weaponName = window.location.href.split("/730/")[1].split("%28")[0];
    }
}

if(window.location.href.split("%28")[1]===undefined&&window.location.href.split("(")[1]===undefined){
    $("#otherExteriors").hide();
}

$("#fnLink").attr("href", genericMarketLink + weaponName + "%28Factory%20New%29");
$("#mwLink").attr("href", genericMarketLink + weaponName + "%28Minimal%20Wear%29");
$("#ftLink").attr("href", genericMarketLink + weaponName + "%28Field-Tested%29");
$("#wwLink").attr("href", genericMarketLink + weaponName + "%28Well-Worn%29");
$("#bsLink").attr("href", genericMarketLink + weaponName + "%28Battle-Scarred%29");

if(isSouvenir){
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
    $("#fnSTLink").attr("href", genericMarketLink + stattrak + weaponName + "%28Factory%20New%29");
    $("#mwSTLink").attr("href", genericMarketLink + stattrak + weaponName + "%28Minimal%20Wear%29");
    $("#ftSTLink").attr("href", genericMarketLink + stattrak + weaponName + "%28Field-Tested%29");
    $("#wwSTLink").attr("href", genericMarketLink + stattrak + weaponName + "%28Well-Worn%29");
    $("#bsSTLink").attr("href", genericMarketLink + stattrak + weaponName + "%28Battle-Scarred%29");
}



let csDealsButton ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect_button" href="http://csgo.gallery/" target="_blank"><span>Inspect in Browser...</span></a>';
let csdealsButtonPopupLink = '<a class="popup_menu_item" id="csdeals_inspect" href="http://csgo.gallery/" target="_blank">Inspect in Browser...</a>';

$("#largeiteminfo_item_actions").append(csDealsButton);
$("#market_action_popup_itemactions").after(csdealsButtonPopupLink);

let inspectLink = $("#largeiteminfo_item_actions").find(".btn_small.btn_grey_white_innerfade").first().attr("href");
$("#csdeals_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);

$(".market_actionmenu_button").on("click", function () {
    let inspectLink = $("#market_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
    $("#csdeals_inspect").attr("href", "http://csgo.gallery/" + inspectLink);
});