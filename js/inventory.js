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

//mutation observer observes changes on the right side of the inventory interface, this is a workaround for waiting for ajax calls to finish when the page changes

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    addElements();
});

observer.observe(document.getElementById("iteminfo0"), {
    subtree: false,
    attributes: true
});


//sends a message to the "back end" to request inventory contents

var items = [];

chrome.runtime.sendMessage({alias: getProfileAlias()}, function(response) {
    if(!(response.inventory===undefined||response.inventory==="")){
        items = response.inventory;
        addElements();
    }
    else{
        console.log(response.inventory);
    }
});

//variables for the countdown recursive logic
var countingDown = false;
var countDownID = "";

function addElements(){
    let activeID = $(".activeInfo")[0].id.split("730_2_")[1]; // gets the asset id of the item that is currently selected.
    let item = getItemByAssetID(activeID);

    //hides "tradable after" in one's own inventory
    $("#iteminfo1_item_owner_descriptors").hide();
    $("#iteminfo0_item_owner_descriptors").hide();


    //adds inspect on cs.deals buttons
    $iteminfo1 = $("#iteminfo1_item_actions");
    if(!$("#csdeals_inspect1").length){
        $iteminfo1.append(csDealsButton1)
    }
    $iteminfo0 = $("#iteminfo0_item_actions");
    if(!$("#csdeals_inspect0").length){
        $iteminfo0.append(csDealsButton0)
    }

    //adds the correct url to the inspect buttons
    inspectLink = $("#iteminfo1_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect1").attr("href", "http://csgo.gallery/" + inspectLink);
    inspectLink = $("#iteminfo0_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect0").attr("href", "http://csgo.gallery/" + inspectLink);


    //adds tradability and countdown elements
    if(!$("#iteminfo1_tradability").length){
        $iteminfo1.after(module1);
    }
    if(!$("#iteminfo0_tradability").length){
        $iteminfo0.after(module0);
    }

    //tradability logic and countdown initiation
    $tradability1 =  $("#iteminfo1_tradability");
    if(/Not Tradable/.test($("#iteminfo1_item_tags_content").html())){
        if(/Not Marketable/.test($("#iteminfo1_item_tags_content").html())){
            $tradability1.html(notTradable);
            $("#iteminfo1_countdown").hide();
        }
        else{
            if(item){
                let tradableAt = new Date(item.tradability);
                $tradability1.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                countDown(tradableAt);
                $("#iteminfo1_countdown").show();
            }
            else{
                $tradability1.html(notTradable);
            }
        }
    }
    else{
        $tradability1.html(tradable);
        $("#iteminfo1_countdown").hide();
    }
    $tradability0 = $("#iteminfo0_tradability");
    if(/Not Tradable/.test($("#iteminfo0_item_tags_content").html())){
        if(/Not Marketable/.test($("#iteminfo0_item_tags_content").html())){
            $tradability0.html(notTradable);
            $("#iteminfo0_countdown").hide();
        }
        else{
            if(item){
                let tradableAt = new Date(item.tradability);
                $tradability0.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                countDown(tradableAt);
                $("#iteminfo0_countdown").show();
            }
            else{
                $tradability0.html(notTradable);
            }
        }
    }
    else{
        $tradability0.html(tradable);
        $("#iteminfo0_countdown").hide();
    }
}

//gets steam account alias that is passed for api call
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

//gets the details of an item by matching the passed asset id with the ones from the api call
function getItemByAssetID(assetidToFind){
    if (items === undefined || items.length === 0) {
        return false
    }
    return $.grep(items, function(e){ return e.assetid === assetidToFind; })[0];
}

//manages the trade lock countdown
function countDown(dateToCountDownTo){
    if(!countingDown){
        countingDown = true;
        countDownID = setInterval(function() {
            $(".countdown").each(function () {
                let $this = $(this);

                let now = new Date().getTime();
                let distance = new Date(dateToCountDownTo) - now;
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                $this.text(days + "d " + hours + "h "
                    + minutes + "m " + seconds + "s " + "remains");

                if (distance < 0) {
                    clearInterval(countDownID);
                    $this.text("Tradable");
                }
            }, 1000);
        });
    }
    else{
        clearInterval(countDownID);
        countingDown = false;
        countDown(dateToCountDownTo);
    }
}
