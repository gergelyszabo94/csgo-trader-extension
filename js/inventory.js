let csDealsButton0 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect0" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';
let csDealsButton1 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect1" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';


let module0 = `<div>
    <div class="descriptor tradability" id="iteminfo0_tradability"><span></span></div>
    <div class="descriptor countdown" id="iteminfo0_countdown"><span></span></div>
</div>`;

let module1 = `<div>
    <div class="descriptor tradability" id="iteminfo1_tradability"><span></span></div>
    <div class="descriptor countdown" id="iteminfo1_countdown"><span></span></div>
</div>`;

let tradable = "<span class='tradable'>Tradable</span>";
let notTradable = "<span class='not_tradable'>Not Tradable</span>";

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    let activeID = $(".activeInfo")[0].id.split("730_2_")[1];


    $iteminfo1 = $("#iteminfo1_item_actions");
    if(!$("#csdeals_inspect1").length){
        $iteminfo1.append(csDealsButton1);
    }

    inspectLink = $("#iteminfo1_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect1").attr("href", "http://csgo.gallery/" + inspectLink);
    if(!$("#iteminfo1_tradability").length){
        $iteminfo1.after(module1);
    }

    $("#iteminfo1_item_owner_descriptors").hide();

    if(/Not Tradable/.test($("#iteminfo1_item_tags_content").html())){
        let item = getItemByAssetID(activeID);

        if(item){
            let tradableAt = new Date(item.tradability);
            $("#iteminfo1_tradability").html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);

            countDown(tradable);
        }
        else{
            $("#iteminfo1_tradability").html(notTradable);
        }
    }
    else{
        $("#iteminfo1_tradability").html(tradable);
    }


    $iteminfo0 = $("#iteminfo0_item_actions");
    if(!$("#csdeals_inspect0").length){
        $iteminfo0.append(csDealsButton0);
    }

    inspectLink = $("#iteminfo0_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect0").attr("href", "http://csgo.gallery/" + inspectLink);
    if(!$("#iteminfo0_tradability").length){
        $iteminfo0.after(module0);
    }

    $("#iteminfo0_item_owner_descriptors").hide();

    if(/Not Tradable/.test($("#iteminfo0_item_tags_content").html())){
        let item = getItemByAssetID(activeID);
        if(item){
            let tradableAt = new Date(item.tradability);
            $("#iteminfo0_tradability").html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
            countDown(tradable);
        }
        else{
            $("#iteminfo0_tradability").html(notTradable);
        }

    }
    else{
        $("#iteminfo0_tradability").html(tradable);
    }
});

observer.observe(document.getElementById("iteminfo0"), {
    subtree: false,
    attributes: true
});

var items = [];

chrome.runtime.sendMessage({alias: getProfileAlias()}, function(response) {
    items = response.inventory;
});

function getProfileAlias(){
    let alias = window.location.href;
    if(/\/id\//.test(window.location.href)){
        alias = window.location.href.split("/id/")[1].split("/inventory")[0];
    }
    else{
        alias = window.location.href.split("/profiles/")[1].split("/inventory")[0];
    }
    return alias;
}

function getItemByAssetID(assetidToFind){
    if (items === undefined || items.length === 0) {
        return false
    }
    return $.grep(items, function(e){ return e.assetid === assetidToFind; })[0];
}

function countDown(dateToCountDownTo){
    let countDownDate =  new Date(dateToCountDownTo);

    let x = setInterval(function() {
        $(".countdown").each(function () {
            let $this = $(this);

            let now = new Date().getTime();
            let distance = countDownDate - now;

            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            $this.text(days + "d " + hours + "h "
                + minutes + "m " + seconds + "s " + "remains");

            if (distance < 0) {
                clearInterval(x);
                $this.text("Tradable");
            }
        }, 1000);
    });
}
