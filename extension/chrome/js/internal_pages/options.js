//simple checkboxes - toggles

let pricing = document.getElementById("itemPricing");

chrome.storage.local.get('itemPricing', function(result) {
    pricing.checked = result.itemPricing;
});

pricing.addEventListener("click", function () {
    chrome.storage.local.set({itemPricing: pricing.checked}, function() {});
});

let markscammers = document.getElementById("markScammers");

chrome.storage.local.get('markScammers', function(result) {
    markscammers.checked = result.markScammers;
});

markscammers.addEventListener("click", function () {
    chrome.storage.local.set({markScammers: markscammers.checked}, function() {});
});

let colorfulitems = document.getElementById("colorfulItems");

chrome.storage.local.get('colorfulItems', function(result) {
    colorfulitems.checked = result.colorfulItems;
});

colorfulitems.addEventListener("click", function () {
    chrome.storage.local.set({colorfulItems: colorfulitems.checked}, function() {});
});

let showrealstatus = document.getElementById("showRealStatus");

chrome.storage.local.get('showRealStatus', function(result) {
    showrealstatus.checked = result.showRealStatus;
});

showrealstatus.addEventListener("click", function () {
    chrome.storage.local.set({showRealStatus: showrealstatus.checked}, function() {});
});

let flagcomments = document.getElementById("flagScamComments");

chrome.storage.local.get('flagScamComments', function(result) {
    flagcomments.checked = result.flagScamComments;
});

flagcomments.addEventListener("click", function () {
    chrome.storage.local.set({flagScamComments: flagcomments.checked}, function() {});
});

let quickdecline = document.getElementById("quickDeclineOffers");

chrome.storage.local.get('quickDeclineOffer', function(result) {
    quickdecline.checked = result.quickDeclineOffer;
});

quickdecline.addEventListener("click", function () {
    chrome.storage.local.set({quickDeclineOffer: quickdecline.checked}, function() {});
});

let openintab = document.getElementById("openOfferInTab");

chrome.storage.local.get('openOfferInTab', function(result) {
    openintab.checked = result.openOfferInTab;
});

openintab.addEventListener("click", function () {
    chrome.storage.local.set({openOfferInTab: openintab.checked}, function() {});
});

let showrepbutton = document.getElementById("showPlusRepButton");

chrome.storage.local.get('showPlusRepButton', function(result) {
    showrepbutton.checked = result.showPlusRepButton;
});

showrepbutton.addEventListener("click", function () {
    chrome.storage.local.set({showPlusRepButton: showrepbutton.checked}, function() {});
});

let showreoccbutton = document.getElementById("showReoccButton");

chrome.storage.local.get('showReoccButton', function(result) {
    showreoccbutton.checked = result.showReoccButton;
});

showreoccbutton.addEventListener("click", function () {
    chrome.storage.local.set({showReoccButton: showreoccbutton.checked}, function() {});
});

let nsfw = document.getElementById("nsfw");

chrome.storage.local.get('nsfwFilter', function(result) {
    nsfw.checked = result.nsfwFilter;
});

nsfw.addEventListener("click", function () {
    chrome.storage.local.set({nsfwFilter: nsfw.checked}, function() {});
});

let hideotherprices = document.getElementById("hideOtherExtensionPrices");

chrome.storage.local.get('hideOtherExtensionPrices', function(result) {
    hideotherprices.checked = result.hideOtherExtensionPrices;
});

hideotherprices.addEventListener("click", function () {
    chrome.storage.local.set({hideOtherExtensionPrices: hideotherprices.checked}, function() {});
});

let updatenotifications = document.getElementById("updateNotifications");

chrome.storage.local.get('updateNotifications', function(result) {
    updatenotifications.checked = result.updateNotifications;
});

updatenotifications.addEventListener("click", function () {
    chrome.storage.local.set({updateNotifications: updatenotifications.checked}, function() {});
});

let switchToOtherInventory = document.getElementById("switchToOtherInventory");

