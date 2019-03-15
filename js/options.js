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



$repmessage = $("#reputationMessageValue");
$repmessageprint = $("#reputationMessagePrinted");
$repmessagesave = $("#reputationMessageValueSave");

chrome.storage.sync.get(['reputationMessage'], function(result) {
    $repmessageprint.text(result.reputationMessage.substring(0,8)+"...");
    $repmessage.val(result.reputationMessage);
});

$repmessagesave.click(function(){
    let newmessage = $repmessage.val();
    $repmessageprint.text(newmessage.substring(0,8)+"...");
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

$reoccmessage = $("#reoccuringMessageValue");
$reoccmessageprint = $("#reoccuringMessagePrinted");
$reoccmessagesave = $("#reoccuringMessageValueSave");

chrome.storage.sync.get(['reoccuringMessage'], function(result) {
    $reoccmessageprint.text(result.reoccuringMessage.substring(0,8)+"...");
    $reoccmessage.val(result.reoccuringMessage);
});

$reoccmessagesave.click(function(){
    let newmessage = $reoccmessage.val();
    $reoccmessageprint.text(newmessage.substring(0,8)+"...");
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

$apikey = $("#steamAPIKeyValue");
$apikeyprint = $("#steamAPIKeyPrinted");
$apikeysave = $("#steamAPIKeyValueSave");

chrome.storage.sync.get(['steamAPIKey', 'apiKeyValid'], function(result) {
    if(result.apiKeyValid){
        $apikeyprint.text(result.steamAPIKey.substring(0,8)+"...");
        $apikey.val(result.steamAPIKey);
    }
    else{
        $apikeyprint.text("Not set");
        $apikey.val("Not set");
    }
});


$apikeysave.click(function(){
    let newapikey = $apikey.val();
    chrome.runtime.sendMessage({apikeytovalidate: newapikey}, function(response) {
        if(response.valid){
            chrome.storage.sync.set({steamAPIKey: newapikey, apiKeyValid: true}, function() {
                $apikeyprint.text(newapikey.substring(0,8)+"...");
                $("#invalidAPIWarning").remove();
                $("#steamAPIkeyModal").modal("hide");
            });
        }
        else{
            let invalidWarning = `
            <div id="invalidAPIWarning" class="warning"><i class="fas fa-exclamation-triangle"></i> <span class="warning">Could not validate your API key, it's either incorrect or Steam is down at the moment</span></div>
            `;
            $apikey.after(invalidWarning);
        }
    });
});

$showrealstatus = $("#showRealStatus");

chrome.storage.sync.get(['showRealStatus'], function(result) {
    if(result.showRealStatus){
        $showrealstatus.click();
    }
});

$showrealstatus.click(function() {
    if(this.checked) {
        chrome.storage.sync.set({showRealStatus: true}, function() {
        });
    }
    else{
        chrome.storage.sync.set({showRealStatus: false}, function() {
        });
    }
});