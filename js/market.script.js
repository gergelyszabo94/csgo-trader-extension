/* global CreateMarketActionButton, $J, MergeWithAssetArray, bookmarkeditems */
PriceQueue._successDelay = 800;
var startPage = 0;
var assetList = new Map();
var apps = {
    'Counter-Strike: Global Offensive': 730,
    'Dota 2': 570,
    'Team Fortress 2': 440,
    "PLAYERUNKNOWN'S BATTLEGROUNDS": 578080,
    'Steam': 753
};
var $ACTIVE_LISTING_ROWS = null;
const COOKIE_ENABLED_SIH = 'enableSIH';
let IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';
$J('#myMarketTabs').append(`
    <div id="switchPanel">
        <span style="margin-right: 10px;">SIH - Steam Inventory Helper</span>
        <label class="switch">
            <input id="switcher" type="checkbox" ${IS_ENABLED_SIH ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>
    </div>
`);
$J('#switchPanel #switcher').change((e) => {
    const { currentTarget } = e;
    SetCookie(COOKIE_ENABLED_SIH, currentTarget.checked, 365, '/market');
    window.location.reload();
});


var orgLoadMarketHistory = null;
var orgRefreshMyMarketListings = null;
var removeLinkExp = /javascript:.*\('mylisting', '(\d+)', (\d+), '(\d+)', '(\d+)'\)/;
var FraudAlert = function () {
    $J('#sellListingRows .market_listing_row.market_recent_listing_row[id]').each(function () {
        var $row = $J(this);
        var idListing = $J(this).attr('id').replace('listing_sell_new_', '');
        var rgListing = g_rgListingInfo[idListing];
        var asset = null;
        if (rgListing) {
            asset = g_rgListingInfo[idListing].asset;
        } else {
            return;
        }
        var rgItem = g_rgAssets[asset.appid][asset.contextid][asset.id];

        //$J(this).find('.playerAvatar img').replaceWith(function () {
        //    return '<a href="http://steamcommunity.com/profiles/' + rgItem.owner + '" target="_blank">' + this.outerHTML + '</a>';
        //});

        if (rgItem.fraudwarnings && rgItem.fraudwarnings.length > 0) {
            var nameEl = $J(this).find('.market_listing_item_name');
            nameEl.html(nameEl.html() + ' <span style="color:red">(warning)</red>');
        }
        //if (rgListing['price'] > 0) {
        //    var quickBuyBt = $J('<a href="#" class="item_market_action_button item_market_action_button_green">' +
        //                '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
        //                '<span class="item_market_action_button_contents">' + SIHLang.quickbuy + '</span>' +
        //                '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
        //                '<span class="item_market_action_button_preload"></span></a>');
        //    quickBuyBt.click(function () {
        //        $J(this).hide();
        //        $row.find('.market_listing_buy_button').append('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
        //        var Subtotal = rgListing['converted_price'];
        //        var FeeAmount = rgListing['converted_fee'];
        //        var Total = rgListing['converted_price'] + rgListing['converted_fee'];
        //        var data = {
        //            sessionid: g_sessionID,
        //            currency: g_rgWalletInfo['wallet_currency'],
        //            subtotal: Subtotal,
        //            fee: FeeAmount,
        //            total: Total,
        //            quantity: 1
        //        }
        //        $J.ajax({
        //            url: 'https://steamcommunity.com/market/buylisting/' + idListing,
        //            type: 'POST',
        //            data: data,
        //            crossDomain: true,
        //            xhrFields: { withCredentials: true }
        //        }).done(function (data) {
        //            if ($row.is(':visible'))
        //                $row.find('.market_listing_buy_button').html('Success');
        //            else
        //                alert('Success');
        //        }).fail(function (jqxhr) {
        //            $row.find('.market_listing_buy_button img').remove();
        //            var data = $J.parseJSON(jqxhr.responseText);
        //            if (data && data.message) {
        //                $row.find('.market_listing_buy_button').html(data.message);
        //                //BuyItemDialog.DisplayError(data.message);
        //            }

        //        });
        //        return false;
        //    });
        //    AddItemHoverToElement(quickBuyBt[0], rgItem);
        //    $J(this).find('.market_listing_buy_button .item_market_action_button.item_market_action_button_green').remove();
        //    $J(this).find('.market_listing_buy_button').append(quickBuyBt);
        //}
    });
    //$J('.market_listing_action_buttons').css({ width: '200px' });
};

var RemoveListing = function ($parent) {
    var cks = $parent.find('.market_listing_row .select-checkbox:visible:checked').toArray();

    Promise.all(
        cks.map((item) => {
            const listingid_row = $J(item).parents('.market_recent_listing_row').attr('id');
            if (listingid_row.indexOf('mylisting') == 0) {
                const listingid = listingid_row.substring(10);
                $J(`#${listingid_row} .market_listing_edit_buttons.actual_content a`).html('Removing...');
                return new Promise((resolve, reject) =>
                    $J.post(`//steamcommunity.com/market/removelisting/${listingid}`, { sessionid: g_sessionID }).then(resolve).fail(reject));
            } else if (listingid_row.indexOf('mybuyorder') == 0) {
                const buy_orderid = listingid_row.substring(11);
                $J(`#${listingid_row} .market_listing_edit_buttons.actual_content a`).html('Cancelling...');
                return new Promise((resolve, reject) =>
                    $J.post('//steamcommunity.com/market/cancelbuyorder/', { sessionid: g_sessionID, buy_orderid }).then(resolve).fail(reject));
            }
        })
    ).then((respValues) => {
        cks.forEach((item) => {
            const $row = $J(item).parents('.market_recent_listing_row');
            $row.hide(300, function () {
                $row.remove();
            });
        });
        RefreshMyMarketListings();
    }).catch((reason) => {
        console.log(reason);
        cks.forEach((item) => {
            const $row = $J(item).parents('.market_recent_listing_row');
            $row.hide(300, function () {
                $row.remove();
            });
        });
        RefreshMyMarketListings();
    });
    return false;
};

var orgRemListingOnSuccess = RemoveListingDialog.OnSuccess;
RemoveListingDialog.OnSuccess = function (transport) {
    if (transport.responseJSON) {
        this.OnSuccessEffects();
        htmlListings = '';
        $ACTIVE_LISTING_ROWS = null;
        RefreshMyMarketListings();
    }
    else {
        this.OnFailureEffects();
        this.DisplayError('There was a problem removing your listing. Refresh the page and try again.');
    }
}

