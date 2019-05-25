$quckdecline = $("#quickDeclineOffers");

chrome.storage.local.get(['quickDeclineOffer'], function(result) {
    if(result.quickDeclineOffer){
        $quckdecline.prop("checked", true);
    }
});

$quckdecline.click(function() {
    if(this.checked) {
        chrome.storage.local.set({quickDeclineOffer: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({quickDeclineOffer: false}, function() {
        });
    }
});



$openintab = $("#openOfferInTab");

chrome.storage.local.get(['openOfferInTab'], function(result) {
    if(result.openOfferInTab){
        $openintab.prop("checked", true);
    }
});

$openintab.click(function() {
    if(this.checked) {
        chrome.storage.local.set({openOfferInTab: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({openOfferInTab: false}, function() {
        });
    }
});




$showrepbutton = $("#showPlusRepButton");

chrome.storage.local.get(['showPlusRepButton'], function(result) {
    if(result.showPlusRepButton){
        $showrepbutton.prop("checked", true);
    }
});

$showrepbutton.click(function() {
    if(this.checked) {
        chrome.storage.local.set({showPlusRepButton: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({showPlusRepButton: false}, function() {
        });
    }
});



$repmessage = $("#reputationMessageValue");
$repmessageprint = $("#reputationMessagePrinted");
$repmessagesave = $("#reputationMessageValueSave");

chrome.storage.local.get(['reputationMessage'], function(result) {
    $repmessageprint.text(result.reputationMessage.substring(0,8)+"...");
    $repmessage.val(result.reputationMessage);
});

$repmessagesave.click(function(){
    let newmessage = $repmessage.val();
    $repmessageprint.text(newmessage.substring(0,8)+"...");
    chrome.storage.local.set({reputationMessage: newmessage}, function() {
    });
});


$showreoccbutton = $("#showReoccButton");

chrome.storage.local.get(['showReoccButton'], function(result) {
    if(result.showReoccButton){
        $showreoccbutton.prop("checked", true);
    }
});

$showreoccbutton.click(function() {
    if(this.checked) {
        chrome.storage.local.set({showReoccButton: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({showReoccButton: false}, function() {
        });
    }
});

$reoccmessage = $("#reoccuringMessageValue");
$reoccmessageprint = $("#reoccuringMessagePrinted");
$reoccmessagesave = $("#reoccuringMessageValueSave");

chrome.storage.local.get(['reoccuringMessage'], function(result) {
    $reoccmessageprint.text(result.reoccuringMessage.substring(0,8)+"...");
    $reoccmessage.val(result.reoccuringMessage);
});

$reoccmessagesave.click(function(){
    let newmessage = $reoccmessage.val();
    $reoccmessageprint.text(newmessage.substring(0,8)+"...");
    chrome.storage.local.set({reoccuringMessage: newmessage}, function() {
    });
});

$nsfw = $("#nsfw");

chrome.storage.local.get(['nsfwFilter'], function(result) {
    if(result.nsfwFilter){
        $nsfw.prop("checked", true);
    }
});

$nsfw.click(function() {
    if(this.checked) {
        chrome.storage.local.set({nsfwFilter: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({nsfwFilter: false}, function() {
        });
    }
});


$flagcomments = $("#flagScamComments");

chrome.storage.local.get(['flagScamComments'], function(result) {
    if(result.flagScamComments){
        $flagcomments.prop("checked", true);
    }
});

$flagcomments.click(function() {
    if(this.checked) {
        chrome.storage.local.set({flagScamComments: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({flagScamComments: false}, function() {
        });
    }
});

$apikey = $("#steamAPIKeyValue");
$apikeyprint = $("#steamAPIKeyPrinted");
$apikeysave = $("#steamAPIKeyValueSave");

chrome.storage.local.get(['steamAPIKey', 'apiKeyValid'], function(result) {
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
            chrome.storage.local.set({steamAPIKey: newapikey, apiKeyValid: true}, function() {
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

chrome.storage.local.get(['showRealStatus'], function(result) {
    if(result.showRealStatus){
        $showrealstatus.prop("checked", true);
    }
});

$showrealstatus.click(function() {
    if(this.checked) {
        chrome.storage.local.set({showRealStatus: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({showRealStatus: false}, function() {
        });
    }
});

$tabsAPI = $("#tabsAPI");

chrome.permissions.contains({
    permissions: ['tabs']
}, function(result) {
    if (result) {
        $tabsAPI.prop("checked", true);
    }
    else{
        $tabsAPI.prop("checked", false);
    }
});

$tabsAPI.click(function() {
    if(this.checked) {
        chrome.permissions.request({
            permissions: ['tabs']
        }, function(granted) {
            if (granted) {}
            else {
                $tabsAPI.prop("checked", false);
            }
        });
    }
    else{
        chrome.permissions.remove({
            permissions: ['tabs']
        }, function(removed) {});
    }
});

$colorfulitems = $("#colorfulItems");

chrome.storage.local.get(['colorfulItems'], function(result) {
    if(result.colorfulItems){
        $colorfulitems.prop("checked", true);
    }
});

$colorfulitems.click(function() {
    if(this.checked) {
        chrome.storage.local.set({colorfulItems: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({colorfulItems: false}, function() {
        });
    }
});

$loungebump = $("#loungeBump");

chrome.storage.local.get(['loungeBump'], function(result) {
    if(result.loungeBump){
        $loungebump.prop("checked", true);
    }
});

$loungebump.click(function() {
    if(this.checked) {
        chrome.storage.local.set({loungeBump: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({loungeBump: false}, function() {
        });
    }
});

$tradersbump = $("#tradersBump");

chrome.storage.local.get(['tradersBump'], function(result) {
    if(result.tradersBump){
        $tradersbump.prop("checked", true);
    }
});

$tradersbump.click(function() {
    if(this.checked) {
        chrome.storage.local.set({tradersBump: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({tradersBump: false}, function() {
        });
    }
});

$markscammers = $("#markScammers");

chrome.storage.local.get(['markScammers'], function(result) {
    if(result.markScammers){
        $markscammers.prop("checked", true);
    }
});

$markscammers.click(function() {
    if(this.checked) {
        chrome.storage.local.set({markScammers: true}, function() {
        });
    }
    else{
        chrome.storage.local.set({markScammers: false}, function() {
        });
    }
});

$numberoflistings = $("#numberOfListings");

chrome.storage.local.get(['numberOfListings'], function(result) {
    $numberoflistings.val(result.numberOfListings);
});

$numberoflistings.on('input', function() {
    let number = parseInt($(this).val());
    if(number<10){
        number = 10;
    }
    else if(number>100){
        number = 100;
    }
    chrome.storage.local.set({numberOfListings: number}, function() {
    });
});

