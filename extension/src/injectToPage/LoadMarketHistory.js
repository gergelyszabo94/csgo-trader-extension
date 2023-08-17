const params = JSON.parse(document.currentScript.dataset.params);

function addItemInfoToElement(assets, hovers) {
      var hoversArray = hovers.split('CreateItemHoverFromContainer');
            hoversArray.forEach((hover) => {
              if (hover.includes('_name')) {
                const rowID = hover.split("'")[1].split('_name')[0];
                const appID = hover.split("_name', ")[1].split(',')[0];
                const tempSplit = hover.split("',");
                const contextID = tempSplit[tempSplit.length - 3].split("'")[1];
                const assetID = tempSplit[tempSplit.length - 2].split("'")[1];
                const historyRow = document.getElementById(rowID);
                const asset = assets[appID][contextID][assetID];
                
                historyRow.setAttribute('data-appid', appID);
                historyRow.setAttribute('data-name', asset.market_hash_name);      
              }
            });
    }
    
    function LoadMarketHistory()
    {
        if ( g_bBusyLoadingMarketHistory )
        {
          return;
        }

        g_bBusyLoadingMarketHistory = true;
        var elMyHistoryContents = $('tabContentsMyMarketHistory');
        new Ajax.Request( 'https://steamcommunity.com/market/myhistory', {
          method: 'get',
          parameters: {
            count: params.marketHistoryEventsToShow,
          },
        onSuccess: function( transport ) {
          if ( transport.responseJSON )
          {
            var response = transport.responseJSON;

            elMyHistoryContents.innerHTML = response.results_html;

            MergeWithAssetArray( response.assets );
            eval( response.hovers );
            addItemInfoToElement(response.assets, response.hovers);

            g_oMyHistory = new CAjaxPagingControls(
            {
              query: '',
              total_count: response.total_count,
              pagesize: response.pagesize,
              prefix: 'tabContentsMyMarketHistory',
              class_prefix: 'market'
            }, 'https://steamcommunity.com/market/myhistory/'
           );

           g_oMyHistory.SetResponseHandler( function( response ) {
           MergeWithAssetArray( response.assets );
           eval( response.hovers );
           addItemInfoToElement(response.assets, response.hovers);
            });
          }
        },
      onComplete: function() { g_bBusyLoadingMarketHistory = false; }
   });
  }