const parseListings = function () {
    let totalSelling = 0;
    let totalRecieve = 0;
    $ACTIVE_LISTING_ROWS.find('.market_listing_price').children('span').each(function (rowId, price) {
        let isBuyOrder = false;
        var $price = $J(price);
        if ($price.hasClass('market_listing_inline_buyorder_qty')) {
            isBuyOrder = true;
            $price = $price.parent();
        }
        // var buyerPrice = isBuyOrder ? /[+-]?([0-9]*[.,])?[0-9]+/.exec($price.text().split('@')[1])[0] : $price.find('span:first').text();
        var buyerPrice = isBuyOrder ? $price.text().split('@')[1] : $price.find('span:first').text();
        var pays = getPriceAsInt(buyerPrice);
        if (!isNaN(pays)) totalSelling += pays;

        var yourPrice = isBuyOrder ? '0.00' : $price.find('span:last').text();
        var recieve = getPriceAsInt(yourPrice.trim().replace('(', '').replace(')', ''));
        if (!isNaN(recieve)) totalRecieve += recieve;
    });
    const totalSellingStr = totalSelling ? `<span style="color: #fff">${formatNumber(totalSelling / 100)}</span>` : '';
    const totalRecieveStr = totalRecieve ? `<span style="color: #AFAFAF">(${formatNumber(totalRecieve / 100)})</span>` : '';
    $J('#totalRow0').find('.market_listing_right_cell.market_listing_edit_buttons').html(`
        <span style="display: inline-block">
            ${totalSellingStr}
            ${totalRecieveStr}
        </span>
    `);
};

var htmlListings = '';
const getOverallTotal = function (startCount) {
    const pageSize = 100;
    new Ajax.Request(`${window.location.protocol}//steamcommunity.com/market/mylistings`, {
        method: 'get',
        parameters: {
            start: startCount,
            count: pageSize
        },
        onSuccess: function (transport) {
            if (transport.responseJSON) {
                const response = transport.responseJSON;
                const total = response.total_count;
                htmlListings += response.results_html;
                if (total > startCount + pageSize) getOverallTotal(startCount + pageSize);
                else {
                    $ACTIVE_LISTING_ROWS = $J($J.parseHTML(`<div>${htmlListings}</div>`)).find('#tabContentsMyActiveMarketListingsTable .market_listing_row[id^="mylisting_"]');
                    parseListings();
                }
            }
        },
        onFailure: function (transport) {
            console.error('Something went wrong', transport);
        }
    });
};

var isReloading = false;
var ReloadListings = function () {
    if (isReloading) return;
    isReloading = true;
    $J('#tabContentsMyListings').html('<div style="text-align: center; padding: 20px"><img src="//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working..."></div>');
    $J.ajax({
        url: '/market/mylistings/',
        success: function (res) {
            if (res.success && typeof (res.num_active_listings) != 'undefined') {
                clearCachePrices();
                MergeWithAssetArray(res.assets);
                $J('#tabContentsMyListings').html(res.results_html);
                $J('#my_market_activelistings_number').html(res.num_active_listings);
                eval(res.hovers);
                UpdateTotalListings();
                AddFilter();
            }
        },
        error: function () {
            $J('#tabContentsMyListings').html('<div style="text-align: center; padding: 20px">Error</div>');
        },
        complete: function () {
            isReloading = false;
            if (window.highlight) {
                FetchAllItemsPrices();
            }
            addHideListingButton();
        }
    });
};

var RemoveTotalAndFilter = function () {
    $J('div[id*="totalRow"]').remove();
    $J('.filter_ctn.inventory_filters').parent().remove();
    $J('.market_sort_arrow').hide();
}

