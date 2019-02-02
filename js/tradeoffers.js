
let overRideDeclineOffer = `
<script>
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