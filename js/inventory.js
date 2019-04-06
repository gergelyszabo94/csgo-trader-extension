overridePopulateActions();

const module0 = `<a class="module">
    <div class="descriptor tradability" id="iteminfo0_tradability"></div>
    <div class="descriptor countdown" id="iteminfo0_countdown"></div>
    <div class="descriptor tradability bookmark" id="iteminfo0_bookmark">Bookmark and Notify</div>
</a>`;

const module1 = `<a class="module">
    <div class="descriptor tradability" id="iteminfo1_tradability"></div>
    <div class="descriptor countdown" id="iteminfo1_countdown"></div>
    <div class="descriptor tradability bookmark" id="iteminfo1_bookmark">Bookmark and Notify</div>
</a>`;

const floatBar0 = `
<div class="floatBar" id="floatBar0">
    <div class="floatToolTip" id="float0">
        <div>Float: <span id="float0DropTarget">Waiting for csgofloat.com</span></div>
        <svg id="floatPointer0" class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
 <div class="progress">
    <div class="progress-bar floatBarFN" title="Factory New"></div>
    <div class="progress-bar floatBarMW" title="Minimal Wear"></div>
    <div class="progress-bar floatBarFT" title="Field-Tested"></div>
    <div class="progress-bar floatBarWW" title="Well-Worn"></div>
     <div class="progress-bar floatBarBS" title="Battle-Scarred"></div>
 </div>
 <div class="showTechnical" id="showTechnical0">Show Technical</div>
 <div class="floatTechnical" id="floatTechnical0">
        Technical:<br>
        Float Value: <span id="fvDrop0"></span><br>
        Paint Index: <span id="piDrop0"></span><br>
        Paint Seed: <span id="psDrop0"></span><br>
        Origin: <span id="origDrop0"></span><br>
        Best Possible Float: <span id="minDrop0"></span><br>
        Worst Possible Float: <span id="maxDrop0"></span><br>
        <br>
        Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>
</div>
</div>`;
const floatBar1 = `
<div class="floatBar" id="floatBar1">
    <div class="floatToolTip" id="float1">
        <div>Float: <span id="float1DropTarget">Waiting for csgofloat.com</span></div>
        <svg id="floatPointer1" class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
 <div class="progress">
    <div class="progress-bar floatBarFN" title="Factory New"></div>
    <div class="progress-bar floatBarMW" title="Minimal Wear"></div>
    <div class="progress-bar floatBarFT" title="Field-Tested"></div>
    <div class="progress-bar floatBarWW" title="Well-Worn"></div>
     <div class="progress-bar floatBarBS" title="Battle-Scarred"></div>
 </div>
  <div class="showTechnical" id="showTechnical1">Show Technical</div>
 <div class="floatTechnical" id="floatTechnical1">
        Technical:<br>
        Float Value: <span id="fvDrop1"></span><br>
        Paint Index: <span id="piDrop1"></span><br>
        Paint Seed: <span id="psDrop1"></span><br>
        Origin: <span id="origDrop1"></span><br>
        Best Possible Float: <span id="minDrop1"></span><br>
        Worst Possible Float: <span id="maxDrop1"></span><br>
        <br>
        Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>
</div>
</div>`;

// const note0 = `<div class="descriptor note" id="note0"></div>`;
// const note1 = `<div class="descriptor note" id="note1"></div>`;

const tradable = "<span class='tradable'>Tradable</span>";
const notTradable = "<span class='not_tradable'>Not Tradable</span>";

const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

const exteriors1 = `
    <div class="descriptor otherExteriors" id="otherExteriors1">
        <span>Links to other exteriors:</span>
        <ul>
            <li><a href="" target="_blank" id="fnLink1">Factory New</a> - <a href="" target="_blank" id="fnSTLink1"><span class="stattrakOrange">StatTrak™ Factory New</span></a></li>
            <li><a href="" target="_blank" id="mwLink1">Minimal Wear</a> - <a href="" target="_blank" id="mwSTLink1"><span class="stattrakOrange">StatTrak™ Minimal Wear</span></a></li>
            <li><a href="" target="_blank" id="ftLink1">Field-Tested</a> - <a href="" target="_blank" id="ftSTLink1"><span class="stattrakOrange">StatTrak™ Field-Tested</span></a></li>
            <li><a href="" target="_blank" id="wwLink1">Well-Worn</a> - <a href="" target="_blank" id="wwSTLink1"><span class="stattrakOrange">StatTrak™ Well-Worn</span></a></li>
            <li><a href="" target="_blank" id="bsLink1">Battle-Scarred</a> - <a href="" target="_blank" id="bsSTLink1"><span class="stattrakOrange">StatTrak™ Battle-Scarred</span></a></li>
        </ul>
        <span>Not every item is available in every exterior</span>
    </div>`;

