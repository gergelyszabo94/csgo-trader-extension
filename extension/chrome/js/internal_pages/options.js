function addDeleteClickListener(element){
    element.addEventListener('click', (event) => {
        chrome.storage.local.get('customCommentsToReport', (result) => {
            let newCustomComments = [];
            result.customCommentsToReport.forEach(comment => {
                    if (comment.id !== event.target.id) newCustomComments.push(comment)
                }
            );
            chrome.storage.local.set({customCommentsToReport: newCustomComments}, () => {event.target.parentNode.parentNode.removeChild(event.target.parentNode)});
        });
    });
}

trackEvent({
    type: 'pageview',
    action: 'ExtensionOptionsView'
});

// simple checkboxes - toggles

const simpleBinaryOptions = ['itemPricing', 'markScammers','colorfulItems', 'showRealStatus', 'flagScamComments', 'quickDeclineOffer', 'openOfferInTab', 'showPlusRepButton',
    'showReoccButton', 'nsfwFilter', 'hideOtherExtensionPrices', 'updateNotifications', 'switchToOtherInventory', 'autoFloatMarket', 'autoFloatOffer', 'autoFloatInventory', 'telemetryOn', 'tradeOffersLargerItems'];

simpleBinaryOptions.forEach(option => {
   let optionCheckbox = document.getElementById(option);

   chrome.storage.local.get(option, (result) => {optionCheckbox.checked = result[option]});

   optionCheckbox.addEventListener('click', (event) => {
       chrome.storage.local.set({[event.target.id]: event.target.checked}, () => {})
   });
});

// checkboxes - toggles with additional logic

let tabsAPI = document.getElementById('tabsAPI');

chrome.permissions.contains({permissions: ['tabs']}, (result) => {tabsAPI.checked = result});

tabsAPI.addEventListener("click", () =>{
    if (tabsAPI.checked) chrome.permissions.request({permissions: ['tabs']}, (granted) => {tabsAPI.checked = granted});
    else chrome.permissions.remove({permissions: ['tabs']}, (removed) => {});
});

let tradersbump = document.getElementById('tradersBump');

chrome.storage.local.get('tradersBump', (result) => {
    let optionOn = result.tradersBump;
    chrome.permissions.contains({permissions: ['tabs'], origins: ['*://csgotraders.net/*']}, (result) => {
        if (optionOn && result) tradersbump.checked = result;
    });
});

tradersbump.addEventListener("click", () => {
    if (tradersbump.checked){
        chrome.permissions.request({permissions: ['tabs'], origins: ['*://csgotraders.net/*']}, (granted) => {
            tradersbump.checked = granted;
            chrome.storage.local.set({tradersBump: granted}, () => {});
        });
    }
    else chrome.storage.local.set({tradersBump: tradersbump.checked}, () => {});
});

let loungebump = document.getElementById('loungeBump');

chrome.storage.local.get('loungeBump', (result) => {
    let optionOn = result.loungeBump;
    chrome.permissions.contains({permissions: ['tabs'], origins: ['*://csgolounge.com/*']}, (result) => {
        if (optionOn && result) loungeBump.checked = result;
    });
});

loungebump.addEventListener('click', () => {
    if (loungebump.checked){
        chrome.permissions.request({permissions: ['tabs'], origins: ['*://csgolounge.com/*']}, (granted) => {
            loungebump.checked = granted;
            chrome.storage.local.set({loungeBump: granted}, () => {});
        });
    }
    else chrome.storage.local.set({loungeBump: loungebump.checked}, () => {});
});

// textbox modals

repmessage = document.getElementById('reputationMessageValue');
repmessageprint = document.getElementById('reputationMessagePrinted');
repmessagesave = document.getElementById('reputationMessageValueSave');

chrome.storage.local.get(['reputationMessage'], (result) => {
    repmessageprint.textContent = result.reputationMessage.substring(0,8) + '...';
    repmessage.value = result.reputationMessage;
});

