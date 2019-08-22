chrome.runtime.sendMessage({badgetext: ""}, function(response) {});

let version = chrome.runtime.getManifest().version;
$("#version").text(version);

// check if the popup option should be shown then show/hide depending on if it should work

chrome.storage.local.get('aboutPopup', function(result){ 
    let optionOn = result.aboutPopup;
    if (optionOn){
        $("#about").show();
    } else {
        $("#about").hide();
    }
});

chrome.storage.local.get('optionsPopup', function(result){ 
    let optionOn = result.optionsPopup;
    if (optionOn){
        $("#options").show();
    } else {
        $("#options").hide();
    }
});


chrome.storage.local.get('changelogPopup', function(result){ 
    let optionOn = result.changelogPopup;
    if (optionOn){
        $("#changelog").show();
    } else {
        $("#changelog").hide();
    }
});

chrome.storage.local.get('bookmarksPopup', function(result){ 
    let optionOn = result.bookmarksPopup;
    if (optionOn){
        $("#bookmarks").show();
    } else {
        $("#bookmarks").hide();
    }
});

chrome.storage.local.get('inventoryPopup', function(result){ 
    let optionOn = result.inventoryPopup;
    if (optionOn){
        $("#inventory").show();
    } else {
        $("#inventory").hide();
    }
});

chrome.storage.local.get('tradeofferPopup', function(result){ 
    let optionOn = result.tradeofferPopup;
    if (optionOn){
        $("#tradeoffer").show();
    } else {
        $("#tradeoffer").hide();
    }
});