const exteriors0 = `
    <div class="descriptor otherExteriors" id="otherExteriors0">
        <span>Links to other exteriors:</span>
        <ul>
            <li><a href="" target="_blank" id="fnLink0">Factory New</a> - <a href="" target="_blank" id="fnSTLink0"><span class="stattrakOrange">StatTrak™ Factory New</span></a></li>
            <li><a href="" target="_blank" id="mwLink0">Minimal Wear</a> - <a href="" target="_blank" id="mwSTLink0"><span class="stattrakOrange">StatTrak™ Minimal Wear</span></a></li>
            <li><a href="" target="_blank" id="ftLink0">Field-Tested</a> - <a href="" target="_blank" id="ftSTLink0"><span class="stattrakOrange">StatTrak™ Field-Tested</span></a></li>
            <li><a href="" target="_blank" id="wwLink0">Well-Worn</a> - <a href="" target="_blank" id="wwSTLink0"><span class="stattrakOrange">StatTrak™ Well-Worn</span></a></li>
            <li><a href="" target="_blank" id="bsLink0">Battle-Scarred</a> - <a href="" target="_blank" id="bsSTLink0"><span class="stattrakOrange">StatTrak™ Battle-Scarred</span></a></li>
        </ul>
        <span>Not every item is available in every exterior</span>
    </div>`;


//mutation observer observes changes on the right side of the inventory interface, this is a workaround for waiting for ajax calls to finish when the page changes

MutationObserver = window.MutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    if($(".games_list_tab.active").first().attr("href")==="#730"){
        addElements();
    }
    else{
        removeElements();
    }
});

let observer2 = new MutationObserver(function(mutations, observer) {
    addPerItemInfo(false);
});

//does not execute if inventory is private or failed to load the page (502 for example, mostly when steam is dead)
if($("#no_inventories").length!==1&&$("#iteminfo0").length!==0){
    observer.observe(document.getElementById("iteminfo0"), {
        subtree: false,
        attributes: true
    });

    observer2.observe(document.getElementById("inventories"),{
        subtree: false,
        attributes: true
    });
}

//sends a message to the "back end" to request inventory contents

let items = [];

