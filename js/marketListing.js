let exteriors = `
    <div class="descriptor" id="otherExteriors">
        <span>Other exteriors:</span>
        <ul>
            <li>Factory New - <a href="" target="_blank" id="fnLink">Link</a></li>
            <li>Minimal Wear - <a href="" target="_blank" id="mwLink">Link</a></li>
            <li>Field-Tested - <a href="" target="_blank" id="ftLink">Link</a></li>
            <li>Well-Worn - <a href="" target="_blank" id="wwLink">Link</a></li>
            <li>Battle-Scarred - <a href="" target="_blank" id="bsLink">Link</a></li>
        </ul>
    </div>`;

$("#largeiteminfo_item_descriptors").append(exteriors);

baseLink = window.location.href.split("%28")[0];

//fixing inventory helper inconsistencies
if(baseLink===window.location.href){
    baseLink = window.location.href.split("(")[0];
}
if(window.location.href.split("%28")[1]===undefined&&window.location.href.split("(")[1]===undefined){
    $("#otherExteriors").hide();
}

$("#fnLink").attr("href", baseLink+"%28Factory%20New%29");
$("#mwLink").attr("href", baseLink+"%28Minimal%20Wear%29");
$("#ftLink").attr("href", baseLink+"%28Field-Tested%29");
$("#wwLink").attr("href", baseLink+"%28Well-Worn%29");
$("#bsLink").attr("href", baseLink+"%28Battle-Scarred%29");



let csdealsButton = '<a class="popup_menu_item" id="csdeals_inspect_button" href="http://csgo.gallery/" target="_blank">Inspect in Browser...</a>';

$("#market_action_popup_itemactions").after(csdealsButton);

$(".market_actionmenu_button").on("click", function () {
    let inspectLink = $("#market_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
    $("#csdeals_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);
});