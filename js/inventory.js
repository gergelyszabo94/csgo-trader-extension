
//the hack i was looking for ages
// https://stackoverflow.com/questions/3955803/page-variables-in-content-script

function retrieveWindowVariables(variables) {
    let ret = {};

    let scriptContent = "";
    for (let i = 0; i < variables.length; i++) {
        let currVariable = variables[i];
        //scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n"
        scriptContent += "if (typeof " + currVariable + " !== 'undefined') document.getElementsByTagName('body')[0].setAttribute('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n";
    }

    let script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (let i = 0; i < variables.length; i++) {
        let currVariable = variables[i];
        ret[currVariable] = $.parseJSON($("body").attr("tmp_" + currVariable));
        $("body").removeAttr("tmp_" + currVariable);
    }

    $("#tmpScript").remove();

    return ret;
}

//console.log(retrieveWindowVariables(["UserYou"]));
//let user = retrieveWindowVariables(["UserYou"]);

// UserYou.loadInventory(730,2, {"appid":730,"name":"Counter-Strike: Global Offensive","icon":"https:\/\/steamcdn-a.akamaihd.net\/steamcommunity\/public\/images\/apps\/730\/69f7ebe2735c366c65c0b33dae00e12dc40edbe4.jpg","link":"https:\/\/steamcommunity.com\/app\/730","asset_count":927,"inventory_logo":"https:\/\/steamcdn-a.akamaihd.net\/steamcommunity\/public\/images\/apps\/730\/3ab6e87a04994b900881f694284a75150e640536.png","trade_permissions":"FULL","load_failed":0,"store_vetted":"1","rgContexts":{"2":{"asset_count":927,"id":"2","name":"Backpack"}}});


// function executeInPageContext(codeString) {
//     let script = document.createElement('script');
//     script.id = 'tmpScript';
//     script.appendChild(document.createTextNode(codeString));
//     (document.body || document.head || document.documentElement).appendChild(script);
// }
//
// executeInPageContext(`
//         let = yourInventory=UserYou.getInventory(730,2);
//         let = theirInventory=UserYou.getInventory(730,2);
//         console.log(yourInventory.m_rgAssets);
//         console.log(yourInventory.m_rgDescriptions);
//         console.log(theirInventory.m_rgAssets);
//         console.log(theirInventory.m_rgDescriptions);`);


// getInventory("UserYou", 730, 2, function (result) {
//     console.log(result);
// });
//
// function getInventory(user, appid, contextid, callback) {
//     fetchGlobal(user, function(data) {
//         callback(data);
//     }, function(input, param) {
//         input = input[Object.keys(input)[0]];
//
//         console.log(input);
//
//         var output = {};
//
//         var inventory = input.getInventory(param.appid, param.contextid);
//         output.appid = param.appid;
//         output.steamid = input.strSteamId;
//         output.contextid = param.contextid;
//         output.initialized = inventory.initialized;
//         output.elInventoryId = inventory.elInventory.id;
//
//         if(!inventory.rgInventory)
//             return output;
//
//         var keys = Object.keys(inventory.rgInventory);
//
//         for (var j = 0; j < keys.length; j++) {
//             var assetid = keys[j];
//             var description = inventory.rgInventory[assetid];
//
//             output[assetid] = {};
//             output[assetid].markethashname = description.market_hash_name;
//             output[assetid].image = 'https://steamcommunity-a.akamaihd.net/economy/image/' + description.icon_url + '/150x150f';
//
//             if (description.actions) {
//                 for (var k = 0; k < description.actions.length; k++) {
//                     var action = description.actions[k];
//                     if (action.name && action.link) {
//                         output[assetid].inspect = action.link
//                             .replace("%assetid%", assetid)
//                             .replace("%owner_steamid%", input.strSteamId);
//                         break;
//                     }
//                 }
//             }
//         }
//
//         return output;
//     }, {appid: appid, contextid: contextid});
// }
//
// function fetchGlobal(variable, callback, processor, param) {
//     var interval = null;
//
//     var id = 'SteamWizard_Message_' + Date.now() + "_" + Math.floor(Math.random() * 100000);
//     var $element = $('<div>').attr('id', id);
//     $element.appendTo(document.body);
//
//     // Event listener
//     document.addEventListener(id, function listener(e) {
//         if(callback && e.detail) {
//             callback(e.detail);
//             clearInterval(interval);
//
//             /* remove event listener */
//             document.removeEventListener(id, listener);
//
//             /* remove element from dom */
//             $element.remove();
//         }
//     });
//
//     // inject code into "the other side" to talk back to this side;
//     var script = document.createElement('script');
//     //appending text to a function to convert it's src to string only works in Chrome
//     script.textContent = '(' +
//         function(classname, processor, param) {
//             document.getElementById(classname).onclick = function() {
//                 var var_name = this.getAttribute('variable').split(',');
//
//                 var result = {};
//
//                 for(var i=0; i < var_name.length; i++)
//                     result[var_name[i]] = window[var_name[i]];
//
//                 if(processor)
//                     result = processor(result, param);
//
//                 document.dispatchEvent(new CustomEvent(classname, {
//                     detail: result
//                 }));
//             };
//         }
//         + ')("{0}", {1}, {2});'.format(id, processor ? processor : 'undefined', param ? JSON.stringify(param) : 'undefined');
//
//     //cram that sucker in
//     (document.head || document.documentElement).appendChild(script);
//
//     script.remove();
//     $element.attr('variable', variable);
//
//     clearInterval(interval);
//     var counter = 50;
//
//     interval = setInterval(function () {
//         $('#'+id)[0].click();
//
//         if ((counter--) < 1)
//             clearInterval(interval);
//     }, 100);
//
//     $('#'+id)[0].click();
// };