repmessagesave.addEventListener('click', () => {
    let newmessage = repmessage.value;
    repmessageprint.textContent = newmessage.substring(0,8) + '...';
    chrome.storage.local.set({reputationMessage: newmessage}, () => {});
});

reoccmessage = document.getElementById('reoccuringMessageValue');
reoccmessageprint = document.getElementById('reoccuringMessagePrinted');
reoccmessagesave = document.getElementById('reoccuringMessageValueSave');

chrome.storage.local.get(['reoccuringMessage'], (result) => {
    reoccmessageprint.textContent = result.reoccuringMessage.substring(0,8) + '...';
    reoccmessage.value = result.reoccuringMessage;
});

reoccmessagesave.addEventListener('click', () => {
    let newmessage = reoccmessage.value;
    reoccmessageprint.textContent = newmessage.substring(0,8) + '...';
    chrome.storage.local.set({reoccuringMessage: newmessage}, () => {});
});

apikey = document.getElementById('steamAPIKeyValue');
apikeyprint = document.getElementById('steamAPIKeyPrinted');
apikeysave = document.getElementById('steamAPIKeyValueSave');

chrome.storage.local.get(['steamAPIKey', 'apiKeyValid'], (result) => {
    if (result.apiKeyValid){
        apikeyprint.textContent = result.steamAPIKey.substring(0,8) + '...';
        apikey.value = result.steamAPIKey;
    }
    else{
        apikeyprint.textContent = 'Not set';
        apikey.value = 'Not set';
    }
});

apikeysave.addEventListener('click', () => {
    let newapikey = apikey.value;
    chrome.runtime.sendMessage({apikeytovalidate: newapikey}, (response) => {
        if(response.valid){
            chrome.storage.local.set({steamAPIKey: newapikey, apiKeyValid: true}, () => {
                apikeyprint.textContent = newapikey.substring(0,8) + '...';
                let warningDiv = document.getElementById('invalidAPIWarning');
                if (warningDiv != null) warningDiv.remove();
                // document.getElementById('steamAPIkeyModal').modal('hide');
                $('#steamAPIkeyModal').modal('hide'); // TODO figure out how to lose jquery here
            });
        }
        else{
            let invalidDiv = document.createElement('div');
            invalidDiv.classList.add('warning');
            invalidDiv.id = 'invalidAPIWarning';
            invalidDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span class="warning">Could not validate your API key, it\'s either incorrect or Steam is down at the moment</span>';
            apikey.parentNode.insertBefore(invalidDiv, apikey.nextSibling);
        }
    });
});

let customComments = document.getElementById('customCommentsToReportValue');
let customCommentsPreviousList = document.getElementById('customCommentsToReportPrevious');
let customCommentsSave = document.getElementById('customCommentsToReportValueSave');

chrome.storage.local.get('customCommentsToReport', (result) => {
    result.customCommentsToReport.forEach(comment => {
        let commentListRowDiv = document.createElement('div');
        let commentListRowElement = document.createElement('span');

        commentListRowElement.innerText = comment.text;
        commentListRowDiv.appendChild(commentListRowElement);

        let customCommentIDs = [];
        customCommentIDs.forEach(comment => {customCommentIDs.push(comment.id)});
        if(!customCommentIDs.includes(comment.id)) {
            let removeCommentElement = document.createElement('span');
            removeCommentElement.innerText = 'Delete';
            removeCommentElement.classList.add('delete');
            removeCommentElement.id = comment.id;

            commentListRowDiv.appendChild(removeCommentElement);

            addDeleteClickListener(removeCommentElement);
        }
        customCommentsPreviousList.appendChild(commentListRowDiv);
    });
});

