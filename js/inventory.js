let csDealsButton0 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect0" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';
let csDealsButton1 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect1" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';

let tradable0 = '<div class="descriptor tradability" id="iteminfo0_tradability"><span></span></div>';
let tradable1 = '<div class="descriptor tradability" id="iteminfo1_tradability"><span></span></div>';

let countdown0 = '<div class="descriptor countdown" id="iteminfo0_countdown"><span></span></div>';
let countdown1 = '<div class="descriptor countdown" id="iteminfo1_countdown"><span></span></div>';

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    let activeID = $(".activeInfo")[0].id.split("730_2_")[1];

    $iteminfo1 = $("#iteminfo1_item_actions");
    $iteminfo1.append(csDealsButton1);
    inspectLink = $("#iteminfo1_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect1").attr("href", "http://csgo.gallery/" + inspectLink);
    if(!$("#iteminfo1_tradability").length){
        $iteminfo1.after(tradable1);
    }

    $("#iteminfo1_item_owner_descriptors").hide();

    if(/Not Tradable/.test($("#iteminfo1_item_tags_content").html())){
        $("#iteminfo1_tradability").html("<span class='not_tradable'>Not Tradable</span>");
        let item = getItemByAssetID(activeID);
        console.log(item);
        console.log(item.tradability);
        console.log(!item);

        if(item){
            let tradable = new Date(item.tradability);
            $("#iteminfo1_tradability").html(`<span class='not_tradable'>Tradable After ${tradable}</span>`);
            if(!$("#iteminfo1_countdown").length){
                $("#iteminfo1_tradability").after(countdown1);
            }
        }
        else{
            $("#iteminfo1_tradability").html("<span class='not_tradable'>Not Tradable</span>");
        }
    }
    else{
        $("#iteminfo1_tradability").html("<span class='tradable'>Tradable</span>");
    }





    $iteminfo0 = $("#iteminfo0_item_actions");
    $iteminfo0.append(csDealsButton0);
    inspectLink = $("#iteminfo0_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect0").attr("href", "http://csgo.gallery/" + inspectLink);
    if(!$("#iteminfo0_tradability").length){
        $iteminfo0.after(tradable0);
    }

    $("#iteminfo0_item_owner_descriptors").hide();

    if(/Not Tradable/.test($("#iteminfo0_item_tags_content").html())){
        let item = getItemByAssetID(activeID);
        if(item){
            let tradable = new Date(item.tradability);
            $("#iteminfo0_tradability").html(`<span class='not_tradable'>Tradable After ${tradable}</span>`);
            if(!$("#iteminfo0_countdown").length){
                $("#iteminfo0_tradability").after(countdown0);
            }
        }
        else{
            $("#iteminfo0_tradability").html("<span class='not_tradable'>Not Tradable</span>");
        }

    }
    else{
        $("#iteminfo0_tradability").html("<span class='tradable'>Tradable</span>");
    }
});

observer.observe(document.getElementById("iteminfo0"), {
    subtree: false,
    attributes: true
});


let alias = window.location.href;

if(/\/id\//.test(window.location.href)){
    alias = window.location.href.split("/id/")[1].split("/inventory")[0];
}
else{
    alias = window.location.href.split("/profiles/")[1].split("/inventory")[0];
}

var items = [];

chrome.runtime.sendMessage({alias: alias}, function(response) {
    items = response.inventory;
    //console.log(new Date(items[0].tradability));
});

function getItemByAssetID(assetidToFind){
    if (items === undefined || items.length === 0) {
        return false
    }
    return $.grep(items, function(e){ return e.assetid === assetidToFind; })[0];
}