chrome.storage.local.get('switchToOtherInventory', (result) => {
    switchToOtherInventory.checked = result.switchToOtherInventory;
});

switchToOtherInventory.addEventListener("click", () => {
    chrome.storage.local.set({switchToOtherInventory: switchToOtherInventory.checked}, () => {});
});

// checkboxes - toggles with additional logic

let tabsAPI = document.getElementById("tabsAPI");

chrome.permissions.contains({permissions: ['tabs']}, function(result) {
    tabsAPI.checked = result;
});

tabsAPI.addEventListener("click", function () {
    if(tabsAPI.checked){
        chrome.permissions.request({permissions: ['tabs']}, function(granted) {
            tabsAPI.checked = granted;
        });
    }
    else{
        chrome.permissions.remove({permissions: ['tabs']}, function(removed) {});
    }
});

let tradersbump = document.getElementById("tradersBump");

chrome.storage.local.get('tradersBump', function(result) {
    let optionOn = result.tradersBump;
    chrome.permissions.contains({permissions: ['tabs'], origins: ['*://csgotraders.net/*']}, function(result) {
        if(optionOn && result){
            tradersbump.checked = result;
        }
    });
});

tradersbump.addEventListener("click", function () {
    if(tradersbump.checked){
        chrome.permissions.request({permissions: ['tabs'], origins: ['*://csgotraders.net/*']}, function(granted) {
            tradersbump.checked = granted;
            chrome.storage.local.set({tradersBump: granted}, function() {});
        });
    }
    else{
        chrome.storage.local.set({tradersBump: tradersbump.checked}, function() {});
    }
});

let loungebump = document.getElementById("loungeBump");

chrome.storage.local.get('loungeBump', function(result) {
    let optionOn = result.loungeBump;
    chrome.permissions.contains({permissions: ['tabs'], origins: ['*://csgolounge.com/*']}, function(result) {
        if(optionOn && result){
            loungeBump.checked = result;
        }
    });
});

loungebump.addEventListener("click", function () {
    chrome.storage.local.set({loungeBump: loungebump.checked}, function() {});
});

loungebump.addEventListener("click", function () {
    if(loungebump.checked){
        chrome.permissions.request({permissions: ['tabs'], origins: ['*://csgolounge.com/*']}, function(granted) {
            loungebump.checked = granted;
            chrome.storage.local.set({loungebump: granted}, function() {});
        });
    }
    else{
        chrome.storage.local.set({loungebump: loungebump.checked}, function() {});
    }
});

// textbox modals

repmessage = document.getElementById("reputationMessageValue");
repmessageprint = document.getElementById("reputationMessagePrinted");
repmessagesave = document.getElementById("reputationMessageValueSave");

chrome.storage.local.get(['reputationMessage'], function(result) {
    repmessageprint.textContent = result.reputationMessage.substring(0,8)+"...";
    repmessage.value = result.reputationMessage;
});

repmessagesave.addEventListener("click", function () {
    let newmessage = repmessage.value;
    repmessageprint.textContent = newmessage.substring(0,8)+"...";
    chrome.storage.local.set({reputationMessage: newmessage}, function() {});
});

reoccmessage = document.getElementById("reoccuringMessageValue");
reoccmessageprint = document.getElementById("reoccuringMessagePrinted");
reoccmessagesave = document.getElementById("reoccuringMessageValueSave");

chrome.storage.local.get(['reoccuringMessage'], function(result) {
    reoccmessageprint.textContent = result.reoccuringMessage.substring(0,8)+"...";
    reoccmessage.value = result.reoccuringMessage;
});

reoccmessagesave.addEventListener("click", function () {
    let newmessage = reoccmessage.value;
    reoccmessageprint.textContent = newmessage.substring(0,8)+"...";
    chrome.storage.local.set({reoccuringMessage: newmessage}, function() {});
});

apikey = document.getElementById("steamAPIKeyValue");
apikeyprint = document.getElementById("steamAPIKeyPrinted");
apikeysave = document.getElementById("steamAPIKeyValueSave");