customCommentsSave.addEventListener('click', () => {
    if (customComments.value !== '' && customComments.value !== null){
        chrome.storage.local.get('customCommentsToReport', (result) => {
            let newCustomComments = result.customCommentsToReport;
            let generatedID = generateRandomString(32);
            newCustomComments.push({
                text: customComments.value,
                id: generatedID
            });
            chrome.storage.local.set({customCommentsToReport: newCustomComments}, () => {
                let commentListRowDiv = document.createElement('div');
                let commentListRowElement = document.createElement('span');
                let removeCommentElement = document.createElement('span');

                commentListRowElement.innerText = customComments.value;

                removeCommentElement.innerText = 'Delete';
                removeCommentElement.classList.add('delete');
                removeCommentElement.id = generatedID;
                addDeleteClickListener(removeCommentElement);

                commentListRowDiv.appendChild(commentListRowElement);
                commentListRowDiv.appendChild(removeCommentElement);

                customCommentsPreviousList.appendChild(commentListRowDiv);

                customComments.value = '';
                $('#customCommentsToReportModal').modal('hide');
            });
        });
    }
    else $('#customCommentsToReportModal').modal('hide');
});

// number inputs
numberoflistings = document.getElementById('numberOfListings');

chrome.storage.local.get('numberOfListings', (result) => {numberoflistings.value = result.numberOfListings});

numberoflistings.addEventListener('input', () => {
    let number = parseInt(this.value);
    if (number < 10) number = 10;
    else if (number > 100) number = 100;
    chrome.storage.local.set({numberOfListings: number}, () => {});
});

//select

let currencySelect = document.getElementById('currency');
let keys = Object.keys(currencies);

for (let key of keys){
    let option = document.createElement('option');
    option.value = currencies[key].short;
    option.text = `${currencies[key].short} - ${currencies[key].long}`;
    currencySelect.add(option);
}

chrome.storage.local.get('currency', (result) => {
    document.querySelector(`#currency [value='${result.currency}']`).selected = true;
});

currencySelect.addEventListener('click', () => {
    let currency = currencySelect.options[currencySelect.selectedIndex].value;
    chrome.storage.local.set({currency: currency}, () => { updateExchangeRates()});
});

let pricingProviderSelect = document.getElementById('pricingProvider');
let aboutTheProvider = document.getElementById('aboutTheProvider');
let pricingModeSelect = document.getElementById('pricingMode');
let aboutTheMode = document.getElementById('aboutTheMode');
let providers = Object.keys(pricingProviders);

for (let provider of providers){
    let option = document.createElement('option');
    option.value = pricingProviders[provider].name;
    option.text = pricingProviders[provider].long;
    pricingProviderSelect.add(option);
}

chrome.storage.local.get(['pricingProvider', 'pricingMode'], (result) => {
    let provider = result.pricingProvider;
    document.querySelector(`#pricingProvider [value='${provider}']`).selected = true;
    aboutTheProvider.innerText = pricingProviders[provider].description;
    let modes = Object.keys(pricingProviders[provider].pricing_modes);

    for (let mode of modes){
        let option = document.createElement('option');
        option.value = pricingProviders[provider].pricing_modes[mode].name;
        option.text = pricingProviders[provider].pricing_modes[mode].long;
        pricingModeSelect.add(option);
    }

    document.querySelector(`#pricingMode [value='${result.pricingMode}']`).selected = true;
    aboutTheMode.innerText = pricingProviders[provider].pricing_modes[result.pricingMode].description;
});