var AddFilter = function () {
    var input = $J('<div style="clear:both; height: 32px"><div class="filter_ctn inventory_filters">' +
        '<div style="float:left; line-height: 29px; width: 100px" >Filter: </div>' +
        '<div class="filter_control_ctn">' +
        '<div id="filter_clear_btn" style="display: none;"></div>' +
        '<input class="selectableText filter_search_box" type="text" id="Txt_Filter" value="" placeholder="Start typing an item name here to filter items" name="filter" autocomplete="off">' +
        '</div></div></div>');
    // var btRemove = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.removeselected);
    var btRemove = $J(`<a class="btnControl" href="javascript:void(0)" title="${SIHLang.market.removeselected}">
      <span class="icon-trash"></span>
    </a>`);
    btRemove.click(function () {
        const $parent = $J(this).parents('.my_listing_section');
        RemoveListing($parent);
    });
    var div2 = $J('<div style="float: left; padding-left: 10px">');
    div2.append(btRemove);
    input.find('.filter_control_ctn').after(div2);
    if (window.highlight) {
        var button = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.selectoverpriced);
        $J(button).click(function () {
            const $parent = $J(this).parents('.my_listing_section');
            $parent.find('.red-bg .market_listing_edit_buttons .market_listing_cancel_button .select-checkbox:visible').prop('checked', true);
        });
        $J(button).css({ marginRight: '10px' });
        div2.prepend(button);
        //var div = $J('<div style="float: left; padding-left: 10px">');
        //div.append(button);
        //input.find('.filter_control_ctn').after(div);
    }

    input.find('#Txt_Filter').keyup(function () {
        const $parent = $J(this).parents('.my_listing_section');
        var cnt = $J(this).val().toUpperCase().split(' ').filter(function (ss) {
            return ss != '';
        });
        if (cnt.length == 0) {
            $parent.find('.market_listing_row:not([id^="totalRow"])').show();
            $J('#filter_clear_btn').hide();
        } else {
            var filter = '';
            for (var i = 0; i < cnt.length; i++) {
                filter += ':Contains("' + cnt[i] + '")';
            }
            $J('#filter_clear_btn').show();
            //console.log(filter);
            $parent.find('.market_listing_row:not([id^="totalRow"])').each(function () {
                if ($J(this).is(filter)) {
                    $J(this).show();
                } else {
                    $J(this).hide();
                }
            });
        }
    });
    input.find('#filter_clear_btn').click(function () {
        input.find('#Txt_Filter').val('');
        $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mylisting"]) .market_listing_row:not([id^="totalRow"])').show();
        $J('#filter_clear_btn').hide();
    });
    $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mylisting"]) .my_market_header').after(input);
    var ckAll = $J('<input type="checkbox" class="select-checkbox" />');
    ckAll.click(function () {
        var ckprop = $J(this).prop('checked');
        var parent = $J(this).parents('.market_home_listing_table');
        parent.find('.market_listing_edit_buttons .market_listing_cancel_button .select-checkbox:visible').prop('checked', ckprop);

        //$J('#tabContentsMyListings .market_home_listing_table:eq(0) .market_listing_edit_buttons .market_listing_cancel_button .select-checkbox:visible').prop('checked', ckprop);
    });
    $J('#tabContentsMyListings .market_home_listing_table .market_listing_table_header .market_listing_edit_buttons').append(ckAll);
    $J('#tabContentsMyListings .market_home_listing_table .market_listing_edit_buttons .market_listing_cancel_button').append('<input type="checkbox" class="select-checkbox" />');

    //Buying lists

    var input_buying = $J('<div style="clear:both; height: 32px"><div class="filter_ctn inventory_filters">' +
        '<div style="float:left; line-height: 29px; width: 100px" >Filter: </div>' +
        '<div class="filter_control_ctn">' +
        '<div id="filter_clear_btn_buying" style="display: none;"></div>' +
        '<input class="selectableText filter_search_box" type="text" id="Txt_Filter_Buying" value="" placeholder="Start typing an item name here to filter items" name="filter" autocomplete="off">' +
        '</div></div></div>');

    // var btRemoveBuying = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.removeselected);
    var btRemoveBuying = $J(`<a class="btnControl" href="javascript:void(0)" alt="${SIHLang.market.removeselected}">
      <span class="icon-trash"></span>
    </a>`);
    btRemoveBuying.click(function () {
        const $parent = $J(this).parents('.my_listing_section');
        RemoveListing($parent);
    });

    var div2_buying = $J('<div style="float: left; padding-left: 10px">');
    div2_buying.append(btRemoveBuying);
    input_buying.find('.filter_control_ctn').after(div2_buying);

    input_buying.find('#Txt_Filter_Buying').keyup(function () {
        const $parent = $J(this).parents('.my_listing_section');
        var cnt = $J(this).val().toUpperCase().split(' ').filter(function (ss) {
            return ss != '';
        });
        if (cnt.length == 0) {
            $parent.find('.market_listing_row:not([id^="totalRow"])').show();
            $J('#filter_clear_btn_buying').hide();
        } else {
            var filter = '';
            for (var i = 0; i < cnt.length; i++) {
                filter += ':Contains("' + cnt[i] + '")';
            }
            $J('#filter_clear_btn_buying').show();
            //console.log(filter);
            $parent.find('.market_listing_row:not([id^="totalRow"])').each(function () {
                if ($J(this).is(filter)) {
                    $J(this).show();
                } else {
                    $J(this).hide();
                }
            });
        }
    });
    input_buying.find('#filter_clear_btn_buying').click(function () {
        input_buying.find('#Txt_Filter_Buying').val('');
        $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mybuyorder"]) .market_listing_row:not([id^="totalRow"])').show();
        $J('#filter_clear_btn_buying').hide();
    });
    $J('#tabContentsMyListings .market_home_listing_table:has(div[id^="mybuyorder"]) .my_market_header').after(input_buying);
    // $J('#tabContentsMyListings .market_home_listing_table:eq(1) .my_market_header').after(input_buying);
};

var AddSortableColumns = function (jheader) {
    // var jheader = $J('#tabContentsMyListings .market_content_block.my_listing_section.market_home_listing_table:first .market_listing_table_header');
    jheader.find('> span').each(function () {
        if ($J(this).hasClass('market_listing_minimum') || $J(this).hasClass('market_listing_edit_buttons') || $J(this).hasClass('market_listing_listed_date')) return;
        $J(this).addClass('market_sortable_column');
        $J(this).css('display', 'block');
        $J(this).append('<span class="market_sort_arrow" style="display:none"></span>');
        if ($J(this).hasClass('market_listing_buyorder_qty')) {
            var $parent = $J(this);
            $J(this).click(function () {
                jheader.find('.market_sort_arrow').hide();
                var oder = 1;
                if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
                    oder = -1;
                    $parent.find('.market_sort_arrow').text('▼');
                } else {
                    $parent.find('.market_sort_arrow').text('▲');
                }

                $parent.find('.market_sort_arrow').show();
                var $rows = jheader.parent('.market_home_listing_table');
                if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
                var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

                $rowsli.sort(function (a, b) {
                    var an = parseFloat(getPriceAsInt($J(a).find('.market_listing_my_price.market_listing_buyorder_qty').text())),
                        bn = parseFloat(getPriceAsInt($J(b).find('.market_listing_my_price.market_listing_buyorder_qty').text()));
                    if (an == bn) {
                        an = $J(a).find('.market_listing_item_name_link').text();
                        bn = $J(b).find('.market_listing_item_name_link').text();
                    }

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                });

                $rowsli.detach().appendTo($rows);
            });
        } else if ($J(this).hasClass('market_listing_my_price')) {
            var $parent = $J(this);
            $J(this).click(function () {
                jheader.find('.market_sort_arrow').hide();
                var oder = 1;
                if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
                    oder = -1;
                    $parent.find('.market_sort_arrow').text('▼');
                } else {
                    $parent.find('.market_sort_arrow').text('▲');
                }

                $parent.find('.market_sort_arrow').show();
                var $rows = jheader.parent('.market_home_listing_table');
                if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
                var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

                $rowsli.sort(function (a, b) {
                    // var an = parseFloat(/[\d\.]+/.exec($J(a).find('[title="This is the price the buyer pays."]').text())[0]),
                    // bn = parseFloat(/[\d\.]+/.exec($J(b).find('[title="This is the price the buyer pays."]').text())[0]);
                    const extractPrice = function (row) {
                        let isBuyOrder = false;
                        var aprice = $J(row).find('.market_listing_price').children('span:first');
                        if (aprice.hasClass('market_listing_inline_buyorder_qty')) {
                            isBuyOrder = true;
                            aprice = aprice.parent();
                        }
                        aprice = isBuyOrder ? aprice.text().split('@')[1] : aprice.find('span:first').text();
                        return getPriceAsInt(aprice);
                    };

                    var an = extractPrice(a);
                    var bn = extractPrice(b);
                    if (an == bn) {
                        an = $J(a).find('.market_listing_item_name_link').text();
                        bn = $J(b).find('.market_listing_item_name_link').text();
                    }

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                });

                $rowsli.detach().appendTo($rows);
            });
        } else {
            var $parent = $J(this);
            $J(this).click(function () {
                jheader.find('.market_sort_arrow').hide();
                var oder = 1;
                if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
                    oder = -1;
                    $parent.find('.market_sort_arrow').text('▼');
                } else {
                    $parent.find('.market_sort_arrow').text('▲');
                }

                $parent.find('.market_sort_arrow').show();
                var $rows = jheader.parent('.market_home_listing_table');
                if ($rows.find('#tabContentsMyActiveMarketListingsRows').length) $rows = $rows.find('#tabContentsMyActiveMarketListingsRows');
                var $rowsli = $rows.children('.market_listing_row:not([id^="totalRow"])');

                $rowsli.sort(function (a, b) {
                    var an = $J(a).find('.market_listing_item_name_link').text(),
                        bn = $J(b).find('.market_listing_item_name_link').text();

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                });

                $rowsli.detach().appendTo($rows);
            });

            // if ($J(this).is(":contains('PRICE')")) {
        }
    });
}

