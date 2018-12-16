var itemRegExp = /BuildHover.*;/i;
var _cacheItems = {};
var _tradesTimers = {};
var _openedWins = {};
var g_rgWalletInfo = {
    wallet_fee: 1,
    wallet_fee_base: 0,
    wallet_fee_minimum: 1,
    wallet_fee_percent: 0.05,
    wallet_publisher_fee_percent_default: 0.10
};

var UpdateTotal = function (rgItem, elem) {
  var el = elem !== null ? elem : $J(`div[data-economy-item*="${rgItem.appid}/${rgItem.classid}${rgItem.instanceid ? '/' + rgItem.instanceid : ''}"]`);

    var conts = el.parent('.tradeoffer_item_list');
    conts.each(function (idx, el) {
        var cont = $J(this);
        var tLabel = cont.find('.total_price');
        var total = 0, totalNoTax = 0, gemprices = 0, itemcount = 0;
        cont.find('.trade_item').each(function (i) {
            itemcount++;
            var rgI = this.rgItem;
            if (rgI) {
                if (rgI.lowestPrice)//&& rgI.isUnusualCour == null)
                {
                    var price = parseInt(parseFloat(getNumber(rgI.lowestPrice)) * 100);

                    var publisherFee = typeof rgI.market_fee != 'undefined' ? rgI.market_fee : 0.1;

                    var feeInfo = CalculateFeeAmount(price, publisherFee);
                    totalNoTax += (price - feeInfo.fees) / 100;

                    total += parseFloat(getNumber(rgI.lowestPrice));
                }

                if (rgI.gemPrices != 'undefined' && rgI.gemPrices != null) {
                    $J.each(rgI.gemPrices, function (k, v) {
                        gemprices += parseFloat(getNumber(v.lowestPrice));
                    });
                }
            }

            if (this.inited == null) {
                PrebuildData(this, $J(this).attr('data-economy-item'));//.QueueAjaxRequestIfNecessary();
            }
        });

        var str = '' + formatNumber(total) + ' (' + formatNumber(totalNoTax) + ')';
        if (gemprices > 0) {
            str += ' - Gems total price: ' + formatNumber(gemprices);
        }

        str += ' <span style="float: right; padding-right: 15px">' + itemcount + ' item(s)</span>';
        if (cont.find('.price-tag.no-price').length > 0) {
            tLabel.addClass('warning');
        }
        tLabel.html(str);
    });
};

var CheckItem = function (prefix, item, owner) {
    if (!item.marketable) {
        var divPricetag = $J('<div class="price-tag">');
        divPricetag.html('No price');
        divPricetag.addClass('no-price');
        $J(owner).append(divPricetag);
        return;
    }

    getLowestPriceHandler(item, prefix, function (rgI) {
        // var el = $J('div[data-economy-item^="' + item.appid + '/' + item.contextid + '/' + item.id + '/"]');
        // var el = $J(`div[data-economy-item*="${item.appid}/${item.classid}${item.instanceid ? '/' + item.instanceid : ''}"]`);
        var $elem = $J(owner);
        if ($elem.find('.price-tag').length == 0) {
            var divPricetag = $J('<div class="price-tag">');
            divPricetag.html(rgI.lowestPrice);
            if (rgI.lowestPrice == 'Can\'t get price') {
                divPricetag.addClass('no-price');
            }
            $elem.append(divPricetag);
            UpdateTotal(rgI, $elem);
        }
    });

    _cacheItems[`${item.appid}/${item.classid}${item.instanceid ? '/' + item.instanceid : ''}`] = item;
    var el = $J(`div[data-economy-item*="${item.appid}/${item.classid}${item.instanceid ? '/' + item.instanceid : ''}"]`);
    el.each(function (e, i) {
        this.rgItem = item;
    });
};

var PrebuildData = function (ele, key, getprice) {
    var rgItemKey = key.split('/');
    if (rgItemKey.length == 3 || rgItemKey.length == 4) {
        ele.inited = true;
        var strURL = null;
        var appid = rgItemKey[0];

        if (appid == 'classinfo') {
            // class info style
            appid = rgItemKey[1];
            var classid = rgItemKey[2];
            var instanceid = (rgItemKey.length > 3 ? rgItemKey[3] : 0);
            strURL = 'economy/itemclasshover/' + appid + '/' + classid + '/' + instanceid;
            strURL += '?content_only=1&l=english';
        } else {
            // real asset
            var contextid = rgItemKey[1];
            var assetid = rgItemKey[2];
            if (_cacheItems[appid + '/' + contextid + '/' + assetid] != null) return;

            var strURL = 'economy/itemhover/' + appid + '/' + contextid + '/' + assetid;
            strURL += '?content_only=1&omit_owner=1&l=english';
            if (rgItemKey.length == 4 && rgItemKey[3]) {
                var strOwner = rgItemKey[3];
                if (strOwner.indexOf('id:') == 0) {
                    strURL += '&o_url=' + strOwner.substr(3);
                } else {
                    strURL += '&o=' + strOwner;
                }
            }
        }
        //console.log(strURL);

        //return new CDelayedAJAXData(strURL, 100);
        //var $HoverContent = $J('<div/>', { 'class': 'economyitem_hover_content' });

        $J.ajax({
            url: window.location.protocol + "//steamcommunity.com/" + strURL,
            cache: true,
            data: {l: 'english'}
        }).done(function (data) {
            var match = /BuildHover\( '(.*)', (.*)\);/i.exec(data);
            if (match !== null) {
                const pref = match[1];
                const item = JSON.parse(match[2]);
                CheckItem(pref, item, ele);
            }
            //console.log(data);
            //$HoverContent.children().detach();
            //$HoverContent.append(m_$Data);
        });
    } else {
        return null;
    }
};