pricingProviderSelect.addEventListener('click', () => {
    let provider = pricingProviderSelect.options[pricingProviderSelect.selectedIndex].value;
    aboutTheProvider.innerText = pricingProviders[provider].description;
    chrome.storage.local.get('pricingProvider', (result) => {
        if (provider !== result.pricingProvider){
            pricingModeSelect.innerHTML = '';
            let modes = Object.keys(pricingProviders[provider].pricing_modes);

            for (let mode of modes){
                let option = document.createElement('option');
                option.value = pricingProviders[provider].pricing_modes[mode].name;
                option.text = pricingProviders[provider].pricing_modes[mode].long;
                pricingModeSelect.add(option);
            }

            if (provider === pricingProviders.csgobackpack.name){
                document.querySelector('#pricingMode [value="7_days_average"]').selected = true;
            }
            else if (provider === pricingProviders.bitskins.name){
                document.querySelector('#pricingMode [value="bitskins"]').selected = true;
            }

            let selectedMode = pricingModeSelect.options[pricingModeSelect.selectedIndex].value;
            aboutTheMode.innerText = pricingProviders[provider].pricing_modes[selectedMode].description;
            chrome.storage.local.set({pricingProvider: provider, pricingMode: selectedMode}, () => {updatePrices()});
        }
    });
});

pricingModeSelect.addEventListener('click', () => {
    let mode = pricingModeSelect.options[pricingModeSelect.selectedIndex].value;
    let provider = pricingProviderSelect.options[pricingProviderSelect.selectedIndex].value;
    aboutTheMode.innerText = pricingProviders[provider].pricing_modes[mode].description;
    chrome.storage.local.set({pricingMode: mode}, () => {updatePrices()});
});


let inventorySortingSelect = document.getElementById('inventorySortingMethod');
let inventorySortingModes = Object.keys(sortingModes);

for (let modes of inventorySortingModes){
    let option = document.createElement('option');
    option.value = sortingModes[modes].key;
    option.text = sortingModes[modes].name;
    inventorySortingSelect.add(option);
}

chrome.storage.local.get('inventorySortingMode', (result) => {
    document.querySelector(`#inventorySortingMethod [value='${result.inventorySortingMode}']`).selected = true;
});

inventorySortingSelect.addEventListener('click', () => {
    let inventorySortingMode = inventorySortingSelect.options[inventorySortingSelect.selectedIndex].value;
    chrome.storage.local.set({inventorySortingMode: inventorySortingMode}, () => {});
});

let offerSortingSelect = document.getElementById('offerSortingMode');
let offerSortingModes = Object.keys(sortingModes);

for (let modes of offerSortingModes){
    let option = document.createElement('option');
    option.value = sortingModes[modes].key;
    option.text = sortingModes[modes].name;
    offerSortingSelect.add(option);
}

chrome.storage.local.get('offerSortingMode', (result) => {
    document.querySelector(`#offerSortingMode [value='${result.offerSortingMode}']`).selected = true;
});

offerSortingSelect.addEventListener('click', () => {
    let offerSortingMode = offerSortingSelect.options[offerSortingSelect.selectedIndex].value;
    chrome.storage.local.set({offerSortingMode: offerSortingMode}, () => {});
});


// list

let popupLinksToShow = document.getElementById('popupLinksToShow');

chrome.storage.local.get('popupLinks', (result) => {
    result.popupLinks.forEach(link => {
        let linkDiv = document.createElement('div');
        let linkElement = document.createElement('span');

        linkElement.id = link.id;
        linkElement.innerText = link.name;
        if(link.active) linkElement.classList.add('active');

        linkDiv.appendChild(linkElement);

        linkElement.addEventListener('click', (event) =>{
            // does not allow to remove the options one so users can always find their way back here
            if(event.target.id !== 'options'){
                event.target.classList.toggle('active');
                chrome.storage.local.get('popupLinks', (result) => {
                    result.popupLinks.forEach(link =>{if(link.id === event.target.id) link.active =! link.active});
                    chrome.storage.local.set({popupLinks: result.popupLinks}, () => {});
                });
            }
        });

        let defaultPopupLinkIDs = [];
        defaultPopupLinks.forEach(link =>{defaultPopupLinkIDs.push(link.id)});
        if(!defaultPopupLinkIDs.includes(link.id)) {
            let removeLinkElement = document.createElement('span');
            removeLinkElement.innerText = 'Delete';
            removeLinkElement.classList.add('delete');
            removeLinkElement.id = link.id;

            linkDiv.appendChild(removeLinkElement);

            removeLinkElement.addEventListener('click', (event) => {
                chrome.storage.local.get('popupLinks', (result) => {
                    let newpopupLinks = [];
                    result.popupLinks.forEach(link => {
                            if (link.id !== event.target.id) newpopupLinks.push(link)
                        }
                    );
                    chrome.storage.local.set({popupLinks: newpopupLinks}, () => {location.reload()});
                });
            });
        }

        popupLinksToShow.appendChild(linkDiv);
    });
});