var UpdateTotalListings = function () {
    if (typeof (window.totalrow) === 'undefined' || window.totalrow) {
        $J('#myListings .market_content_block.my_listing_section.market_home_listing_table').each(function (idx, listingsTable) {
            var totalSelling = 0;
            var totalRecieve = 0;
            const $listingsTable = $J(listingsTable);
            $listingsTable.find('.market_listing_price').children('span').each(function (rowId, price) {
                let isBuyOrder = false;
                var $price = $J(price);
                if ($price.hasClass('market_listing_inline_buyorder_qty')) {
                    isBuyOrder = true;
                    $price = $price.parent();
                }
                // var buyerPrice = isBuyOrder ? /[+-]?([0-9]*[.,])?[0-9]+/.exec($price.text().split('@')[1])[0] : $price.find('span:first').text();
                let buyerPrice;
                let qty = 1;
                if (isBuyOrder) {
                    [qty, buyerPrice] = $price.text().split('@');
                } else {
                    buyerPrice = $price.find('span:first').text();
                }
                var pays = getPriceAsInt(buyerPrice);
                if (!isNaN(pays)) totalSelling += qty * pays;

                var yourPrice = isBuyOrder ? '0.00' : $price.find('span:last').text();
                var recieve = getPriceAsInt(yourPrice.trim().replace('(', '').replace(')', ''));
                if (!isNaN(recieve)) totalRecieve += recieve;
            });

            var priceDiv = $J('<div id="totalRow' + idx + '" class="market_listing_row market_recent_listing_row"><div class="market_listing_right_cell market_listing_edit_buttons">&nbsp;</div>' +
                '<div class="market_listing_right_cell market_listing_my_price">' +
                '<span class="market_table_value">' +
                '<span class="market_listing_price">' +
                '<span style="display: inline-block">' +
                (totalSelling ? '<span>' + formatNumber(totalSelling / 100) + '</span><br />' : '') +
                (totalRecieve ? '<span style="color: #AFAFAF">(' + formatNumber(totalRecieve / 100) + ')</span>' : '') +
                '<span></span></span></div>' +
                '<div class="market_listing_item_name_block">' +
                `<span style="color: #D2D2D2; font-weight: bold; padding-left:50px">${SIHLang.market.total}</a></span><br>` +
                '</div><div style="clear: both"></div></div>');
            $listingsTable.find('.market_listing_table_header').after(priceDiv);
        });

        if (window.overallsum) {
            if ($ACTIVE_LISTING_ROWS === null) getOverallTotal(0);
            else parseListings();
        }
    }
    //$J('#myListings .market_listing_table_header .market_listing_my_price').html((parseInt(totalSelling * 100) / 100) + ' (' + (parseInt(totalRecieve * 100) / 100) + ')');
};

var FetchAllItemsPrices = function () {
    var listings = $J('#myListings .market_listing_row[id^="mylisting"] .market_listing_cancel_button a:not([done])');
    if (listings.length <= 0) return;
    var element = listings[0];
    $J(element).attr('done', 'true');
    var link = decodeURIComponent(element.href);
    var m = removeLinkExp.exec(link);
    if (!m) return;
    var rgItem = g_rgAssets[m[2]][m[3]][m[4]];
    if (!rgItem) return;
    element.rgItem = rgItem;
    getLowestPriceHandler(element.rgItem, '', function (item) {
        var row = $J(element).parent().parent().parent();
        var p = row.find('.market_listing_price span span:nth-child(1)');
        var recieve = getPriceAsInt(p.text());
        var lowest = getPriceAsInt(item.lowestPrice);
        $J(`<div class="market_listing_right_cell market_listing_minimum" style="width: 120px; color: #AFAFAF;">
          ${item.lowestPrice}
        </div>`).insertAfter(row.find('.market_listing_my_price'))
        if (lowest < recieve)
            row.addClass('red-bg');
        FetchAllItemsPrices();
    });
};

