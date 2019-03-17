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

const float0 = `<div class="floatOverIcon" id="float0">Float: <span id="float0DropTarget">Waiting for csgofloat.com</span></div>`;
const float1 = `<div class="floatOverIcon" id="float1">Float: <span id="float1DropTarget">Waiting for csgofloat.com</span></div>`;

const floatBar0 = `<div class="floatBar" id="floatBar0">
 <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" id="floatPointer0" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   <div class="progress">
   <div class="progress-bar floatBarFN"></div>
      <div class="progress-bar floatBarMW"></div>
      <div class="progress-bar floatBarFT"></div>
      <div class="progress-bar floatBarWW"></div>
      <div class="progress-bar floatBarBS"></div>
    </div>
</div>`;
const floatBar1 = `
<div class="floatBar" id="floatBar1">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" id="floatPointer1" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
    <div class="progress">
    <div class="progress-bar floatBarFN"></div>
      <div class="progress-bar floatBarMW"></div>
      <div class="progress-bar floatBarFT"></div>
      <div class="progress-bar floatBarWW"></div>
      <div class="progress-bar floatBarBS"></div>
    </div>
</div>`;

const note0 = `<div class="descriptor note" id="note0"></div>`;
const note1 = `<div class="descriptor note" id="note1"></div>`;

const tradable = "<span class='tradable'>Tradable</span>";
const notTradable = "<span class='not_tradable'>Not Tradable</span>";

const dateOnEachItem = "<div class='perItemDate'><span></span></div>";
const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";
const exterior = "<div class='exteriorIndicator'><span></span></div>";

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
    addSmallIndicators();
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
            addSmallIndicators();
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
                        else if(item.dopplerPhase==="BP"){
                            $(this).find(".dopplerPhase").append(blackPearl);
                        }
                        else{
                            $(this).find("span")[1].innerText=item.dopplerPhase;
                        }
                    }
                }
                else{
                    $(this).find(".dopplerPhase").hide();
                }

                if(item.shortExterior!==""){
                    if($(this).find(".exteriorIndicator").length===0){
                        $(this).append(exterior);
                        $(this).find(".exteriorIndicator").text(item.shortExterior);
                    }
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
        let activeID = getAssetIDofActive();
        let item = getItemByAssetID(activeID);

        //removes "tags"
        $("#iteminfo1_item_tags").remove();
        $("#iteminfo0_item_tags").remove();

        //adds float value info over the icon
        if(!$("#float1").length) {
            $("#iteminfo1_item_icon").after(float1);
        }
        if(!$("#float0").length) {
            $("#iteminfo0_item_icon").after(float0);
        }

        //adds float bar
        if(!$("#floatBar1").length) {
            $("#iteminfo1_content").children().first().after(floatBar1);
        }
        if(!$("#floatBar0").length) {
            $("#iteminfo0_content").children().first().after(floatBar0);
        }

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

            if(item.dopplerPhase!==""){
                switch (item.dopplerPhase) {
                    case "P1": addNote("Phase 1");break;
                    case "P2": addNote("Phase 2");break;
                    case "P3": addNote("Phase 3");break;
                    case "P4": addNote("Phase 4");break;
                    case "SH": addNote("Sapphire");break;
                    case "RB": addNote("Ruby");break;
                    case "BP": addNote("Black Pearl");break;
                    case "EM": addNote("Emerald");break;
                }
            }
            else{
                removeNote();
            }


            //removes sih "Get Float" button - does not really work since it's loaded after this script..
            $(".float_block").remove();

            let inspectLink = item.inspectLink;

            //text while floats load
            let float ="Waiting for csgofloat.com";
            $("#float0DropTarget").text(float);
            $("#float1DropTarget").text(float);

            chrome.runtime.sendMessage({getFloatInfo: inspectLink}, function(response) {
                try{
                    float = response.floatInfo.floatvalue;
                }
                catch{

                }
                let position = float.toFixed(2)*100-2;
                $("#floatPointer0").css("left", position + "%");
                $("#floatPointer1").css("left", position + "%");
                $("#float0DropTarget").text(float.toFixed(4));
                $("#float1DropTarget").text(float.toFixed(4));
            });

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
    removeNote();
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

function addNote(note){
    if(!$("#note1").length) {
        $("#iteminfo1_item_descriptors").before(note1);
    }
    if(!$("#note0").length) {
        $("#iteminfo0_item_descriptors").before(note0);
    }
    $("#note1").text("Note: " + note);
    $("#note0").text("Note: " + note);
}

function removeNote(){
    $("#note1").remove();
    $("#note0").remove();
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
}
