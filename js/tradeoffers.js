
let overRideDeclineOffer = `
<script>
function DeclineTradeOffer( tradeOfferID )
{
	ActOnTradeOffer( tradeOfferID, 'decline', 'Trade Declined', 'Decline Trade' );
}
</script>`;

let overRideShowTradeOffer = `
<script>
function ShowTradeOffer( tradeOfferID, rgParams )
{
	var winOffer = window.open( 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/', '_blank');
	winOffer.focus();
}

</script>
`;

chrome.storage.sync.get(['quickDeclineOffer'], function(result) {
    if(result.quickDeclineOffer){
        $("body").append(overRideDeclineOffer);
    }
});


chrome.storage.sync.get(['openOfferInTab'], function(result) {
    if(result.openOfferInTab){
        $("body").append(overRideShowTradeOffer);
    }
});