
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