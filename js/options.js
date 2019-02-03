$quckdecline = $("#quickDeclineOffers");

chrome.storage.sync.get(['quickDeclineOffer'], function(result) {
    if(result.quickDeclineOffer){
        $quckdecline.click();
    }
});


$quckdecline.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({quickDeclineOffer: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({quickDeclineOffer: false}, function() {
        });
    }
});

$openintab = $("#openOfferInTab");

chrome.storage.sync.get(['openOfferInTab'], function(result) {
    if(result.openOfferInTab){
        $openintab.click();
    }
});

$openintab.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({openOfferInTab: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({openOfferInTab: false}, function() {
        });
    }
});