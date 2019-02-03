//ensures that we are on a profile page, it's not possible with simple regex
if($("body").hasClass("profile_page")){
    let repButton = `<span class="btn_green_white_innerfade btn_small" id="repper">+rep<span>`;
    // $(".commentthread_entry_submitlink").append(repButton);

    let overRideShowTradeOffer = `
<script>
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
            $("body").append(overRideShowTradeOffer);
        }
    });
}