var bookmarksLoaded = false;
var ShowBookmarks = function () {
    bookmarksLoaded = true;
    if (bookmarkeditems) {
        $J('#tabContentsMyBookmarks').html('<div class="my_listing_section market_home_listing_table">' +
            '<div class="market_listing_table_header">' +
                '<span class="market_listing_right_cell market_listing_edit_buttons"></span>' +
                '<span class="market_listing_right_cell market_listing_my_price market_sortable_column" style="display: block;">PRICE<span class="market_sort_arrow" style="display:none"></span></span>' +
                '<span class="market_listing_right_cell market_listing_listed_date market_sortable_column">VOLUME<span class="market_sort_arrow" style="display:none"></span></span>' +
                '<span class="market_sortable_column" style="display: block;"><span class="market_listing_header_namespacer"></span>NAME<span class="market_sort_arrow" style="display:none"></span></span>' +
            '</div></div>');

        if (bookmarkscategories) {
            var divCats = $J(`
                <div class="bookmark-categories">
                    <a href="#" class="category active" data-cat="all">${SIHLang.market.all}</a>
                    <a href="#" class="category" data-cat="">${SIHLang.market.general}</a>
                </div>`);
            for (var i in bookmarkscategories) {
                var cat = bookmarkscategories[i];
                divCats.append('<a href="#" class="category" data-cat="' + i + '">' + cat + '</a>')
            }

            divCats.prependTo('#tabContentsMyBookmarks');
            divCats.find('a.category').click(function (e) {
                $J('.category.active').removeClass('active');
                $J(this).addClass('active');
                var cat = $J(this).data('cat');
                if (cat === 'all') {
                    $J('#tabContentsMyBookmarks .market_listing_row').show();
                } else {
                    $J('#tabContentsMyBookmarks .market_listing_row').hide();
                    $J('#tabContentsMyBookmarks .market_listing_row[data-cat="' + cat + '"]').show();
                }
                e.preventDefault();
            });
        }

        $J.each(bookmarkeditems, function (idex, item) {
            if (!item || !item.img || !item.hashmarket) return true;

            var divItem = '<div class="market_listing_row market_recent_listing_row" data-cat="' + (item.cat || '') + '" data-hash="' + item.hashmarket + '" data-appid="' + item.appid + '">' +
                '<img src="' + item.img.replace('360fx360f', '38fx38f') + '" style="border-color: ' + item.color + ';" class="market_listing_item_img" alt="">' +
                    '<div class="market_listing_right_cell market_listing_edit_buttons">' +
                        '<div class="market_listing_cancel_button">' +
                            '<a href="javascript:void(0)" data-hash="' + item.hashmarket + '" class="item_market_action_button item_market_action_button_edit nodisable remove-bookmark">' +
                                '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
                                '<span class="item_market_action_button_contents">' + SIHLang.market.remove + '</span>' +
                                '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
                                '<span class="item_market_action_button_preload"></span>' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="market_listing_right_cell market_listing_my_price">' +
                        '<span class="market_table_value">' +
                            '<span class="market_listing_price">' +
                                '<span style="display: inline-block">' +
                                    '<span title="This is the lowest price." class="bookmark-price">loading</span><br>' +
                                    '<span title="This is the seller price." class="bookmark-seller-price" style="color: #AFAFAF"></span>' +
                                '</span>' +
                            '</span>' +
                        '</span>' +
                    '</div>' +
                    '<div class="market_listing_right_cell market_listing_my_price">' +
                        '<span class="market_table_value">' +
                            '<span class="market_listing_price">' +
                                '<span style="display: inline-block">' +
                                    '<span class="bookmark-volume" title="Number of this item sold in the last 24 hours">loading</span><br />' +
                                    '<span title="This is the median price." class="bookmark-median-price" style="color: #AFAFAF"></span>' +
                                '</span>' +
                            '</span>' +
                        '</span>' +
                    '</div>' +
                    '<div class="market_listing_item_name_block">' +
                        '<span class="market_listing_item_name" style="color: ' + item.color + ';"><a class="market_listing_item_name_link" href="//steamcommunity.com/market/listings/' + item.hashmarket + '">' + item.name + '</a></span><br>' +
                        '<span class="market_listing_game_name">' + item.gamename + '</span>' +
                    '</div>' +
                    '<div style="clear: both"></div>' +
                '</div>';

            var $div = $J(divItem);
            if (item.cat) {
                $div.data('cat', item.cat);
            }
            $J('#tabContentsMyBookmarks .my_listing_section').append($div);

            var itemLink = "//steamcommunity.com/market/priceoverview/?appid=" + item.appid
                + "&country=" + countryCode + "&currency=" + currencyId
                + "&market_hash_name=" + item.hashmarket.substring(item.hashmarket.indexOf('/') + 1);

            PriceQueue.GetPrice({
                method: 'GET',
                url: itemLink,
                innerDiv: $div,
                success: function (response) {
                    if (response.success) {
                        $div.find('.bookmark-price').html(response.lowest_price);
                        $div.find('.bookmark-median-price').html(response.median_price);

                        var inputValue = getPriceAsInt(response.lowest_price);
                        var nAmount = inputValue;
                        var priceWithoutFee = null;
                        if (inputValue > 0 && nAmount == parseInt(nAmount)) {
                            var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
                            nAmount = nAmount - feeInfo.fees;
                            priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
                        }

                        $div.find('.bookmark-seller-price').html('(' + priceWithoutFee + ')');
                        var volume = (response.volume) ? response.volume : '';
                        $div.find('.bookmark-volume').html(volume);
                    }
                },
                error: function () { }
            });
        });
    }
    if (bookmarkTimer) window.clearTimeout(bookmarkTimer);
    bookmarkTimer = window.setTimeout(UpdateBookmarksPrices, 10000);
};

var bookmarkTimer = null;
var UpdateBookmarksPrices = function () {
    if (bookmarkTimer) window.clearTimeout(bookmarkTimer);

    var date = new Date();
    var strTime = date.toLocaleTimeString();
    $J('#tabContentsMyBookmarks .my_listing_section .market_listing_table_header .market_listing_right_cell.market_listing_edit_buttons').text(strTime);
    $J('#tabContentsMyBookmarks .my_listing_section .market_listing_row.market_recent_listing_row').each(function (idx) {
        var $div = $J(this);
        var data = $div.data();
        var itemLink = '//steamcommunity.com/market/priceoverview/?appid=' + data.appid
            + '&country=' + countryCode + '&currency=' + currencyId
            + '&market_hash_name=' + data.hash.substring(data.hash.indexOf('/') + 1);

        PriceQueue.GetPrice({
            method: 'GET',
            url: itemLink,
            innerDiv: $div,
            success: function (response) {
                if (response.success) {
                    var priceSpan = $div.find('.bookmark-price');
                    var oldPrice = priceSpan.text();
                    priceSpan.text(response.lowest_price);
                    $div.find('.bookmark-median-price').html(response.median_price);
                    if (oldPrice != priceSpan.text()) {
                        BlinkElement(priceSpan);
                    }

                    var inputValue = getPriceAsInt(response.lowest_price);
                    var nAmount = inputValue;
                    var priceWithoutFee = null;
                    if (inputValue > 0 && nAmount == parseInt(nAmount)) {
                        var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
                        nAmount = nAmount - feeInfo.fees;
                        priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
                    }

                    $div.find('.bookmark-seller-price').html('(' + priceWithoutFee + ')');
                    var volume = (response.volume) ? response.volume : '';
                    $div.find('.bookmark-volume').html(volume);
                }
            },
            error: function () { }
        });
    });

    if ($J('#tabMyBookmarks').is('.market_tab_well_tab_active')) {
        // If all price of bookmark was loaded clean cache and update prices
        if (Object.keys(bookmarkeditems).length == Object.keys(PriceQueue._cache).length) {
            PriceQueue._cache = {};
        }
        bookmarkTimer = window.setTimeout(UpdateBookmarksPrices, 10000);
    }
};