var jpcallback = function (data) {
};

var GetAllPrice = function (parent) {
    parent.find('.trade_item').each(function () {
        if (this.inited == null) {
            PrebuildData(this, $J(this).attr('data-economy-item'));//.QueueAjaxRequestIfNecessary();
        // } else {
        //    getLowestPriceHandler(this.rgItem, '');
        }

        //$J(this).trigger('mouseenter');
    });
};

$J(function () {
    var warningMsg = $J('<div style="color: red; z-index: 2">Warning! This is an empty trade offer, you will not receive anything after accepted.<br /> <a href="https://support.steampowered.com/kb_article.php?ref=2178-QGJV-0708#whatoffer" target="_blank">Steam wallet funds can not be included in trade, or trade offer.</a></div>');
    warningMsg.click(function (e) {
        e.stopPropagation();
    });
    var emptyTradeOffers = $J('.tradeoffer_items.primary .tradeoffer_item_list:not(:has(.trade_item ))');
    emptyTradeOffers.append(warningMsg);
    emptyTradeOffers.parents('.tradeoffer_items_ctn').find('.link_overlay').css('top', '110px');
    $J('.tradeoffer_item_list').append('<div class="total_price total" style="cursor:pointer; font-weight: bold; font-size: 15px">Click to get total price of items</div>');
    $J('.tradeoffer_footer_actions').prepend('<a class="offer_price whiteLink" href="javascript:void(0);" style="cursor:pointer;">Get total price</a> | ');

    if (window.quickrefuse) {
        $J('.tradeoffer_footer_actions').prepend('<a class="refuse_trade whiteLink" href="#" style="cursor:pointer;">Quick refuse</a> | ');
    }
    if (window.quickaccept) {
        $J('.tradeoffer_footer_actions').prepend('<a class="accept_trade whiteLink" href="#" style="cursor:pointer;">Quick accept</a> | ');
    }

    $J('.offer_price').click(function () {
        GetAllPrice($J(this).parents('.tradeoffer'));
        return false;
    });

    $J('.accept_trade').click(function () {
        if ($J(this).prop('disabled')) return false;
        var idTrade = $J(this).parents('.tradeoffer').prop('id').substr(13);
        if (_tradesTimers[idTrade]) {
            window.clearInterval(_tradesTimers[idTrade].timer);
            _tradesTimers[idTrade] = null;
            $J(this).html('Quick accept');
            return false;
        }
        if (window.quickacceptprompt && !confirm('Are you sure?')) {
            return false;
        }
        if (window.qadelay) {
            _tradesTimers[idTrade] = {
                timer: window.setInterval('TradeAcceptTimerTick(' + idTrade + ')', 1000),
                remain: window.qadelay
            };
            $J(this).html('Cancel (' + (window.qadelay < 10 ? '0' : '') + window.qadelay + ')');
        } else if (window.qadelay == 0) {
            var link = $J(this);
            link.html('Accepting...');
            link.prop('disabled', true);
            AcceptTradeOffer(idTrade);
        }
        return false;
    });

    $J('.refuse_trade').click(function () {
        if ($J(this).prop('disabled')) return false;
        var idTrade = $J(this).parents('.tradeoffer').prop('id').substr(13);
        if (_tradesTimers[idTrade]) {
            window.clearInterval(_tradesTimers[idTrade].timer);
            _tradesTimers[idTrade] = null;
            $J(this).html('Quick refuse');
            return false;
        }
        if (window.quickrefuseprompt && !confirm('Are you sure?')) {
            return false;
        }
        if (window.qrdelay) {
            _tradesTimers[idTrade] = {
                timer: window.setInterval('TradeRefuseTimerTick(' + idTrade + ')', 1000),
                remain: window.qrdelay
            };
            $J(this).html('Cancel (' + (window.qrdelay < 10 ? '0' : '') + window.qrdelay + ')');
        } else if (window.qrdelay == 0) {
            var link = $J(this);
            link.html('Refusing...');
            link.prop('disabled', true);
            RefuseTradeOffer(idTrade);
        }
        return false;
    });

    $J('.total_price').click(function () {
        var cont = $J(this).parent('.tradeoffer_item_list');
        GetAllPrice(cont);
    });

    $J(function () {
        $J(window).on('message', function (event) {
            var origin = event.originalEvent.origin;
            var data = event.originalEvent.data;
            if (origin && data &&
                ('http://steamcommunity.com/'.indexOf(origin) == 0 || 'https://steamcommunity.com/'.indexOf(origin) == 0)) {
                if (data.type == 'accepted' || data.type == 'await_confirm' && _openedWins[data.tradeofferid]) {
                    _openedWins[data.tradeofferid].close();
                }
            }
        });
    });

    var category = $J('.right_controls_large_block_active_bg').parent();
    if (category.length && window._apikey !== '') {
        $J.ajax({
            url: 'https://api.steampowered.com/IEconService/GetTradeOffers/v1/',
            data: {get_sent_offers: 1, get_received_offers: 1, key: window._apikey}
        }).done(function (result) {
            var sentCounters = {}, receivedCounters = {};

            $J.each((result.response.trade_offers_sent || []), function (i, row) {
                if (sentCounters[row.accountid_other]) {
                    sentCounters[row.accountid_other].count++;
                } else {
                    sentCounters[row.accountid_other] = {count: 1};
                }
            });
            $J.each((result.response.trade_offers_received || []), function (i, row) {
                if (receivedCounters[row.accountid_other]) {
                    receivedCounters[row.accountid_other].count++;
                } else {
                    receivedCounters[row.accountid_other] = {count: 1};
                }
            });

            $J('.tradeoffer').each(function (i, el) {
                var tradeId = el.getAttribute('id').split('_')[1], primary = '', secondary = '';
                var primaryProfileId = $J(el).find('.tradeoffer_items.primary .tradeoffer_avatar').data('miniprofile');
                var secondaryProfileId = $J(el).find('.tradeoffer_items.secondary .tradeoffer_avatar').data('miniprofile');

                if (sentCounters[secondaryProfileId] !== undefined && receivedCounters[secondaryProfileId] !== undefined) {
                    primary = 'Sent: ' + sentCounters[secondaryProfileId].count;
                    secondary = 'Received: ' + receivedCounters[secondaryProfileId].count;
                }
                if (receivedCounters[primaryProfileId] !== undefined && sentCounters[primaryProfileId] !== undefined) {
                    secondary = 'Sent: ' + sentCounters[primaryProfileId].count;
                    primary = 'Received: ' + receivedCounters[primaryProfileId].count;
                }

                $J('#tradeofferid_' + tradeId + ' .tradeoffer_items.primary .tradeoffer_items_header').append('<div class="label">' + primary + '</div>');
                $J('#tradeofferid_' + tradeId + ' .tradeoffer_items.secondary .tradeoffer_items_header').append('<div class="label">' + secondary + '</div>');
            });
        });
    }
});

