
let overRideDeclineOffer = `
<script>
function DeclineTradeOffer( tradeOfferID )
{
	ActOnTradeOffer( tradeOfferID, 'decline', 'Trade Declined', 'Decline Trade' );
}
</script>`;

$("body").append(overRideDeclineOffer);