var oder = -1;
var BlinkElement = function (el) {
    $J(el).css({ backgroundColor: 'rgba(255,0,0,1)' }).animate({ backgroundColor: 'rgba(255,0,0,0)' }, 1000);
};

var GetActualItemPrice = function (self) {
    var nameBlock = $J(self).parent().parent().parent(),
        $itemNameElement = nameBlock.find('.market_listing_item_name'),
        gameName = nameBlock.find('.market_listing_game_name').text(),
        hashName = '';

    hashName = assetList.get($itemNameElement.text());
    if (hashName && apps[gameName] !== undefined) {
        $J(self).text('...');
        $J.ajax({
            url: '//steamcommunity.com/market/priceoverview/',
            method: 'get',
            data: { currency: currencyId, appid: apps[gameName], market_hash_name: hashName }
        }).done(function (res) {
            $J(self).text(res.lowest_price);
        }).fail(function () {
            $J(self).text('Check price');
        });
    }
};

var RenderPriceButtons = function () {
    var $tableRows = $J('#tabContentsMyMarketHistoryRows .market_listing_row');
    $J.each($tableRows, function (i, element) {
        var appName = $J(element).find('.market_listing_game_name').text();
        var price = $J(element).find('.market_listing_price').text().trim();

        if (price && apps[appName] && !$J(element).find('.price-label').length) {
            var html = '<span class="price-label"><span class="label" onclick="GetActualItemPrice(this); return false;">Check price</span></span>';
            $J(element).find('.market_listing_their_price').append(html);
        }
    });
};

var GetAppList = function () {
    $J.ajax({
        url: '//steamcommunity.com/market/myhistory/render/?start=' + startPage + '&count=' + window.historypagesize,
        method: 'get'
    }).done(function (res) {
        assetList = new Map();
        for (var appId in res.assets) {
            var items = res.assets[appId][1] || res.assets[appId][2];
            for (var i in items) {
                assetList.set(items[i].name, items[i].market_hash_name);
            }
        }
    });
};

const getListingSectionType = function (section) {
    if (section.find('#tabContentsMyActiveMarketListingsRows').length > 0) {
        return 'sell_listings';
    } else if (section.find('div[id^="mybuyorder_"]').length > 0) {
        return 'buy_orders';
    } else {
        return 'await_listings';
    }
};

var addHideListingButton = function () {
    $J('#tabContentsMyListings .market_home_listing_table').each(function () {
        const sectionId = getListingSectionType($J(this));
        const HIDE_LISTINGS = GetCookie(sectionId) || 'false';
        const btnPanel = `
            <a href="javascript:void(0);" id="${sectionId}" data-hidden="${HIDE_LISTINGS}" class="hide_listing item_market_action_button item_market_action_button_green" style="float: right; right: 15px; position: relative;">
                <span class="item_market_action_button_contents" style="min-width: 80px;">${HIDE_LISTINGS === 'true' ? SIHLang.market.showlistings : SIHLang.market.hidelistings}</span>
            </a>`;
        $J(this).prepend(btnPanel);
        if (HIDE_LISTINGS === 'true') $J(this).children('div').hide();
        $J(this).find('.hide_listing').click(function () {
            const $elem = $J(this);
            const sectionId = $elem.attr('id');
            const isHidden = $elem.data('hidden');
            if (isHidden) {
                $elem.find('.item_market_action_button_contents').text(SIHLang.market.hidelistings);
                $elem.parent().children('div').show();
            } else {
                $elem.find('.item_market_action_button_contents').text(SIHLang.market.showlistings);
                $elem.parent().children('div').hide();
            }
            SetCookie(sectionId, !isHidden, 7, '/market');
            $elem.data('hidden', !isHidden);
        });
    });
};

