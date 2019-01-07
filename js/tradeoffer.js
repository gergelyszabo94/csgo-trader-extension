let csdealsButton = '<a class="popup_menu_item" id="csdeals_inspect_button" href="http://csgo.gallery/" target="_blank">Inspect on CS.DEALS...</a>';

$("#trade_action_popup_itemactions").after(csdealsButton);

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    if($("#csdeals_inspect_button").attr("href")==="http://csgo.gallery/"){
        addClickListener();
    }
});

observer.observe(document.getElementById("inventories"), {
    subtree: true,
    attributes: true
});

function addClickListener(){
    $(".slot_actionmenu_button").on("click", function () {
        let inspectLink = $("#trade_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
        $("#csdeals_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);
    });
}