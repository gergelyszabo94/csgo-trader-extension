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

  // so we can get item details in the content script
  // only these two lines are changed compared to steam's economy.js
  var elActionMenu = $J('#trade_action_popup');
  elActionMenu.attr( 'data-itemassetid', item.id );

	if ( bItemHasActions )
	{
		var elItemActions = $J('#trade_action_popup_itemactions');
		elItemActions.empty();
		for ( var action = 0; action < item.actions.length; action++ )
		{
			var rgAction = item.actions[action];
			var elNewAction = $J( '<a></a>' );
			elNewAction.addClass( 'popup_menu_item' );

			var strLink = rgAction.link.replace( "%assetid%", item.id ).replace( "%contextid%", item.contextid ).replace( "%owner_steamid%", user.GetSteamId() );
			if ( item.asset_properties && item.asset_properties instanceof Array )
			{
				item.asset_properties.forEach( prop =>
				{
					var propValue = '';
					if ( prop.float_value !== undefined )
						propValue = prop.float_value.toString();
					else if ( prop.int_value !== undefined )
						propValue = prop.int_value.toString();
					else if ( prop.string_value !== undefined )
						propValue = prop.string_value;
					strLink = strLink.replace( `%propid:${prop.propertyid}%`, propValue );
				} );
			}
			strLink = strLink.replace( /%propid:[0-9]+%/, '' );

			elNewAction.attr( 'href', strLink );

			if ( rgAction.link.substr( 0, 6 ) != "steam:" )
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