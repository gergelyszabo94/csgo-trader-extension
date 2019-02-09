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




$showrepbutton = $("#showPlusRepButton");

chrome.storage.sync.get(['showPlusRepButton'], function(result) {
    if(result.showPlusRepButton){
        $showrepbutton.click();
    }
});

$showrepbutton.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({showPlusRepButton: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({showPlusRepButton: false}, function() {
        });
    }
});


$repmessage = $("#reputationMessage");

chrome.storage.sync.get(['reputationMessage'], function(result) {
    if(result.reputationMessage!==""){
        $repmessage.val(result.reputationMessage);
    }
    else{
        $repmessage.val("+rep");
    }
});


$repmessage.on("change keyup paste", function(){
    let newmessage = $repmessage.val();
    chrome.storage.sync.set({reputationMessage: newmessage}, function() {
    });
});