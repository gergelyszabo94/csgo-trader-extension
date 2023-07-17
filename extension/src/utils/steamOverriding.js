/* eslint-disable no-useless-escape */
import { injectScript } from 'utils/injection';

// makes trade offers open in new tab instead of a separate window
const overrideShowTradeOffer = () => {
  const overRideShowTradeOfferScript = `
    function ShowTradeOffer( tradeOfferID, rgParams )
        {
            var strParams = '';
            if ( rgParams )
                strParams = '?' + $J.param( rgParams );
        
            var strKey = ( tradeOfferID == 'new' ? 'NewTradeOffer' + rgParams['partner'] : 'TradeOffer' + tradeOfferID );
        
        
            var winOffer = window.open( 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strParams, '_blank');
        
            winOffer.focus();
        }
`;

  chrome.storage.local.get(['openOfferInTab'], ({ openOfferInTab }) => {
    if (openOfferInTab) injectScript(overRideShowTradeOfferScript, false, 'ShowTradeOfferScript', null);
  });
};

// adds In-browser inspect as action - in trade offers
const overrideHandleTradeActionMenu = () => {
  const overrideHandleTradeActionMenuScript = `
        function HandleTradeActionMenu( elActionMenuButton, item, user )
        {
            HideMenuFast( elActionMenuButton, 'trade_action_popup' );
        
            var bOtherProfileIsPublic = user != null; // TODO: Set this properly
            var bShowStaticActions = item.marketable || bOtherProfileIsPublic;
            var bItemHasActions = typeof item.actions != 'undefined';
            if ( bShowStaticActions )
                $J('#trade_action_popup_staticactions').show();
        
            if ( bShowStaticActions && bItemHasActions )
                $J('#trade_action_popup_itemstaticsep').show();
            else
                $J('#trade_action_popup_itemstaticsep').hide();
        
            var strLinkPrefix = '';
            if ( Steam.BIsUserInSteamClient() )
                strLinkPrefix = 'steam://openurl/';
        
            if ( item.marketable )
            {
                var sMarketHashName = GetMarketHashName( item );
                $J('#trade_action_viewinmarket').attr( 'href', strLinkPrefix + 'https://steamcommunity.com/market/listings/' + item.appid + '/' + sMarketHashName );
                $J('#trade_action_viewinmarket').show();
            }
            else
            {
                $J('#trade_action_viewinmarket').hide();
            }
        
            if ( bOtherProfileIsPublic )
            {
                $J('#trade_action_viewininventory').attr( 'href', strLinkPrefix + user.GetProfileURL() + '/inventory/#' + item.appid + '_' + item.contextid + '_' + item.id );
                $J('#trade_action_viewininventory').show();
            }
            else
            {
                $J('#trade_action_viewininventory').hide();
            }
        
            if ( bItemHasActions )
            {
                var elItemActions = $J('#trade_action_popup_itemactions');
                elItemActions.empty();
                if (item.actions !== '') {
                  item.actions=item.actions.filter(element => element.id!=="inbrowser" && element.id!=="buffLookup" && element.id!=="onserver");
                  let inspectLink = item.actions[0].link;
                  item.actions.push({name: "Inspect in Browser...", link: "https://market.swap.gg/screenshot?inspectLink="+inspectLink, id: "inbrowser"});
                  item.actions.push({name: "Inspect on Server...", link: inspectLink, id: "onserver"});
                  item.actions.push({name: "Lookup on BUFF", link: "https://api.pricempire.com/v1/redirectBuff/"+item.market_hash_name, id: "buffLookup"});
                }
                for ( var action = 0; action < item.actions.length; action++ )
                {
                    var rgAction = item.actions[action];
                    var strLink = rgAction.link.replace( "%assetid%", item.id ).replace( "%contextid%", item.contextid ).replace( "%owner_steamid%", user.GetSteamId() );
                    var elNewAction = $J( '<a></a>' );
                    if (rgAction.id === "onserver") {
                      elNewAction = $J( '<span></span>' );
                      elNewAction.attr( 'data-assetid', item.id );
                      elNewAction.attr( 'style', 'cursor: pointer;' );
                      elNewAction.addClass( 'inspectOnServer' );
                    } else elNewAction.attr( 'href', strLink );
                    
                    elNewAction.addClass( 'popup_menu_item' );
               
                    if ( rgAction.link.substr( 0, 6 ) != "steam:")
                    {
                        elNewAction.attr( 'target', '_blank' );
                        elNewAction.attr( 'rel', 'noreferrer' );
                    }
        
                    elNewAction.text( rgAction.name );
        
                    elNewAction.click( function() {
                        HideMenu( elActionMenuButton, 'trade_action_popup' );
                    } );
        
                    elItemActions.append( elNewAction );
                }
        
                elItemActions.show();
                
            }
            else
            {
                $J('#trade_action_popup_itemactions').hide();
            }
        
            ShowMenu( elActionMenuButton, 'trade_action_popup', 'right' );
        }
       `;

  injectScript(overrideHandleTradeActionMenuScript, false, 'overrideHandleTradeActionMenu', null);
};