if (IS_ENABLED_SIH) {
    $J(function () {
        GetAppList();
        // var btReload = CreateMarketActionButton('green', 'javascript:void(0)', SIHLang.market.reloadlistings);
        // $J(btReload).attr('accesskey', 'r');
        var btReload = $J(`<a class="btnControl" href="javascript:void(0)" accesskey="r" title="${SIHLang.market.reloadlistings}">
          <span class="icon-reload"></span>
        </a>`);
        btReload.click(function () {
            // ReloadListings();
            htmlListings = '';
            $ACTIVE_LISTING_ROWS = null;
            RefreshMyMarketListings();
        });
        $J('.pick_and_sell_button .item_market_action_button_contents').css({ minWidth: '80px' });
        if ($J('#tabContentsMyListings #tabContentsMyActiveMarketListingsTable:not(:has(.market_listing_table_message))').length) {
            $J('.pick_and_sell_button').prepend(btReload);
        }

        jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function (arg) {
            return function (elem) {
                return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
            };
        });

        if (window.bookmarkeditems) {
            var bookmarkcount = 0;
            if (window.bookmarkeditems) {
                for (var i in window.bookmarkeditems)
                    bookmarkcount++;
            }
            if (bookmarkcount) {
                var ftab = $J('<a id="tabMyBookmarks" class="market_tab_well_tab market_tab_well_tab_inactive" href="#">' +
                    '<span class="market_tab_well_tab_left"></span>' +
                    '<span class="market_tab_well_tab_contents">' + SIHLang.market.mybookmarks + '<span class="my_market_header_count">(<span id="my_market_activelistings_number">' + bookmarkcount + '</span>)</span>' +
                    '</span>' +
                    '<span class="market_tab_well_tab_right"></span>' +
                    '<span class="market_tab_well_tab_preload"></span>' +
                    '</a>');

                $J('#myMarketTabs .market_tab_well_tabs').append('&nbsp;').append(ftab);

                var fdiv = $J('<div id="tabContentsMyBookmarks" class="my_listing_section market_content_block" style="display:none">' +
                    '<div style="text-align: center"><img src="//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Loading"></div></div>');
                $J('#tabContentsMyMarketHistory').after(fdiv);
                ftab.click(function (e) {
                    $J('#tabContentsMyListings, #tabContentsMyMarketHistory').hide();
                    $J('#tabContentsMyBookmarks').show();
                    $J('#tabMyListings, #tabMyMarketHistory').removeClass('market_tab_well_tab_active').addClass('market_tab_well_tab_inactive');
                    $J('#tabMyBookmarks').removeClass('market_tab_well_tab_inactive').addClass('market_tab_well_tab_active');
                    if (bookmarksLoaded) {
                        UpdateBookmarksPrices();
                    } else {
                        ShowBookmarks();
                    }
                    e.preventDefault();
                });

                $J('#tabMyListings, #tabMyMarketHistory').click(function () {
                    $J('#tabContentsMyBookmarks').hide();
                    $J('#tabMyBookmarks').removeClass('market_tab_well_tab_active').addClass('market_tab_well_tab_inactive');
                });

                var sortByName = function (a, b) {
                    var an = $J(a).find('.market_listing_item_name_link').text(),
                        bn = $J(b).find('.market_listing_item_name_link').text();

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                };

                var sortByPrice = function (a, b) {
                    var an = getPriceAsInt($J(a).find('.bookmark-price').text()),
                        bn = getPriceAsInt($J(b).find('.bookmark-price').text());

                    if (an == bn) {
                        an = $J(a).find('.market_listing_item_name_link').text(),
                            bn = $J(b).find('.market_listing_item_name_link').text();
                    }

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                };

                var sortByVolume = function (a, b) {
                    var an = parseInt(getPriceAsInt($J(a).find('.bookmark-volume').text())),
                        bn = parseInt(getPriceAsInt($J(b).find('.bookmark-volume').text()));

                    if (an == bn) {
                        an = $J(a).find('.market_listing_item_name_link').text(),
                            bn = $J(b).find('.market_listing_item_name_link').text();
                    }

                    if (an > bn) {
                        return 1 * oder;
                    }
                    if (an < bn) {
                        return -1 * oder;
                    }
                    return 0;
                };

                $J('#tabContentsMyBookmarks').on('click', '.market_sortable_column', function () {
                    var $parent = $J(this);
                    var sortFunc = sortByName;
                    if ($J(this).text().startsWith('PRICE')) {
                        sortFunc = sortByPrice;
                    } else if ($J(this).text().startsWith('VOLUME')) {
                        sortFunc = sortByVolume;
                    }

                    $J('#tabContentsMyBookmarks .market_sortable_column').find('.market_sort_arrow').hide();
                    oder = 1;
                    if ($parent.find('.market_sort_arrow').is(':contains("▲")')) {
                        oder = -1;
                        $parent.find('.market_sort_arrow').text('▼');
                    } else {
                        $parent.find('.market_sort_arrow').text('▲');
                    }

                    $parent.find('.market_sort_arrow').show();
                    var $rows = $J('#tabContentsMyBookmarks').find('.market_home_listing_table'),
                        $rowsli = $rows.children('.market_listing_row');

                    $rowsli.sort(sortFunc);

                    $rowsli.detach().appendTo($rows);
                });
            }
        }

        $J('.my_listing_section.market_home_listing_table .market_listing_table_header').each(function () {
            const $header = $J(this);
            if ($header.parent().has('div[id^="mylisting"]').length > 0) {
                $J(`<span class="market_listing_right_cell market_listing_minimum can_combine" style="width: 120px;">${SIHLang.market.minimum}</span>`).insertAfter($header.find('.market_listing_my_price'));
            }
            AddSortableColumns($header);
        });
        // UpdateTotalListings();
        // AddFilter();
        if (LoadRecentListings) {
            LoadRecentListings = function (type, rows) {
                if (g_bBusyLoadingMore) {
                    return;
                }

                var elRows = $(rows);

                elRows.update();

                g_bBusyLoadingMore = true;
                new Ajax.Request('//steamcommunity.com/market/recent', {
                    method: 'get',
                    parameters: {
                        country: g_strCountryCode,
                        language: g_strLanguage,
                        currency: typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo['wallet_currency'] : 1      //time: g_rgRecents[type]['time'],
                        //listing: g_rgRecents[type]['listing']
                    },
                    onSuccess: function (transport) {
                        if (transport.responseJSON) {
                            var response = transport.responseJSON;

                            if (response.assets.length != 0) {
                                g_rgRecents[type]['time'] = response.last_time;
                                g_rgRecents[type]['listing'] = response.last_listing;

                                elRows.update(response.results_html);

                                MergeWithAssetArray(response.assets);
                                MergeWithListingInfoArray(response.listinginfo);
                                MergeWithAppDataArray(response.app_data);
                                eval(response.hovers);
                            }
                        }
                    },
                    onComplete: function () {
                        g_bBusyLoadingMore = false;
                        FraudAlert();
                    }
                });
            }
        }

        // tabContentsMyListings
        // tabContentsMyActiveMarketListingsTable
        // tabContentsMyActiveMarketListingsRows
        // g_bBusyLoadingMyMarketListings
        // g_oMyListings
        // RefreshMyMarketListings
        orgRefreshMyMarketListings = RefreshMyMarketListings;
        RefreshMyMarketListings = function (bScrollIntoView) {
            if (g_bBusyLoadingMyMarketListings) {
                return;
            }

            g_bBusyLoadingMyMarketListings = true;
            var elMyMarketListings = $('tabContentsMyListings');
            new Ajax.Request('//steamcommunity.com/market/mylistings', {
                method: 'get',
                parameters: {
                    count: g_nMySellListingsPageSize
                },
                onSuccess: function (transport) {
                    if (transport.responseJSON) {
                        var response = transport.responseJSON;

                        elMyMarketListings.innerHTML = response.results_html;
                        $('my_market_activelistings_number').update(response.num_active_listings);

                        MergeWithAssetArray(response.assets);
                        eval(response.hovers);
                        RemoveTotalAndFilter();
                        $J('.my_listing_section.market_home_listing_table .market_listing_table_header').each(function () {
                            const $header = $J(this);
                            if ($header.parent().has('div[id^="mylisting"]').length > 0) {
                                $J(`<span class="market_listing_right_cell market_listing_minimum can_combine" style="width: 120px;">${SIHLang.market.minimum}</span>`).insertAfter($header.find('.market_listing_my_price'));
                            }
                            AddSortableColumns($header);
                        });
                        UpdateTotalListings();
                        AddFilter();
                        if (window.highlight) FetchAllItemsPrices();

                        if (response.total_count > response.pagesize) {
                            g_oMyListings = new CAjaxPagingControls(
                                {
                                    query: '',
                                    total_count: response.total_count,
                                    pagesize: response.pagesize,
                                    prefix: 'tabContentsMyActiveMarketListings',
                                    class_prefix: 'market'
                                }, '//steamcommunity.com/market/mylistings/'
                            );

                            g_oMyListings.SetResponseHandler(function (response) {
                                MergeWithAssetArray(response.assets);
                                eval(response.hovers);
                                if (window.highlight) FetchAllItemsPrices();
                                RemoveTotalAndFilter();
                                UpdateTotalListings();
                                AddFilter();
                            });

                            g_nMySellListingsPageSize = response.pagesize;
                            $J('#my_listing_pagesize_10').addClass('whiteLink').removeClass('disabled');
                            $J('#my_listing_pagesize_30').addClass('whiteLink').removeClass('disabled');
                            $J('#my_listing_pagesize_100').addClass('whiteLink').removeClass('disabled');
                            $J('#my_listing_pagesize_' + g_nMySellListingsPageSize).removeClass('whiteLink').addClass('disabled');

                            if (bScrollIntoView) {
                                var elTable = $J('#tabContentsMyActiveMarketListingsTable').get(0);
                                if (typeof elTable.scrollIntoView !== 'undefined') {
                                    elTable.scrollIntoView();
                                }
                            }
                        }
                    }
                },
                onComplete: function () {
                    g_bBusyLoadingMyMarketListings = false;
                    addHideListingButton();
                }
            });
        };
        Market_SetActiveLisitingsPerPage(g_nMySellListingsPageSize);

        if (typeof (window.historypagesize) !== 'undefined' && window.historypagesize != 10) {
            orgLoadMarketHistory = LoadMarketHistory;
            LoadMarketHistory = function () {
                if (g_bBusyLoadingMarketHistory) {
                    return;
                }

                g_bBusyLoadingMarketHistory = true;
                var elMyHistoryContents = $('tabContentsMyMarketHistory');
                new Ajax.Request('//steamcommunity.com/market/myhistory', {
                    method: 'get',
                    parameters: {
                        count: window.historypagesize
                    },
                    onSuccess: function (transport) {
                        if (transport.responseJSON) {
                            var response = transport.responseJSON;

                            elMyHistoryContents.innerHTML = response.results_html;

                            MergeWithAssetArray(response.assets);
                            eval(response.hovers);

                            g_oMyHistory = new CAjaxPagingControls(
                                {
                                    query: '',
                                    total_count: response.total_count,
                                    pagesize: response.pagesize,
                                    prefix: 'tabContentsMyMarketHistory',
                                    class_prefix: 'market'
                                }, '//steamcommunity.com/market/myhistory/'
                            );

                            g_oMyHistory.SetResponseHandler(function (response) {
                                MergeWithAssetArray(response.assets);
                                eval(response.hovers);
                            });
                        }
                    },
                    onComplete: function () {
                        g_bBusyLoadingMarketHistory = false;
                    }
                });
            }
        }
        //$J('#sellListingsMore').html('Show more (alt + S)');
        //$J('#sellListingsMore').attr('accesskey', 's');
        if (window.highlight) {
            FetchAllItemsPrices();
        }

        $J('#tabMyMarketHistory').click(function () {
            setTimeout(RenderPriceButtons, 1000);
        });
        $J('#mainContents')
            .on('click', '#tabContentsMyMarketHistory_links .market_paging_pagelink', function () {
                startPage = (parseInt($J(this).text()) - 1) * window.historypagesize;
                GetAppList();
                setTimeout(RenderPriceButtons, 1000);
            })
            .on('click', '#tabContentsMyMarketHistory_btn_next', function () {
                startPage += window.historypagesize;
                GetAppList();
                setTimeout(RenderPriceButtons, 1000);
            })
            .on('click', '#tabContentsMyMarketHistory_btn_prev', function () {
                startPage -= window.historypagesize;
                GetAppList();
                setTimeout(RenderPriceButtons, 1000);
            });
    });
}