function requestInventory(){
    chrome.runtime.sendMessage({inventory: getInventoryOwnerID()}, function(response) {
        if(!(response===undefined||response.inventory===undefined||response.inventory===""||response.inventory==="error")){
            items = response.inventory;
            addElements();
            addPerItemInfo();
            addClickListener();
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
    addPerItemInfo(true); //true means it's only for updating the time remaining indicators
}, 60000);


//adds everything that is per item, like trade lock, exterior, doppler phases, border colors
function addPerItemInfo(updating){
    $items = $(".item.app730.context2");
    if($items.length!==0){
        chrome.storage.sync.get(['colorfulItems'], function(result) {
            $items.each(function () {
                $item = $(this);
                if($item.attr("data-processed")===undefined||$item.attr("data-processed")==="false"||updating){
                    if($item.attr('id')===undefined){ //in case the inventory is not loaded yet
                        setTimeout(function () {
                            addPerItemInfo(false);
                        }, 1000);
                        return false;
                    }
                    else{
                        let assetID = $item.attr('id').split("730_2_")[1]; //gets the assetid of the item from the html
                        let item = getItemByAssetID(assetID); //matches it with the info from the api call

                        if(updating){
                            $itemDate = $item.find($(".perItemDate"));
                            let tradableShort = getShortDate(item.tradability);
                            if(tradableShort==="T"){
                                $itemDate.removeClass("not_tradable");
                                $itemDate.addClass("tradable");
                                $itemDate.text("T");
                            }
                            else{
                                $itemDate.removeClass("tradable");
                                $itemDate.addClass("not_tradable");
                                $itemDate.text(tradableShort);
                            }
                        }
                        else{
                            if(item.tradability==="Tradable"){
                                $item.append(`<div class='perItemDate tradable'>T</div>`);
                            }
                            else if(item.tradability!=="Not Tradable"){
                                $item.append(`<div class='perItemDate not_tradable'>${item.tradabilityShort}</div>`);
                            }

                            addDopplerPhase($item, item.dopplerInfo);
                            if(result.colorfulItems){
                                if(item.dopplerInfo!==undefined){
                                    $item.css({"border-color": "#"+item.dopplerInfo.color, "background-image": "url()", "background-color": "#"+item.dopplerInfo.color});
                                }
                                else{
                                    $item.css({"border-color": item.quality.color, "background-image": "url()", "background-color": item.quality.color+"44"});
                                }
                            }

                            if(item.shortExterior!==""){
                                $item.append(`<div class='exteriorIndicator'>${item.shortExterior}</div>`);
                            }
                            $(this).attr("data-processed", true);
                        }
                    }
                }
            });
        });
    }
    else{ //in case the inventory is not loaded yet
        setTimeout(function () {
            addPerItemInfo(false);
        }, 1000);
    }
}

//variables for the countdown recursive logic
let countingDown = false;
let countDownID = "";

function addElements(){
    if($(".games_list_tab.active").first().attr("href")==="#730"){
        let activeID = "";
        try{
            activeID = getAssetIDofActive();
        }catch (e) {
            console.log("Could not get assetID of active item");
            return false
        }
        let item = getItemByAssetID(activeID);

        //removes "tags"
        $("#iteminfo1_item_tags").remove();
        $("#iteminfo0_item_tags").remove();

        //adds float bar
        if(!$("#floatBar1").length) {
            $("#iteminfo1_content").children().first().after(floatBar1);
        }
        if(!$("#floatBar0").length) {
            $("#iteminfo0_content").children().first().after(floatBar0);
        }

        $(".floatTechnical").hide();

        //allows the float pointer's text to go outside the boundaries of the item - they would not be visible otherwise on high-float items
        $(".item_desc_content.app730.context2").css("overflow", "visible");

        //removes background from the right side of the page
        $(".item_desc_content").css("background-image", 'url()');

        //add "other exteriors" links module
        if(!$("#otherExteriors1").length) {
            $("#iteminfo1_item_descriptors").after(exteriors1);
        }
        if(!$("#otherExteriors0").length) {
            $("#iteminfo0_item_descriptors").after(exteriors0);
        }

        //hides "tradable after" in one's own inventory
        $("#iteminfo1_item_owner_descriptors").hide();
        $("#iteminfo0_item_owner_descriptors").hide();


        $iteminfo1 = $("#iteminfo1_item_actions");
        $iteminfo0 = $("#iteminfo0_item_actions");

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
                let tradableAt = new Date(item.tradability).toString().split("GMT")[0];
                $tradability1.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                $tradability0.html(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
                countDown(tradableAt);
                $("#iteminfo1_countdown").show();
                $("#iteminfo0_countdown").show();
            }

            if(item.dopplerInfo!==undefined){
                switch (item.dopplerInfo.short) {
                    // case "P1": addNote("Phase 1");break;
                    // case "P2": addNote("Phase 2");break;
                    // case "P3": addNote("Phase 3");break;
                    // case "P4": addNote("Phase 4");break;
                    // case "SH": addNote("Sapphire");break;
                    // case "RB": addNote("Ruby");break;
                    // case "BP": addNote("Black Pearl");break;
                    // case "EM": addNote("Emerald");break;
                    case "P1": changeName(item.name+" (Phase 1)",item.name_color,item.marketlink);break;
                    case "P2": changeName(item.name+" (Phase 2)",item.name_color,item.marketlink);break;
                    case "P3": changeName(item.name+" (Phase 3)",item.name_color,item.marketlink);break;
                    case "P4": changeName(item.name+" (Phase 4)",item.name_color,item.marketlink);break;
                    case "SH": changeName(item.name+" (Sapphire)",item.name_color,item.marketlink);break;
                    case "BP": changeName(item.name+" (Black Pearl)",item.name_color,item.marketlink);break;
                    case "EM": changeName(item.name+" (Emerald)",item.name_color,item.marketlink);break;
                }
            }
            else{
                changeName(item.name,item.name_color,item.marketlink);
                //removeNote();
            }


            //removes sih "Get Float" button - does not really work since it's loaded after this script..
            $(".float_block").remove();

            let inspectLink = item.inspectLink;

            //text while floats load
            let float ="Waiting for csgofloat.com";
            $("#float0DropTarget").text(float);
            $("#float1DropTarget").text(float);
            let paintIndex = "";
            let paintSeed = "";
            let origin = "";
            let min = "";
            let max = "";

            if(inspectLink!==""&&inspectLink!==undefined){
                $(".floatBar").show();
                chrome.runtime.sendMessage({getFloatInfo: inspectLink}, function(response) {
                    try{
                        float = response.floatInfo.floatvalue;
                        paintIndex = response.floatInfo.paintindex;
                        paintSeed = response.floatInfo.paintseed;
                        origin = response.floatInfo.origin_name;
                        min = response.floatInfo.min;
                        max = response.floatInfo.max;

                    }
                    catch{

                    }
                    let position = float.toFixed(2)*100-2;
                    $("#float0").css("left", position + "%");
                    $("#float1").css("left", position + "%");
                    $("#float0DropTarget").text(float.toFixed(4));
                    $("#float1DropTarget").text(float.toFixed(4));
                    $("#fvDrop0").text(float);
                    $("#fvDrop1").text(float);
                    $("#piDrop0").text(paintIndex);
                    $("#piDrop1").text(paintIndex);
                    $("#psDrop0").text(paintSeed);
                    $("#psDrop1").text(paintSeed);
                    $("#origDrop0").text(origin);
                    $("#origDrop1").text(origin);
                    $("#minDrop0").text(min);
                    $("#minDrop1").text(min);
                    $("#maxDrop0").text(max);
                    $("#maxDrop1").text(max);
                    if(float===0){
                        $(".floatBar").hide();
                    }
                });
            }
            else{
                $(".floatBar").hide();
            }

            let genericMarketLink = "https://steamcommunity.com/market/listings/730/";
            let weaponName = "";
            let stattrak = "StatTrak%E2%84%A2%20";
            let souvenir = "Souvenir";
            let isSouvenir = false;

            if(/StatTrak™/.test(item.marketlink)){
                weaponName = item.marketlink.split("/730/")[1].split("StatTrak™")[1].split("(")[0];
            }
            else if(/Souvenir/.test(item.marketlink)){
                isSouvenir = true;
                weaponName = item.marketlink.split("/730/")[1].split("Souvenir")[1].split("(")[0];
            }
            else{
                weaponName = item.marketlink.split("/730/")[1].split("(")[0];
            }


            $("#fnLink1").attr("href", genericMarketLink + weaponName + "%28Factory%20New%29");
            $("#mwLink1").attr("href", genericMarketLink + weaponName + "%28Minimal%20Wear%29");
            $("#ftLink1").attr("href", genericMarketLink + weaponName + "%28Field-Tested%29");
            $("#wwLink1").attr("href", genericMarketLink + weaponName + "%28Well-Worn%29");
            $("#bsLink1").attr("href", genericMarketLink + weaponName + "%28Battle-Scarred%29");

            $("#fnLink0").attr("href", genericMarketLink + weaponName + "%28Factory%20New%29");
            $("#mwLink0").attr("href", genericMarketLink + weaponName + "%28Minimal%20Wear%29");
            $("#ftLink0").attr("href", genericMarketLink + weaponName + "%28Field-Tested%29");
            $("#wwLink0").attr("href", genericMarketLink + weaponName + "%28Well-Worn%29");
            $("#bsLink0").attr("href", genericMarketLink + weaponName + "%28Battle-Scarred%29");

            if(isSouvenir){
                $st = $(".stattrakOrange");
                $st.addClass("souvenirYellow");
                $st.removeClass("stattrakOrange");

                $fnst1=$("#fnSTLink1");
                $fnst1.attr("href", genericMarketLink + souvenir + weaponName + "%28Factory%20New%29");
                $fnst1.find("span").text("Souvenir Factory New");

                $mwst1=$("#mwSTLink1");
                $mwst1.attr("href", genericMarketLink + souvenir + weaponName + "%28Minimal%20Wear%29");
                $mwst1.find("span").text("Souvenir Minimal Wear");

                $ftst1=$("#ftSTLink1");
                $ftst1.attr("href", genericMarketLink + souvenir + weaponName + "%28Field-Tested%29");
                $ftst1.find("span").text("Souvenir Field-Tested");

                $wwst1=$("#wwSTLink1");
                $wwst1.attr("href", genericMarketLink + souvenir + weaponName + "%28Well-Worn%29");
                $wwst1.find("span").text("Souvenir Well-Worn");

                $bsst1=$("#bsSTLink1");
                $bsst1.attr("href", genericMarketLink + souvenir + weaponName + "%28Battle-Scarred%29");
                $bsst1.find("span").text("Souvenir Battle-Scarred");

                $fnst0=$("#fnSTLink0");
                $fnst0.attr("href", genericMarketLink + souvenir + weaponName + "%28Factory%20New%29");
                $fnst0.find("span").text("Souvenir Factory New");

                $mwst0=$("#mwSTLink0");
                $mwst0.attr("href", genericMarketLink + souvenir + weaponName + "%28Minimal%20Wear%29");
                $mwst0.find("span").text("Souvenir Minimal Wear");

                $ftst0=$("#ftSTLink0");
                $ftst0.attr("href", genericMarketLink + souvenir + weaponName + "%28Field-Tested%29");
                $ftst0.find("span").text("Souvenir Field-Tested");

                $wwst0=$("#wwSTLink0");
                $wwst0.attr("href", genericMarketLink + souvenir + weaponName + "%28Well-Worn%29");
                $wwst0.find("span").text("Souvenir Well-Worn");

                $bsst0=$("#bsSTLink0");
                $bsst0.attr("href", genericMarketLink + souvenir + weaponName + "%28Battle-Scarred%29");
                $bsst0.find("span").text("Souvenir Battle-Scarred");
            }
            else{
                if( $(".souvenirYellow").length!==0){
                    $sv = $(".souvenirYellow");
                    $sv.addClass("stattrakOrange");
                    $sv.removeClass("souvenirYellow");
                }
                $("#fnSTLink1").attr("href", genericMarketLink + stattrak + weaponName + "%28Factory%20New%29");
                $("#mwSTLink1").attr("href", genericMarketLink + stattrak + weaponName + "%28Minimal%20Wear%29");
                $("#ftSTLink1").attr("href", genericMarketLink + stattrak + weaponName + "%28Field-Tested%29");
                $("#wwSTLink1").attr("href", genericMarketLink + stattrak + weaponName + "%28Well-Worn%29");
                $("#bsSTLink1").attr("href", genericMarketLink + stattrak + weaponName + "%28Battle-Scarred%29");

                $("#fnSTLink0").attr("href", genericMarketLink + stattrak + weaponName + "%28Factory%20New%29");
                $("#mwSTLink0").attr("href", genericMarketLink + stattrak + weaponName + "%28Minimal%20Wear%29");
                $("#ftSTLink0").attr("href", genericMarketLink + stattrak + weaponName + "%28Field-Tested%29");
                $("#wwSTLink0").attr("href", genericMarketLink + stattrak + weaponName + "%28Well-Worn%29");
                $("#bsSTLink0").attr("href", genericMarketLink + stattrak + weaponName + "%28Battle-Scarred%29");
            }

            if(item.marketlink.split("(")[1]===undefined){
                $("#otherExteriors1").hide();
                $("#otherExteriors0").hide();
            }
        }
    }
    else{
        $("#iteminfo1_countdown").hide();
        $("#iteminfo0_countdown").hide();
    }
}

function removeElements() {
    $("#iteminfo1_countdown").hide();
    $("#iteminfo0_countdown").hide();
    $("#otherExteriors1").hide();
    $("#otherExteriors0").hide();
    $("#iteminfo1_tradability").hide();
    $("#iteminfo0_tradability").hide();
    $("#floatBar1").hide();
    $("#floatBar0").hide();
    $("#iteminfo0_bookmark").hide();
    $("#iteminfo1_bookmark").hide();
    $("#item_name0").hide();
    $("#item_name1").hide();
    $("#iteminfo0_item_name").show();
    $("#iteminfo1_item_name").show();
    //removeNote();
}

// gets the asset id of the item that is currently selected
function getAssetIDofActive() {
    return  $(".activeInfo")[0].id.split("730_2_")[1];
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
                    $this.hide();
                    $tradability1 = $("#iteminfo1_tradability");
                    $tradability1.text("Tradable");
                    $tradability1.addClass("tradable");
                    $tradability0 = $("#iteminfo0_tradability");
                    $tradability0.text("Tradable");
                    $tradability0.addClass("tradable");
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

// function addNote(note){
//     if(!$("#note1").length) {
//         $("#iteminfo1_item_descriptors").before(note1);
//     }
//     if(!$("#note0").length) {
//         $("#iteminfo0_item_descriptors").before(note0);
//     }
//     $("#note1").text("Note: " + note);
//     $("#note0").text("Note: " + note);
// }
//
// function removeNote(){
//     $("#note1").remove();
//     $("#note0").remove();
// }

function changeName(name, color, link){
    $itemName0 = $("#iteminfo0_item_name");
    $itemName1 = $("#iteminfo1_item_name");
    let newNameElement0 = `<a class="hover_item_name" id="item_name0" style="color: ${color}" href="${link}" target="_blank">${name}</a>`;
    let newNameElement1 = `<a class="hover_item_name" id="item_name1" style="color: ${color}" href="${link}" target="_blank">${name}</a>`;

    if($("#item_name0").length===0&&$("#item_name1").length===0){
        $itemName0.after(newNameElement0);
        $itemName1.after(newNameElement1);
    }
    else{
        $newItemname0 =  $("#item_name0");
        $newItemname1 =  $("#item_name1");
        $newItemname0.attr({
            href: link,
            style: `color: #${color}`
        });
        $newItemname0.text(name);
        $newItemname1.attr({
            href: link,
            style: `color: #${color}`
        });
        $newItemname1.text(name);
    }
    $itemName0.hide();
    $itemName1.hide();
}

function addDopplerPhase(item, dopplerInfo){
    if(dopplerInfo!==undefined){
        item.append(dopplerPhase);
        $dopplerPhase = item.find(".dopplerPhase");
        switch (dopplerInfo.short){
            case "SH": $dopplerPhase.append(sapphire); break;
            case "RB": $dopplerPhase.append(ruby); break;
            case "EM": $dopplerPhase.append(emerald); break;
            case "BP": $dopplerPhase.append(blackPearl); break;
            default: $dopplerPhase.text(dopplerInfo.short);
        }
    }
}

function addClickListener(){
    $(".module").click(function () {
        let bookmark = {
            itemInfo: getItemByAssetID(getAssetIDofActive()),
            owner: getInventoryOwnerID(),
            comment: " ",
            notify: true,
            notifTime: getItemByAssetID(getAssetIDofActive()).tradability.toString(),
            notifType: "chrome"
        };
        chrome.storage.sync.get('bookmarks', function(result) {
            let bookmarks = result.bookmarks;
            bookmarks.push(bookmark);
            chrome.storage.sync.set({'bookmarks': bookmarks}, function() {
                if(bookmark.itemInfo.tradability!=="Tradable"){
                    chrome.runtime.sendMessage({setAlarm: {name:  bookmark.itemInfo.assetid, when: bookmark.itemInfo.tradability}}, function(response) {});
                }
                chrome.runtime.sendMessage({openInternalPage: "/html/bookmarks.html"}, function(response) {});
            });
        });
    });
    $("#showTechnical1").click(function () {
        $("#floatTechnical1").toggle();
    });
    $("#showTechnical0").click(function () {
        $("#floatTechnical0").toggle();
    });

    //sih sort
    $("#Lnk_SortItems").click(function () {
        addPerItemInfo(false);
    });
}