chrome.storage.local.get(['steamAPIKey', 'apiKeyValid'], function(result) {
    if(result.apiKeyValid){
        apikeyprint.textContent = result.steamAPIKey.substring(0,8)+"...";
        apikey.value = result.steamAPIKey;
    }
    else{
        apikeyprint.textContent = "Not set";
        apikey.value = "Not set";
    }
});

apikeysave.addEventListener("click", function () {
    let newapikey = apikey.value;
    chrome.runtime.sendMessage({apikeytovalidate: newapikey}, function(response) {
        if(response.valid){
            chrome.storage.local.set({steamAPIKey: newapikey, apiKeyValid: true}, function() {
                apikeyprint.textContent = newapikey.substring(0,8)+"...";
                let warningDiv = document.getElementById("invalidAPIWarning");
                if(warningDiv != null){
                    warningDiv.remove();
                }
                //document.getElementById("steamAPIkeyModal").modal("hide");
                $("#steamAPIkeyModal").modal("hide"); //TODO figure out how to lose jquery here
            });
        }
        else{
            let invalidDiv = document.createElement("div");
            invalidDiv.classList.add("warning");
            invalidDiv.id="invalidAPIWarning";
            invalidDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span class="warning">Could not validate your API key, it\'s either incorrect or Steam is down at the moment</span>';
            apikey.parentNode.insertBefore(invalidDiv, apikey.nextSibling);
        }
    });
});

// number inputs
numberoflistings = document.getElementById("numberOfListings");

chrome.storage.local.get('numberOfListings', function(result) {numberoflistings.value = result.numberOfListings});

numberoflistings.addEventListener("input", function () {
    let number = parseInt(this.value);
    if(number<10){
        number = 10;
    }
    else if(number>100){
        number = 100;
    }
    chrome.storage.local.set({numberOfListings: number}, function() {});
});

//select

let currencySelect = document.getElementById("currency");

let keys = Object.keys(currencies);
for (let key of keys){
    let option = document.createElement("option");
    option.value = currencies[key].short;
    option.text = currencies[key].short + " - " + currencies[key].long;
    currencySelect.add(option);
}

chrome.storage.local.get('currency', function(result) {
    document.querySelector('#currency [value="' + result.currency + '"]').selected = true;
});

currencySelect.addEventListener("click", function () {
    let currency = currencySelect.options[currencySelect.selectedIndex].value;
    chrome.storage.local.set({currency: currency}, function() {
        updateExchangeRates();
    });
});

let pricingProviderSelect = document.getElementById("pricingProvider");
let aboutTheProvider = document.getElementById("aboutTheProvider");
let pricingModeSelect = document.getElementById("pricingMode");
let aboutTheMode = document.getElementById("aboutTheMode");
let providers = Object.keys(pricingProviders);
for (let provider of providers){
    let option = document.createElement("option");
    option.value = pricingProviders[provider].name;
    option.text = pricingProviders[provider].long;
    pricingProviderSelect.add(option);
}

chrome.storage.local.get(['pricingProvider', 'pricingMode'], function(result) {
    let provider = result.pricingProvider;
    document.querySelector('#pricingProvider [value="' + provider + '"]').selected = true;
    aboutTheProvider.innerText = pricingProviders[provider].description;
    let modes = Object.keys(pricingProviders[provider].pricing_modes);
    for (let mode of modes){
        let option = document.createElement("option");
        option.value = pricingProviders[provider].pricing_modes[mode].name;
        option.text = pricingProviders[provider].pricing_modes[mode].long;
        pricingModeSelect.add(option);
    }
    document.querySelector('#pricingMode [value="' + result.pricingMode + '"]').selected = true;
    aboutTheMode.innerText = pricingProviders[provider].pricing_modes[result.pricingMode].description;
});

