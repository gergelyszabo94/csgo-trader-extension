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


$showreoccbutton = $("#showReoccButton");

chrome.storage.sync.get(['showReoccButton'], function(result) {
    if(result.showReoccButton){
        $showreoccbutton.click();
    }
});

$showreoccbutton.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({showReoccButton: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({showReoccButton: false}, function() {
        });
    }
});


$reoccmessage = $("#reoccuringMessage");

chrome.storage.sync.get(['reoccuringMessage'], function(result) {
    if(result.reoccuringMessage!==""){
        $reoccmessage.val(result.reoccuringMessage);
    }
    else{
        $reoccmessage.val("I don't have other accounts. If someone adds you with my name and picture they are scammers.");
    }
});


$reoccmessage.on("change keyup paste", function(){
    let newmessage = $reoccmessage.val();
    chrome.storage.sync.set({reoccuringMessage: newmessage}, function() {
    });
});

$nsfw = $("#nsfw");

chrome.storage.sync.get(['nsfwFilter'], function(result) {
    if(result.nsfwFilter){
        $nsfw.click();
    }
});

$nsfw.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({nsfwFilter: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({nsfwFilter: false}, function() {
        });
    }
});


$flagcomments = $("#flagScamComments");

chrome.storage.sync.get(['flagScamComments'], function(result) {
    if(result.flagScamComments){
        $flagcomments.click();
    }
});

$flagcomments.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({flagScamComments: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({flagScamComments: false}, function() {
        });
    }
});