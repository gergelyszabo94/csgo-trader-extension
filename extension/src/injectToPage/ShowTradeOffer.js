function ShowTradeOffer( tradeOfferID, rgParams )
        {
            var strParams = '';
            if ( rgParams )
                strParams = '?' + $J.param( rgParams );
        
            var strKey = ( tradeOfferID == 'new' ? 'NewTradeOffer' + rgParams['partner'] : 'TradeOffer' + tradeOfferID );
        
        
            var winOffer = window.open( 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strParams, '_blank');
        
            winOffer.focus();
        }