pricingProviderSelect.addEventListener("click", function () {
    let provider = pricingProviderSelect.options[pricingProviderSelect.selectedIndex].value;
    aboutTheProvider.innerText = pricingProviders[provider].description;
    chrome.storage.local.get('pricingProvider', function(result) {
        if(provider !== result.pricingProvider){
            pricingModeSelect.innerHTML = "";
            let modes = Object.keys(pricingProviders[provider].pricing_modes);
            for (let mode of modes){
                let option = document.createElement("option");
                option.value = pricingProviders[provider].pricing_modes[mode].name;
                option.text = pricingProviders[provider].pricing_modes[mode].long;
                pricingModeSelect.add(option);
            }
            if(provider === pricingProviders.csgobackpack.name){
                document.querySelector('#pricingMode [value="7_days_average"]').selected = true;
            }
            else if(provider === pricingProviders.bitskins.name){
                document.querySelector('#pricingMode [value="bitskins"]').selected = true;
            }
            let selectedMode = pricingModeSelect.options[pricingModeSelect.selectedIndex].value;
            aboutTheMode.innerText = pricingProviders[provider].pricing_modes[selectedMode].description;
            chrome.storage.local.set({pricingProvider: provider, pricingMode: selectedMode}, function() {
                updatePrices();
            });
        }
    });
});

pricingModeSelect.addEventListener("click", function () {
    let mode = pricingModeSelect.options[pricingModeSelect.selectedIndex].value;
    let provider = pricingProviderSelect.options[pricingProviderSelect.selectedIndex].value;
    aboutTheMode.innerText = pricingProviders[provider].pricing_modes[mode].description;
    chrome.storage.local.set({pricingMode: mode}, function() {
        updatePrices();
    });
});


let inventorySortingSelect = document.getElementById("inventorySortingMethod");

let inventorySortingModes = Object.keys(sortingModes);
for (let modes of inventorySortingModes){
    let option = document.createElement("option");
    option.value = sortingModes[modes].key;
    option.text = sortingModes[modes].name;
    inventorySortingSelect.add(option);
}

chrome.storage.local.get('inventorySortingMode', function(result) {
    document.querySelector('#inventorySortingMethod [value="' + result.inventorySortingMode + '"]').selected = true;
});

inventorySortingSelect.addEventListener("click", function () {
    let inventorySortingMode = inventorySortingSelect.options[inventorySortingSelect.selectedIndex].value;
    chrome.storage.local.set({inventorySortingMode: inventorySortingMode}, function() {});
});

let offerSortingSelect = document.getElementById("offerSortingMode");

let offerSortingModes = Object.keys(sortingModes);
for (let modes of inventorySortingModes){
    let option = document.createElement("option");
    option.value = sortingModes[modes].key;
    option.text = sortingModes[modes].name;
    offerSortingSelect.add(option);
}

chrome.storage.local.get('offerSortingMode', function(result) {
    document.querySelector('#offerSortingMode [value="' + result.offerSortingMode + '"]').selected = true;
});

offerSortingSelect.addEventListener("click", function () {
    let offerSortingMode = offerSortingSelect.options[offerSortingSelect.selectedIndex].value;
    chrome.storage.local.set({offerSortingMode: offerSortingMode}, function() {});
});


// list

let popupLinksToShow = document.getElementById('popupLinksToShow');

chrome.storage.local.get('popupLinks', (result) => {
    result.popupLinks.forEach(link =>{
        let linkElement = document.createElement('li');
        linkElement.id = link.id;
        linkElement.innerText = link.name;
        if(link.active) linkElement.classList.add('active');

        linkElement.addEventListener('click', (event) =>{
            // does not allow to remove the options one so users can always find their way back here
            if(event.target.id !== 'options'){
                event.target.classList.toggle('active');
                chrome.storage.local.get('popupLinks', (result) =>{
                    result.popupLinks.forEach(link =>{if(link.id === event.target.id) link.active =! link.active});
                    chrome.storage.local.set({popupLinks: result.popupLinks}, () =>{});
                });
            }
        });

        popupLinksToShow.appendChild(linkElement);
    });
});
