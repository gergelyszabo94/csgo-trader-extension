
function overrideShowTradeOffer(){
    $("#ShowTradeOfferScript").remove();
    let overRideShowTradeOfferText = `
<script id="ShowTradeOfferScript">
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
    chrome.storage.local.get(['openOfferInTab'], function(result) {
        if(result.openOfferInTab){
            $("body").append(overRideShowTradeOfferText);
        }
    });
}

function overrideDecline(){
    $("#DeclineTradeOfferScript").remove();
    let overRideDeclineOffer = `
<script id="DeclineTradeOfferScript">
function DeclineTradeOffer( tradeOfferID )
{
	ActOnTradeOffer( tradeOfferID, 'decline', 'Trade Declined', 'Decline Trade' );
}
</script>`;

    chrome.storage.local.get(['quickDeclineOffer'], function(result) {
        if(result.quickDeclineOffer){
            $("body").append(overRideDeclineOffer);
        }
    });
}

//adds In-browser inspect as action - in trade offers
function overrideHandleTradeActionMenu(){
    $("#overrideHandleTradeActionMenuScript").remove();
    let overrideHandleTradeActionMenu = `
<script id="overrideHandleTradeActionMenuScript">
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
		item.actions=item.actions.filter(element => element.id!=="inbrowser");
		item.actions=item.actions.filter(element => element.id!=="getfloat");
		let inspectLink = item.actions[0].link;
		item.actions.push(
		    {name: "Inspect in Browser...", link: "http://csgo.gallery/"+inspectLink, id: "inbrowser"},
		    {name: "Get Float Value...", link: "javascript:sendMessageToContentScript('" + inspectLink + "');", id: "getfloat"}
		    );
		for ( var action = 0; action < item.actions.length; action++ )
		{
			var rgAction = item.actions[action];
			var elNewAction = $J( '<a></a>' );
			elNewAction.addClass( 'popup_menu_item' );

			var strLink = rgAction.link.replace( "%assetid%", item.id ).replace( "%contextid%", item.contextid ).replace( "%owner_steamid%", user.GetSteamId() );
			elNewAction.attr( 'href', strLink );
			
			if(rgAction.name==="getfloat"){
			    elNewAction.attr("data-assetid", item.id );
			}

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
</script>`;

    $("body").append(overrideHandleTradeActionMenu);
}


//adds In-browser inspect as action in inventory
function overridePopulateActions(){
    $("#overridePopulateActionsScript").remove();
    let overridePopulateActionsMenu = `
<script id="overridePopulateActionsScript">
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
</script>`;

    $("body").append(overridePopulateActionsMenu);
}