var TradeAcceptTimerTick = function (IdTradeOffer) {
    if (!_tradesTimers[IdTradeOffer]) {
        return;
    }
    var remain = _tradesTimers[IdTradeOffer].remain;
    var link = $J('#tradeofferid_' + IdTradeOffer).find('.accept_trade');
    if (remain == 0) {
        link.html('Accepting...');
        link.prop('disabled', true);
        window.clearInterval(_tradesTimers[IdTradeOffer].timer);
        AcceptTradeOffer(IdTradeOffer);
    } else {
        remain--;
        _tradesTimers[IdTradeOffer].remain = remain;
        link.html('Cancel (' + (remain < 10 ? '0' : '') + remain + ')');
    }
};

var TradeRefuseTimerTick = function (IdTradeOffer) {
    if (!_tradesTimers[IdTradeOffer]) {
        return;
    }
    var remain = _tradesTimers[IdTradeOffer].remain;
    var link = $J('#tradeofferid_' + IdTradeOffer).find('.refuse_trade');
    if (remain == 0) {
        link.html('Refusing...');
        link.prop('disabled', true);
        window.clearInterval(_tradesTimers[IdTradeOffer].timer);
        RefuseTradeOffer(IdTradeOffer);
    } else {
        remain--;
        _tradesTimers[IdTradeOffer].remain = remain;
        link.html('Cancel (' + (remain < 10 ? '0' : '') + remain + ')');
    }
};

var regRpLink = /javascript:ReportTradeScam\( '(\d+)',/;
var AcceptTradeOffer = function (IdTradeOffer) {
    _openedWins[IdTradeOffer] = window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihaccept=' + g_sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
    return;
};
var RefuseTradeOffer = function (IdTradeOffer) {
    _openedWins[IdTradeOffer] = window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihrefuse=' + g_sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
    return;
};
