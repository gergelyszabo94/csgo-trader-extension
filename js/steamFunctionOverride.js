
function overrideShowTradeOffer(){
    $("#ShowTradeOfferScript").remove();
    let overRideShowTradeOfferText = `
<script id="ShowTradeOfferScript">
function ShowTradeOffer( tradeOfferID, rgParams )
{
	var strParams = '';
	if ( rgParams )
		strParams = '?' + $J.param( rgParams );

	var strKey = ( tradeOfferID == 'new' ? 'NewTradeOffer' + rgParams['partner'] : 'TradeOffer' + tradeOfferID );


	var winOffer = window.open( 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strParams, '_blank');

	winOffer.focus();
}
</script>
`;
    chrome.storage.sync.get(['openOfferInTab'], function(result) {
        if(result.openOfferInTab){
            $("body").append(overRideShowTradeOfferText);
        }
    });
}

function overrideDecline(){
    $("#DeclineTradeOfferScript").remove();
    let overRideDeclineOffer = `
<script id="DeclineTradeOfferScript">
function DeclineTradeOffer( tradeOfferID )
{
	ActOnTradeOffer( tradeOfferID, 'decline', 'Trade Declined', 'Decline Trade' );
}
</script>`;

    chrome.storage.sync.get(['quickDeclineOffer'], function(result) {
        if(result.quickDeclineOffer){
            $("body").append(overRideDeclineOffer);
        }
    });
}

//gets the steam id of the user that's profile this script is run on
function getProfileOwnerSteamID(){
    let scriptToInject = `
    <script>
    document.querySelector("body").setAttribute("steamidOfProfileOwner", g_rgProfileData.steamid);
</script>`;
    $("body").append(scriptToInject);
    return $("body").attr("steamidOfProfileOwner");

}


//gets steamid of the user logged into steam
function getUserSteamID(){
    let scriptToInject = `
    <script>
    document.querySelector("body").setAttribute("steamidOfLoggedinUser", g_steamID);
</script>`;
    $("body").append(scriptToInject);
    return $("body").attr("steamidOfLoggedinUser");

}

function getInventoryOwnerID(){
    let scriptToInject = `
    <script>
    document.querySelector("body").setAttribute("inventoryOwnerID", UserYou.GetSteamId());
</script>`;
    $("body").append(scriptToInject);
    return $("body").attr("inventoryOwnerID");
}