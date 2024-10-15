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

            var elActionMenu = $J('#trade_action_popup');
            elActionMenu.attr( 'data-itemassetid', item.id ); // so we can get item details in the content script
        
            if ( bItemHasActions )
            {
                var elItemActions = $J('#trade_action_popup_itemactions');
                elItemActions.empty();
                for ( var action = 0; action < item.actions.length; action++ )
                {
                    var rgAction = item.actions[action];
                    var strLink = rgAction.link.replace( "%assetid%", item.id ).replace( "%contextid%", item.contextid ).replace( "%owner_steamid%", user.GetSteamId() );
                    var elNewAction = $J( '<a></a>' );
                    // if (rgAction.id === "onserver") {
                    //   elNewAction = $J( '<span></span>' );
                    //   elNewAction.attr( 'data-assetid', item.id );
                    //   elNewAction.attr( 'style', 'cursor: pointer;' );
                    //   elNewAction.addClass( 'inspectOnServer' );
                    // } else 
                    elNewAction.attr( 'href', strLink );
                    
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