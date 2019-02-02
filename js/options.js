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
        console.log("checked");
    }
    else{
        chrome.storage.sync.set({quickDeclineOffer: false}, function() {
        });
        console.log("unchecked");
    }
});