// form

document.getElementById('savePopupLink').addEventListener('click', () =>{
    let linkName = document.getElementById('popupLinkName').value;
    let linkID = linkName.replace(/\W/g, '').toLowerCase();  // removes non-alphanumeric chars - https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string-having-trouble-with-the-char
    let linkURL = document.getElementById('popupLinURL').value;
    chrome.storage.local.get('popupLinks', (result) => {
        result.popupLinks.push({
            id: linkID,
            name: linkName,
            url: linkURL,
            active: true
        });
        chrome.storage.local.set({popupLinks: result.popupLinks}, () => {location.reload();});
    });
});

// export preferences

let settingsStorageKeys = [];
for (let key in storageKeys) if (!nonSettingStorageKeys.includes(key)) settingsStorageKeys.push(key);

chrome.storage.local.get(settingsStorageKeys, (result) =>{

    let JSONContent = 'data:application/json,';

    let preferencesJSON = {
        version: 1,
        type: "preferences",
        preferences: {}
    };

    settingsStorageKeys.forEach(setting => {preferencesJSON.preferences[setting] = result[setting]});

    JSONContent += encodeURIComponent(JSON.stringify(preferencesJSON));

    let exportPreferences = document.getElementById('export_preferences');
    exportPreferences.setAttribute('href', JSONContent);
});

// export bookmarks

chrome.storage.local.get('bookmarks', (result) =>{

    let JSONContent = 'data:application/json,';

    let bookmarksJSON= {
        version: 1,
        bookmarks: result.bookmarks
    };

    JSONContent += encodeURIComponent(JSON.stringify(bookmarksJSON));

    let exportBookmarks = document.getElementById('export_bookmarks');
    exportBookmarks.setAttribute('href', JSONContent);
});

//import preferences

let importPrefInput = document.getElementById('import_preferences');

importPrefInput.addEventListener('change', event => {
    let file = event.target.files[0];
    let fr = new FileReader();

    fr.addEventListener('load', event => {
        let inputAsJSON = JSON.parse(event.target.result);
        if (parseInt(inputAsJSON.version) === 1) {
            settingsStorageKeys.forEach(setting => {
                if (inputAsJSON.preferences[setting] !== undefined) chrome.storage.local.set({[setting]: inputAsJSON.preferences[setting]}, ()=>{});
            });
            location.reload();
        }
        else console.log(inputAsJSON.version);
    });
    fr.readAsText(file);
});

//import bookmarks

let importBookmarksInput = document.getElementById('import_bookmarks');

importBookmarksInput.addEventListener('change', event => {
    let file = event.target.files[0];
    let fr = new FileReader();

    fr.addEventListener('load', event => {
        let inputAsJSON = JSON.parse(event.target.result);
        if (parseInt(inputAsJSON.version) === 1) {
            inputAsJSON.bookmarks.forEach( (bookmark) => {
                chrome.runtime.sendMessage({setAlarm: {name:  bookmark.itemInfo.assetid, when: bookmark.notifTime}}, (response) => {location.href = 'bookmarks.html'});
            });
            if (inputAsJSON.bookmarks !== undefined) chrome.storage.local.set({bookmarks: inputAsJSON.bookmarks}, ()=>{});
        }
        else console.log(inputAsJSON.version);
    });
    fr.readAsText(file);
});