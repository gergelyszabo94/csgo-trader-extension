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
  chrome.storage.local.get(['openOfferInTab'], (result) => {
    if (result.openOfferInTab) injectScript(overRideShowTradeOfferScript, false, 'ShowTradeOfferScript', null);
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
                  item.actions=item.actions.filter(element => element.id!=="inbrowser");
                  let inspectLink = item.actions[0].link;
                  item.actions.push({name: "Inspect in Browser...", link: "http://csgo.gallery/"+inspectLink, id: "inbrowser"});
                }
                for ( var action = 0; action < item.actions.length; action++ )
                {
                    var rgAction = item.actions[action];
                    var elNewAction = $J( '<a></a>' );
                    elNewAction.addClass( 'popup_menu_item' );
        
                    var strLink = rgAction.link.replace( "%assetid%", item.id ).replace( "%contextid%", item.contextid ).replace( "%owner_steamid%", user.GetSteamId() );
                    elNewAction.attr( 'href', strLink );
                   
                    
                    if ( rgAction.link.substr( 0, 6 ) != "steam:" && rgAction.link.substr( 0, 37 ) != "javascript:sendMessageToContentScript")
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
            rgActions=rgActions.filter(element => element.id!=="inbrowser");
                let inspectLink = rgActions[0].link;
                if(inspectLink.substring(0,20)==="steam://rungame/730/"){ //makes sure it's a csgo inspect button
                    rgActions.push({name: "Inspect in Browser...", link: "http://csgo.gallery/"+inspectLink, id: "inbrowser"});
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
                        'class': 'btn_small btn_grey_white_innerfade',
                        href: strLink,
                        target: target
                    }
                );
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
            });
          }
        },
      onComplete: function() { g_bBusyLoadingMarketHistory = false; }
   });
}`;
    injectScript(overrideMarketHistoryScript, false, 'overRidePopulateActionsMenu', null);
  });
};

export {
  overrideShowTradeOffer, overridePopulateActions,
  overrideHandleTradeActionMenu, overrideLoadMarketHistory,
};
