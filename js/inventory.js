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

let note0 = `<div class="descriptor note" id="note0">Note:</div>`;
let note1 = `<div class="descriptor note" id="note1">Note:</div>`;


let tradable = "<span class='tradable'>Tradable</span>";
let notTradable = "<span class='not_tradable'>Not Tradable</span>";

let dateOnEachItem = "<div class='perItemDate'><span></span></div>";
let dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

let ruby = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/red_jewel" alt=":red_jewel:" class="gemIcon">';
let sapphire = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/blue_jewel" alt=":blue_jewel:" class="gemIcon">';
let emerald = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/green_jewel" alt=":green_jewel:" class="gemIcon">';


//mutation observer observes changes on the right side of the inventory interface, this is a workaround for waiting for ajax calls to finish when the page changes

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    addElements();
});

observer.observe(document.getElementById("iteminfo0"), {
    subtree: false,
    attributes: true
});

let observer2 = new MutationObserver(function(mutations, observer) {
    addSmallIndicators();
});

observer2.observe(document.getElementById("inventories"),{
    subtree: false,
    attributes: true
});

//sends a message to the "back end" to request inventory contents

let items = [];

function requestInventory(){
    chrome.runtime.sendMessage({inventory: "get"}, function(response) {
        if(!(response.inventory===undefined||response.inventory===""||response.inventory==="error")){
            items = response.inventory;
            addElements();
            addSmallIndicators();
        }
        else{
            console.log("Wasn't able to get the inventory, it's most likely steam not working properly or you loading inventory pages at the same time");
            console.log("Retrying in 30 seconds");
            setTimeout(function () {
                requestInventory();
            }, 30000);

        }
    });
}
requestInventory();

//to refresh the trade lock remaining indicators
setInterval(function () {
    addSmallIndicators();
}, 60000);


//adds a short trade lock indicator to each item
function addSmallIndicators(){
    $items = $(".item.app730.context2");
    if($items.length!==0){
        $items.each(function () {
            if($(this).find(".perItemDate").length===0){
                $(this).append(dateOnEachItem);
                $(this).append(dopplerPhase);
            }
            if($(this).attr('id')===undefined){
                setTimeout(function () {
                    addSmallIndicators();
                }, 1000);
                return false;
            }
            else{
                let assetID = $(this).attr('id').split("730_2_")[1];
                let item = getItemByAssetID(assetID);
                if(item.tradabilityShort==="T"){
                    $(this).find("span")[0].classList.add("tradable");
                }
                $(this).find("span")[0].innerText=item.tradabilityShort;

                if(item.dopplerPhase!==""){
                    if($(this).find(".dopplerPhase").find(".gemIcon").length===0){
                        if(item.dopplerPhase==="SH"){
                            $(this).find(".dopplerPhase").append(sapphire);
                        }
                        else if(item.dopplerPhase==="RB"){
                            $(this).find(".dopplerPhase").append(ruby);
                        }
                        else if(item.dopplerPhase==="EM"){
                            $(this).find(".dopplerPhase").append(emerald);
                        }
                        else{
                            $(this).find("span")[1].innerText=item.dopplerPhase;
                        }
                    }
                }
                else{
                    $(this).find(".dopplerPhase").hide();
                }
            }
        });
    }
    else{
        setTimeout(function () {
            addSmallIndicators();
        }, 1000);
    }
}

//variables for the countdown recursive logic
let countingDown = false;
let countDownID = "";

function addElements(){
    if($(".games_list_tab.active").first().attr("href")==="#730"){
        let activeID = $(".activeInfo")[0].id.split("730_2_")[1]; // gets the asset id of the item that is currently selected.
        let item = getItemByAssetID(activeID);

        //adds "notes" element
        if(!$("#note1").length) {
            $("#iteminfo1_item_descriptors").prepend(note1);
        }
        if(!$("#note0").length) {
            $("#iteminfo0_item_descriptors").prepend(note0);
        }

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
        $tradability0 = $("#iteminfo0_tradability");

        if(item){
            if(item.tradability==="Tradable"){
                $tradability1.html(tradable);
                $tradability0.html(tradable);
                $("#iteminfo1_countdown").hide();
                $("#iteminfo0_countdown").hide();
            }
            else if(item.tradability==="Not Tradable"){
                $tradability1.html(notTradable);
                $tradability0.html(notTradable);
                $("#iteminfo1_countdown").hide();
                $("#iteminfo0_countdown").hide();
            }
            else{
                let tradableAt = new Date(item.tradability);
                $tradability1.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                $tradability0.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                countDown(tradableAt);
                $("#iteminfo1_countdown").show();
                $("#iteminfo0_countdown").show();
            }
        }
    }
    else{
        $("#iteminfo1_countdown").hide();
        $("#iteminfo0_countdown").hide();
    }
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