// adds In-browser inspect as action in inventory
const overridePopulateActions = () => {
  const overRidePopulateActionsMenuScript = `
        function PopulateActions( prefix, elActions, rgActions, item, owner )
        {
            elActions.update('');
            if ( !rgActions )
            {
                elActions.hide();
                return;
            }
            rgActions=rgActions.filter(element => element.id!=="inbrowser" && element.id!=="onserver");
                let inspectLink = rgActions[0].link;
                if(inspectLink.substring(0,20)==="steam://rungame/730/"){ //makes sure it's a csgo inspect button
                    rgActions.push({name: "Inspect in Browser...", link: "https://market.swap.gg/screenshot?inspectLink="+inspectLink, id: "inbrowser"});
                    rgActions.push({name: "Inspect on Server...", link: "steam://connect/51.75.73.121:27015", id: "onServer"});
                }
            for ( var i = 0; i < rgActions.length; i++ )
            {
                var action = rgActions[i];
                if ( !action.link || !action.name )
                    continue;
                
                var strLink = action.link.replace( "%assetid%", item.assetid );
                strLink = strLink.replace( "%contextid%", item.contextid );
                if ( owner )
                {
                    if ( typeof owner == 'string' )
                        strLink = strLink.replace( "%owner_steamid%", owner );
                    else
                        strLink = strLink.replace( "%owner_steamid%", owner.GetSteamId() );
                }
        
                // hack to handle "grind into goo" action
                if ( strLink.match( /^javascript:GetGooValue/ ) )
                {
                    HandleGetGooValueAction( prefix, item, strLink );
                    continue;
                }
                
                let target = "_self"; 
                if(action.id==="inbrowser"){
                    target = "_blank";
                }
                
                var elAction = new Element(
                    'a',
                    {
                        'class': 'btn_small btn_grey_white_innerfade ' + action.id,
                        href: strLink,
                        target: target
                    }
                );
                
                if (action.id === "onServer") {
                  elAction = new Element(
                    'span',
                    {
                        'class': 'btn_small btn_grey_white_innerfade ' + action.id
                    });
                }

                var elSpan = new Element( 'span' );
                elSpan.update( action.name );
                elAction.appendChild( elSpan );
                elActions.appendChild( elAction );
            }
            elActions.show();
        }
`;
  injectScript(overRidePopulateActionsMenuScript, false, 'overRidePopulateActionsMenu', null);
};

// loads more market history items
const overrideLoadMarketHistory = () => {
  chrome.storage.local.get('marketHistoryEventsToShow', ({ marketHistoryEventsToShow }) => {
    const overrideMarketHistoryScript = `
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
            count: ${marketHistoryEventsToShow},
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
}`;
    injectScript(overrideMarketHistoryScript, false, 'overRidePopulateActionsMenu', null);
  });
};