//------------------------------------------------------------------------ Market graphs

var cacheHist = { lastIdx: -1, lastCount: -1 };
var missingIdx = [];
var cacheSales = { plus: {}, minus: {} };
var _maxSize = 1000;
var totalPlus = 0, totalMinus = 0;
var regHis = /<div class="market_listing_left_cell market_listing_gainorloss">\s+?([\+\-])\s+?<\/div>[\s\S]+?<span class="market_listing_price">([\s\S]+?)<\/span>[\s\S]+?<div class="market_listing_right_cell market_listing_listed_date">([\s\S]+?)<\/div>/gmi;
var ProcessPriceData = function (res) {
    var m;
    var htmlres = res.results_html;
    while (m = regHis.exec(htmlres)) {
        var sign = m[1].trim(), price = m[2].trim(), date = m[3].trim();

        var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, ''));

        if (pp) {
            pp = pp[1].replace(/,(\d\d)$/g, '.$1').replace(/.(\d\d\d)/g, '$1');
        } else {
            pp = 0;
        }

        if (sign === '-') {
            totalMinus += parseFloat(pp);
        } else {
            totalPlus += parseFloat(pp);
        }
    }
    totalMinus = parseFloat(totalMinus.toFixed(2));
    totalPlus = parseFloat(totalPlus.toFixed(2));

    // console.log('Total', totalMinus + ' ' + totalPlus);
    setTimeout(function () {
        GetPriceHistory(cacheHist.lastIdx + _maxSize);
    }, 5000);
};

var GetPriceHistory = function (startIdx) {
    if (typeof (startIdx) != 'undefined') {
        var count = (cacheHist.lastCount - startIdx < _maxSize ? cacheHist.lastCount - startIdx : _maxSize), start = cacheHist.lastCount - startIdx - count;
        if (count <= 0) return;
        // console.log('Get history: ' + start + ' - ' + count);
        $J.ajax({
            url: '//steamcommunity.com/market/myhistory/render/',
            data: { start: start, count: count },
            success: function (res) {
                if (res.success) {
                    cacheHist.lastCount = res.total_count;
                    cacheHist.lastIdx = startIdx;
                    ProcessPriceData(res);
                    //setTimeout(function () {
                    //    GetPriceHistory(0);
                    //});
                } else {
                    setTimeout(function () {
                        GetPriceHistory(startIdx);
                    }, 500);
                }
            }
        });
    } else {
        // console.log('Init get history');
        totalPlus = 0, totalMinus = 0;
        $J.ajax({
            url: '//steamcommunity.com/market/myhistory/render/?start=0&count=1',
            success: function (res) {
                if (res.success) {
                    cacheHist.lastCount = res.total_count;
                    setTimeout(function () {
                        GetPriceHistory(0);
                    }, 500);
                } else {

                }
            }
        });
    }
};
