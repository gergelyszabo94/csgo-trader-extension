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