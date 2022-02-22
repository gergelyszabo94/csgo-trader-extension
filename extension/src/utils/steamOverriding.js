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

// loads csgo inventories from alternative endpoint
const overRideCSGOInventoryLoading = () => {
  const overrideMarketHistoryScript = `
   CInventory.prototype.GetInventoryLoadURL = function () {
      if (this.m_appid === 730) {
        console.log("Loading csgo inventory via different endpoint :D")
        return "https://steamcommunity.com/profiles/" + this.m_steamid + "/inventory/json/730/2/";
      }
      
      return 'https://steamcommunity.com/inventory/' + this.m_steamid + '/' + this.m_appid + '/' + this.m_contextid;
   };
   
  CInventory.prototype.LoadMoreAssets = function (count) {
    if (this.m_ActivePromise)
        return this.m_ActivePromise;

    if (this.m_bFullyLoaded)
        return $J.Deferred().resolve().promise();

    // we won't re-request for 5 seconds after a failure
    if (this.m_tsLastError && $J.now() - this.m_tsLastError < 5000)
        return $J.Deferred().reject().promise();

    this.m_$Inventory.addClass('loading');
    var _this = this;

    if (!count)
        count = this.m_bPerformedInitialLoad ? 2000 : 75;

    var params = {
        'l': 'english',
        'count': count
    };

    if (typeof (g_bIsInMarketplace) != 'undefined' && g_bIsInMarketplace)
        params.market = 1;

    if (this.m_ulLastAssetID)
        params.start_assetid = this.m_ulLastAssetID;

    this.m_owner.ShowLoadingIndicator();

    return this.SetActivePromise($J.get(this.GetInventoryLoadURL(), params
    ).done(function (data) {

        if (data !== undefined) {

            if (data.success) {
                if (data.rgInventory) {
                    let assets = [];
                    let total_inventory_count = 0;
                    Object.keys(data.rgInventory).forEach(key => {
                        let currentAsset = data.rgInventory[key];
                        let asset = {
                            "appid": 730,
                            "contextid": "2",
                            "assetid": currentAsset.id,
                            "classid": currentAsset.classid,
                            "instanceid": currentAsset.instanceid,
                            "amount": currentAsset.amount
                        }
                        total_inventory_count = currentAsset.pos;
                        assets.push(asset);
                    });
                    let descriptions = [];
                    Object.keys(data.rgDescriptions).forEach(key => {
                        descriptions.push(data.rgDescriptions[key]);
                    });

                    let success = 1;
                    let rwgrsn = -2;
                    assets.sort((a, b) => (parseInt(a.assetid) < parseInt(b.assetid)) ? 1 : ((parseInt(b.assetid) < parseInt(a.assetid)) ? -1 : 0));
                    data = {assets, descriptions, total_inventory_count, success, rwgrsn};
                }
            } else {
                alert("Failed via other endpoint aswell")
            }

        }

        _this.m_bPerformedInitialLoad = true;
        _this.m_$Inventory.removeClass('loading');
        _this.AddInventoryData(data);
        _this.m_tsLastError = 0;
        _this.HideInventoryLoadError();
        _this.m_SingleResponsivePage.EnsurePageItemsCreated();

        if (_this.m_parentInventory)
            _this.m_parentInventory.m_SingleResponsivePage.EnsurePageItemsCreated();

    }).fail(function () {
        _this.m_tsLastError = $J.now();
        _this.ShowInventoryLoadError();
    }).always(function () {
        _this.m_owner.HideLoadingIndicator();
    })).done(function () {
        // intentionally done outside SetActivePromise so active promise will bset.
        for (var i = 0; i < _this.m_rgOnItemsLoadedCallbacks.length; i++)
            _this.m_rgOnItemsLoadedCallbacks[i]();
    }).promise();
  };
  
  CInventory.prototype.BuildInventoryTagFilters = function () {
    if (!this.m_$TagContainer.length)
        return;

    this.m_$TagContainer.children().detach();

    for (var sCategoryName in this.tags) {
        if (typeof sCategoryName != "string")
            continue;
        var rgCategory = this.tags[sCategoryName];
        var elTagCategory = new Element('div', {'class': 'econ_tag_filter_category'});
        elTagCategory.localized_category_name = sCategoryName;

        var elTagCategoryLabel = new Element('div', {'class': 'econ_tag_filter_category_label'});
        $J(elTagCategoryLabel).text(rgCategory.name);
        elTagCategory.appendChild(elTagCategoryLabel);

        var rgCategoryTags = [];
        //quickly determine the total number of valid tags
        var cTagsTotal = 0;
        for (var sInternalName in rgCategory.tags) {
            if (typeof sInternalName == 'string')
                cTagsTotal++;
        }

        var elTagCtn = elTagCategory;

        var cTagsDisplayed = 0;
        for (var sInternalName in rgCategory.tags) {
            if (!rgCategory.tags.hasOwnProperty(sInternalName))
                continue;

            var rgTag = rgCategory.tags[sInternalName];
            rgTag.internal_name = sInternalName;
            rgCategoryTags.push(rgTag);
        }

        rgCategoryTags.sort(function (a, b) {
            var aName = a.name === undefined ? a.internal_name.toUpperCase() : a.name.toUpperCase();
            var bName = b.name === undefined ? b.internal_name.toUpperCase() : b.name.toUpperCase();
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        });

        for (var index in rgCategoryTags) {
            if (!rgCategoryTags.hasOwnProperty(index))
                continue;

            var rgTag = rgCategoryTags[index];
            var sInternalName = rgTag.internal_name;

            var elTagDiv = new Element('div', {'class': 'econ_tag_filter_container'});

            var sCheckboxName = 'tag_filter_' + (this.owner && this.owner != UserYou ? 'them_' : '');
            sCheckboxName += this.appid + '_' + this.contextid + '_' + sCategoryName + '_' + sInternalName;
            var elTagFilter = new Element('input', {
                'class': 'econ_tag_filter_checkbox',
                'type': 'checkbox',
                'name': sCheckboxName,
                'id': sCheckboxName,
                'tag_name': sInternalName
            });
            var elTagLabel = new Element('label', {'class': 'econ_tag_filter_label', 'for': sCheckboxName});

            if (rgTag.color) {
                var elTagName = new Element('span');
                $J(elTagName).text(rgTag.internal_name);
                elTagName.style.color = "#" + rgTag.color;
                elTagLabel.appendChild(elTagName);
            } else {
                $J(elTagLabel).text(rgTag.internal_name);
            }

            var elItemCount = new Element('span', {'class': 'econ_tag_count'});
            elItemCount.update(" (" + rgTag.count + ")");
            elTagLabel.appendChild(elItemCount);

            $(elTagFilter).observe('change', this.TagCheckboxChanged.bind(this));

            elTagDiv.appendChild(elTagFilter);
            elTagDiv.appendChild(elTagLabel);

            if (++cTagsDisplayed == 5 && cTagsTotal > 7) {
                var elExpandTags = new Element('div', {'class': 'econ_tag_filter_collapsable_tags_showlink whiteLink'});
                var elCollapsedTagCtn = new Element('div', {
                    'class': 'econ_tag_filter_collapsable_tags',
                    style: 'display: none;'
                });
                elExpandTags.update('+ Show more');
                Event.observe(elExpandTags, 'click', (function (elExpandLink, elDivToExpand) {
                    elExpandLink.hide();
                    new Effect.BlindDown(elDivToExpand, {duration: 0.25});
                }).bind(null, elExpandTags, elCollapsedTagCtn));

                elTagCtn.appendChild(elExpandTags);
                elTagCtn.appendChild(elCollapsedTagCtn);

                elTagCtn = elCollapsedTagCtn;
            }

            elTagCtn.appendChild(elTagDiv);
        }

        this.m_$TagContainer.append(elTagCategory);
    }

    // add a div to clear the floating
    this.m_$TagContainer.append(new Element('div', {"style": "clear: left;"}));
  };`;
  injectScript(overrideMarketHistoryScript, false, 'overRideCSGOInventoryLoading', null);
};

export {
  overrideShowTradeOffer, overridePopulateActions,
  overrideHandleTradeActionMenu, overrideLoadMarketHistory, overRideCSGOInventoryLoading,
};