// makes trade offers open in new tab instead of a separate window
const overrideCreatePriceHistoryGraph = () => {
  const overrideCreatePriceHistoryGraphScript = `
    function CreatePriceHistoryGraph( line1, numYAxisTicks, strFormatPrefix, strFormatSuffix )
    {
        var plot = $J.jqplot('pricehistory', [line1], {
            title:{text: 'Median Sale Prices', textAlign: 'left' },
            gridPadding:{left: 45, right:45, top:25},
            axesDefaults:{ showTickMarks:false },
            axes:{
                xaxis:{
                    renderer:$J.jqplot.DateAxisRenderer,
                    tickOptions:{formatString:'%d/%m/%y<span class="priceHistoryTime"> %#I%p<span>'},
                    pad: 1
                },
                yaxis: {
                    pad: 1.1,
                    tickOptions:{formatString:strFormatPrefix + '%0.2f' + strFormatSuffix, labelPosition:'start', showMark: false},
                    numberTicks: numYAxisTicks
                }
            },
            grid: {
                gridLineColor: '#1b2939',
                borderColor: '#1b2939',
                background: '#101822'
            },
            cursor: {
                show: true,
                zoom: true,
                showTooltip: false
            },
            highlighter: {
                show: true,
                lineWidthAdjust: 2.5,
                sizeAdjust: 5,
                showTooltip: true,
                tooltipLocation: 'n',
                tooltipOffset: 20,
                fadeTooltip: true,
                yvalues: 2,
                formatString: '<strong>%s</strong><br>%s<br>%d sold'
            },
            series:[{lineWidth:3, markerOptions:{show: false, style:'circle'}}],
            seriesColors: [ "#688F3E" ]
        });
    
        plot.defaultNumberTicks = numYAxisTicks;
        return plot;
    }

    // to get the params from the page and call function

    let line1 = false;
    let strFormatPrefix = '';
    let strFormatSuffix = '';
    let numYAxisTicks = 7;

    document.querySelectorAll('script[type="text/javascript"]').forEach((scriptEl) => {
        if (scriptEl.innerHTML.includes('var line1=')) {
            const scriptText = scriptEl.innerHTML;
            line1 = JSON.parse(scriptText.split('var line1=')[1].split(']];')[0] + ']]');
            strFormatPrefix = scriptText.split('var strFormatPrefix = "')[1].split('"')[0];
            strFormatPrefix = decodeURIComponent(JSON.parse('"' + strFormatPrefix.replace(/\"/g, '\\"') + '"'));
            strFormatSuffix = scriptText.split('var strFormatSuffix = "')[1].split('"')[0];
            strFormatSuffix = decodeURIComponent(JSON.parse('"' + strFormatSuffix.replace(/\"/g, '\\"') + '"'));
            numYAxisTicks = parseInt(scriptText.split('CreatePriceHistoryGraph( line1, ')[1].split(',')[0]);
        }
    });

    $J(document).ready(function () {    
        g_plotPriceHistory = CreatePriceHistoryGraph(line1, numYAxisTicks, strFormatPrefix, strFormatSuffix);
        pricehistory_zoomMonthOrLifetime(g_plotPriceHistory, g_timePriceHistoryEarliest, g_timePriceHistoryLatest);
    });
  `;

  chrome.storage.local.get(['showYearsOnMarketGraphs'], ({ showYearsOnMarketGraphs }) => {
    if (showYearsOnMarketGraphs) injectScript(overrideCreatePriceHistoryGraphScript, false, 'overrideCreatePriceHistoryGraphScript', null);
  });
};

export {
  overrideShowTradeOffer, overridePopulateActions, overrideCreatePriceHistoryGraph,
  overrideHandleTradeActionMenu, overrideLoadMarketHistory,
};