let inBrowserInspectButton0 ='<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect0" href="http://csgo.gallery/" target="_blank"><span>Inspect in Browser...</span></a>';
let inBrowserInspectButton1 ='<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect1" href="http://csgo.gallery/" target="_blank"><span>Inspect in Browser...</span></a>';

let bookmark0 = '<a class="btn_small btn_grey_white_innerfade" id="bookmark0" href="http://csgo.gallery/" target="_blank"><span>Bookmark and notify</span></a>';
let bookmark1 = '<a class="btn_small btn_grey_white_innerfade" id="bookmark1" href="http://csgo.gallery/" target="_blank"><span>Bookmark and notify</span></a>';

let module0 = `<div>
    <div class="descriptor tradability" id="iteminfo0_tradability"><span></span></div>
    <div class="descriptor countdown" id="iteminfo0_countdown"><span></span></div>
</div>`;

let module1 = `<div>
    <div class="descriptor tradability" id="iteminfo1_tradability"><span></span></div>
    <div class="descriptor countdown" id="iteminfo1_countdown"><span></span></div>
</div>`;

let note0 = `<div class="descriptor note" id="note0"></div>`;
let note1 = `<div class="descriptor note" id="note1"></div>`;


let tradable = "<span class='tradable'>Tradable</span>";
let notTradable = "<span class='not_tradable'>Not Tradable</span>";

let dateOnEachItem = "<div class='perItemDate'><span></span></div>";
let dopplerPhase = "<div class='dopplerPhase'><span></span></div>";
let exterior = "<div class='exteriorIndicator'><span></span></div>";

let exteriors1 = `
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

let exteriors0 = `
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

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    if($(".games_list_tab.active").first().attr("href")==="#730"){
        addElements();
    }
    else{
        removeElements();
    }
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
        if(!(response===undefined||response.inventory===undefined||response.inventory===""||response.inventory==="error")){
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
        let activeID = $(".activeInfo")[0].id.split("730_2_")[1]; // gets the asset id of the item that is currently selected.
        let item = getItemByAssetID(activeID);

        //add "other exteriors" links module
        if(!$("#otherExteriors1").length) {
            $("#iteminfo1_item_descriptors").after(exteriors1);
        }
        if(!$("#otherExteriors0").length) {
            $("#iteminfo0_item_descriptors").after(exteriors0);
        }

        //adds "notes" element
        if(!$("#note1").length) {
            $("#iteminfo1_item_descriptors").before(note1);
        }
        if(!$("#note0").length) {
            $("#iteminfo0_item_descriptors").before(note0);
        }

        //hides "tradable after" in one's own inventory
        $("#iteminfo1_item_owner_descriptors").hide();
        $("#iteminfo0_item_owner_descriptors").hide();


        //adds inspect in-browser inspect buttons
        $iteminfo1 = $("#iteminfo1_item_actions");
        if(!$("#inbrowser_inspect1").length){
            $iteminfo1.append(inBrowserInspectButton1)
        }
        $iteminfo0 = $("#iteminfo0_item_actions");
        if(!$("#inbrowser_inspect0").length){
            $iteminfo0.append(inBrowserInspectButton0)
        }

        //adds the correct url to the inspect buttons
        inspectLink = $("#iteminfo1_item_actions .btn_small").first().attr("href");
        $("#inbrowser_inspect1").attr("href", "http://csgo.gallery/" + inspectLink);
        inspectLink = $("#iteminfo0_item_actions .btn_small").first().attr("href");
        $("#inbrowser_inspect0").attr("href", "http://csgo.gallery/" + inspectLink);

        //adds the bookmark buttons
        if(!$("#bookmark1").length){
            $iteminfo1.after(bookmark1)
        }
        if(!$("#bookmark0").length){
            $iteminfo0.after(bookmark0)
        }

        //adds tradability and countdown elements
        if(!$("#iteminfo1_tradability").length){
            $("#bookmark1").after(module1);
        }
        if(!$("#iteminfo0_tradability").length){
            $("#bookmark0").after(module0);
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
    $("#note1").hide();
    $("#note0").hide();
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
    $("#note1").text("Note: " + note);
    $("#note0").text("Note: " + note);
}
