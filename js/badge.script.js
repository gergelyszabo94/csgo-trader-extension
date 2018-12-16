var buyingExp = /javascript:BuyMarketListing\('listing', '(\d+)', (\d+), '(\d+)', '(\d+)'\)/;
var linkExp = /\/\/steamcommunity\.com\/market\/listings\/(\d+)\/(.+)/;
BuyCardSetDialog = {
    m_bInitialized: false,
    m_oItemsToBuy: [],
    m_oBuyQueue: [],
    m_fnDocumentKeyHandler: null,
    m_total: 0,
    m_modal: null,
    m_elDialogContent: null,
    b_buyall: false,

    Initialize: function () {
        if ($('market_buycardset_dialog_cancel')) {
            $('market_buycardset_dialog_cancel').observe('click', this.OnCancel.bindAsEventListener(this));
        }
        $('market_buycardset_dialog_buyall').observe('click', this.OnBuyAll.bindAsEventListener(this));

        this.m_elDialogContent = $('market_buycardset_dialog');
        this.m_elDialogContent.style.visibility = 'hidden';
        this.m_elDialogContent.show();
        // TODO: Slider
        this.m_elDialogContent.hide();
        this.m_elDialogContent.style.visibility = '';

        this.m_bInitialized = true;
    },

    Show: function (items) {
        if (!this.m_bInitialized)
            this.Initialize();
        //if (items.length == 0) return;
        m_oItemsToBuy = items;
        this.m_fnDocumentKeyHandler = this.OnDocumentKeyPress.bindAsEventListener(this);
        $(document).observe('keydown', this.m_fnDocumentKeyHandler);

        this.OnReload({
            stop: function () {
            }
        });

        this.m_modal = new CModal($J(this.m_elDialogContent));
        this.m_modal.Show();
    },

    RemoveItem: function (link) {
        // console.log(link);
        for (var i = 0; i < m_oItemsToBuy.length; i++) {
            var it = m_oItemsToBuy[i];
            if (it.link === link) {
                m_oItemsToBuy.splice(i, 1);

                if (m_oItemsToBuy.length === 0) {
                    //window.location.reload();
                }
                return;
            }
        }
    },

    ProcessBuyQueue: function () {
        if (this.m_oBuyQueue.length) {
            const me = this;
            const data = this.m_oBuyQueue.shift();
            const $row = $J(`#lstParts .market_listing_row.market_recent_listing_row[data-name="${data.market_hash_name}"]`);

            $row.find('.sih-card-price').css({ background: `url(${window.location.protocol}//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif) no-repeat` });
            $J.ajax({
                url: 'https://steamcommunity.com/market/createbuyorder/',
                type: 'POST',
                data: data,
                crossDomain: true,
                xhrFields: {withCredentials: true}
            }).done(function (response) {
                if (response.success == 29) {
                    $row.data('done', true);
                    $row.find('.sih-card-price').replaceWith('Already ordered');
                } else if (response.success == 1) {
                    $row.data('done', true);
                    $row.find('.sih-card-price').replaceWith('Done');
                } else if (response.success == 10)
                    $row.find('.market_listing_price.market_listing_price_with_fee').html('Error');

                window.setTimeout('BuyCardSetDialog.ProcessBuyQueue();', 1500);
            }).fail(function (jqxhr) {
                // jquery doesn't parse json on fail
                var data = $J.parseJSON(jqxhr.responseText);
                $row.find('.market_listing_price.market_listing_price_with_fee').html('Error');

                window.setTimeout('BuyCardSetDialog.ProcessBuyQueue();', 1500);
            });
        } else {
            window.setTimeout('window.location.reload();', 5000);
            $J('.market_sell_dialog_input_area .spinner').hide();
        }
    },

    BuyFirstCard: function () {
        const me = this;
        var rows = $J('#lstParts .market_listing_row.market_recent_listing_row');
        const cardsToBuy = rows.filter((idx, item) => {
            const count = $J(item).find('.sih-number-of-card').val();
            return parseInt(count, 10) > 0;
        });

        cardsToBuy.each(function () {
            var $row = $J(this);
            var rdata = $row.data();
            var inp = $row.find('input.sih-number-of-card');
            var inpprice = $row.find('input.sih-card-price');
            var numberOfCard = parseInt(inp.val());
            var priceAsInt = GetPriceValueAsInt(inpprice.val() + '');
            var data = {
                sessionid: g_sessionID,
                currency: g_rgWalletInfo.wallet_currency,
                appid: rdata.appid,
                market_hash_name: rdata.marketname,
                price_total: priceAsInt * numberOfCard,
                quantity: numberOfCard
            };
            me.m_oBuyQueue.push(data);
        });

        this.ProcessBuyQueue();
    },

    Dismiss: function () {
        $(document).stopObserving('keydown', this.m_fnDocumentKeyHandler);
        if (this.m_modal)
            this.m_modal.Dismiss();
    },

    OnCancel: function (event) {
        this.Dismiss();
        event.stop();
    },

    OnAccept: function (event) {
        event.stop();
    },

    OnReload: function (event) {
        event.stop();
        $J('#lstParts').html('');
        //$J('#lstParts').html('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" class="loading" alt="Working...">');
        $J('.badge_card_to_collect').each(function (i, e) {
            var imgUrl = $J(this).find('img').attr('src');
            var cardName = $J(this).find('.badge_card_set_text:nth-child(2)').text();
            var link = $J(this).find('a[href*="/market/listings/"]').attr('href');

            var m = linkExp.exec(link);
            var appID = m[1];
            var marketHashname = decodeURIComponent(m[2]).replace(/#/g, '%23');
            var rdata = {
                appid: appID,
                marketname: marketHashname
            };
            var priceLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=' + appID + '&country=' + g_rgWalletInfo.wallet_country + '&currency=' + g_rgWalletInfo.wallet_currency + '&market_hash_name=' + marketHashname;
            var row = $J(`<div class="market_listing_row market_recent_listing_row" data-name="${marketHashname}">`);
            row.append('<div class="market_listing_item_img_container"><img src="' + imgUrl + '" class="market_listing_item_img" /></div>');
            row.append('<div class="market_listing_right_cell market_listing_their_price">' +
                '<div style="float: right"><input type="number" value="" placeholder="Loading" min="0.03" step="0.01" class="market_dialog_input sih-card-price" style="width: 60px; text-align: right; padding-right: 3px; margin-top: 5px; background: #1a1a1a; border: rgb(112, 112, 112) 1px solid; color: #909090;" /></div></div>');
            row.append('<div class="market_listing_item_name_block">'
                + '<div style="float: right"><input type="number" value="1" min="0" class="market_dialog_input sih-number-of-card" style="width: 60px; text-align: right; padding-right: 3px; margin-top: 5px; background: #1a1a1a; border: rgb(112, 112, 112) 1px solid; color: #909090;" /></div>'
                + '<span class="market_listing_item_name">' + cardName + '</span><br /><span class="market_listing_game_name">' + appID + ' ' + marketHashname.replace(/%23/g, '#') + '</span>'
                + '</div><div style="clear: both"></div>');
            row.data(rdata);

            RequestCacher.get({
                method: "GET",
                url: priceLink
            }).then((response) => {
                var lp = 0;
                if (response.success) {
                    lp = response.lowest_price;
                    var pp = GetPriceValueAsInt(lp) / 100;
                    //row.data('price', pp);
                    row.find('.sih-card-price').val(pp);
                    row.find('.sih-card-price').prop('placeholder', lp);

                    BuyCardSetDialog.CalculateTotal();
                }
            });

            $J('#lstParts').append(row);
        });
        var gameID = /\/steamcommunity.com\/(.+)\/gamecards\/(\d+)/.exec(window.location.href)[2];
        // console.log(gameID);
        $J('.badge_card_set_card.owned').each(function (i, e) {
            var div = $J(this).find('.badge_card_set_text.ellipsis').clone();
            div.find('.badge_card_set_text_qty').remove();
            var imgUrl = $J(this).find('img.gamecard').attr('src');
            var cardName = $J(div[0]).text().trim();
            var badgeSeries = $J(div[1]).text().trim();
            // console.log(cardName);
            // console.log(badgeSeries);
            var marketHashname = gameID + '-' + decodeURIComponent(cardName).replace(/#/g, '%23');
            var rdata = {
                appid: 753,
                marketname: marketHashname
            };
            var priceLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=' + 753 + '&country=' + g_rgWalletInfo.wallet_country + '&currency=' + g_rgWalletInfo.wallet_currency + '&market_hash_name=' + marketHashname;
            var row = $J(`<div class="market_listing_row market_recent_listing_row" data-name="${marketHashname}">`);
            row.append('<div class="market_listing_item_img_container"><img src="' + imgUrl + '" class="market_listing_item_img" /></div>');
            row.append('<div class="market_listing_right_cell market_listing_their_price">' +
                '<div style="float: right"><input type="number" value="" placeholder="Loading" min="0.03" step="0.01" class="market_dialog_input sih-card-price" style="width: 60px; text-align: right; padding-right: 3px; margin-top: 5px; background: #1a1a1a; border: rgb(112, 112, 112) 1px solid; color: #909090;" /></div></div>');
            row.append('<div class="market_listing_item_name_block">'
                + '<div style="float: right"><input type="number" value="0" min="0" class="market_dialog_input sih-number-of-card" style="width: 60px; text-align: right; padding-right: 3px; margin-top: 5px; background: #1a1a1a; border: rgb(112, 112, 112) 1px solid; color: #909090;" /></div>'
                + '<span class="market_listing_item_name">' + badgeSeries + '</span><br /><span class="market_listing_game_name">753 ' + marketHashname.replace(/%23/g, '#') + '</span>'
                + '</div><div style="clear: both"></div>');
            row.data(rdata);

            RequestCacher.get({
                method: "GET",
                url: priceLink
            }).then((response) => {
                var lp = 0, nfp = 0;
                if (response.success) {
                    lp = response.lowest_price;
                    var pp = GetPriceValueAsInt(lp) / 100;
                    //row.data('price', pp);
                    row.find('.sih-card-price').val(pp);
                    row.find('.sih-card-price').prop('placeholder', lp);

                    BuyCardSetDialog.CalculateTotal();
                }
            }).catch(() => {
                var altName = row.data('marketname');
                if (altName.indexOf('(Trading Card)') == -1) {
                    altName = altName + ' (Trading Card)';
                    row.data('marketname', altName);

                    RequestCacher.get({
                        method: "GET",
                        url: '//steamcommunity.com/market/priceoverview/?appid=753&country=' + g_rgWalletInfo.wallet_country + '&currency=' + g_rgWalletInfo.wallet_currency + '&market_hash_name=' + altName
                    }).then((response) => {
                        var lp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            var pp = parseFloat(getNumber(lp));
                            //row.data('price', pp);
                            row.find('.sih-card-price').val(pp);
                            row.find('.sih-card-price').prop('placeholder', lp);

                            BuyCardSetDialog.CalculateTotal();
                        }
                    }).catch(() => {
                        row.remove();
                    });
                } else {
                    row.remove();
                }
            });

            $J('#lstParts').append(row);
        });
    },

    OnBuyAll: function (event) {
        event.stop();
        this.b_buyall = true;
        this.BuyFirstCard();
        $J('#market_buycardset_dialog_buyall').hide();
        $J('.market_sell_dialog_input_area .spinner').css('display', 'inline-block');
    },

    CalculateTotal: function () {
        var rows = $J('#lstParts .market_listing_row.market_recent_listing_row');
        BuyCardSetDialog.m_total = 0;
        rows.each(function () {
            var $row = $J(this);
            var rdata = $row.data();
            var inp = $row.find('input.sih-number-of-card');
            var inpprice = $row.find('input.sih-card-price');
            var numberOfCard = parseInt(inp.val());
            var priceAsInt = GetPriceValueAsInt(inpprice.val() + '');
            // console.log(priceAsInt, numberOfCard);
            if (priceAsInt && numberOfCard) {
                BuyCardSetDialog.m_total += priceAsInt * numberOfCard / 100;
            }
        });
        $J('#market_buycardset_dialog_buyall span').text(SIHLang.tradingcards.buyall + ' (' + formatNumber(BuyCardSetDialog.m_total) + ')');
    },

    OnDocumentKeyPress: function (event) {
        if (event.keyCode == Event.KEY_ESC) {
            this.Dismiss();
            event.stop();
        }
    }
};

var AddBuyCardSet = function () {
    var dialog = '<div id="market_buycardset_dialog" class="newmodal" style="display: none; min-width: 570px">' +
        '<div class="newmodal_header_border">' +
        '<div class="newmodal_header">' +
        '<span id="market_sell_dialog_title">' +
        SIHLang.tradingcards.dialogtitle + '</span>' +
        '<div id="market_buycardset_dialog_cancel" class="newmodal_close"></div>' +
        '</div>' +
        '</div>' +

        //'<div class="newmodal_header_border">' +
        //    '<span id="market_buycardset_dialog_title" data-lang="tradingcards.dialogtitle" >' + SIHLang.tradingcards.dialogtitle + '</span>' +
        //    '<span class="market_dialog_cancel">' +
        //        '<a id="market_buycardset_dialog_cancel" href="#" class="market_dialog_title_cancel">Cancel<span class="market_dialog_title_cancel_X">X</span></a>' +
        //    '</span>' +
        //'</div>' +

        '<div class="newmodal_content_border">' +
        '<div class="newmodal_content">' +
        '<div class="market_dialog_content">' +
        '<div class="market_dialog_iteminfo">' +
        '<div id="lstParts" class="market_content_block market_home_listing_table market_home_main_listing_table market_listing_table"></div>' +
        '</div>' +
        '</div>' +
        '<div class="market_dialog_content_separator"></div>' +
        '<div class="market_dialog_content market_dialog_content_dark">' +
        '<div class="market_sell_dialog_input_area">' +
        //'<a id="market_buycardset_dialog_accept" href="#" class="btn_green_white_innerfade btn_small_wide"><span>Buy missing parts</span></a>' +
        '<a id="market_buycardset_dialog_buyall" href="#" class="btn_green_white_innerfade btn_small_wide" style="margin-right:10px"><span>' + SIHLang.tradingcards.buyall + '</span></a>' +
        '<div class="spinner" style="display: none; width: 16px; height: 16px; background: url(//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif) no-repeat; background-size: 16px;"></div>' +
        //'<a id="market_buycardset_dialog_reload" href="#" class="btn_green_white_innerfade btn_small_wide"><span data-lang="tradingcards.reload">' + SIHLang.tradingcards.buyall + '</span></a>' +
        '<div>&nbsp;<br /><br /></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    dialog += '<div id="hover" style="display: none; z-index: 1000">' +
        '<div class="shadow_ul"></div><div class="shadow_top"></div><div class="shadow_ur"></div><div class="shadow_left"></div><div class="shadow_right"></div><div class="shadow_bl"></div><div class="shadow_bottom"></div><div class="shadow_br"></div> <div class="inventory_iteminfo hover_box shadow_content" id="iteminfo_clienthover">' +
        '<div class="item_desc_content" id="hover_content">' +
        '<div class="item_desc_icon">' +
        '<div class="item_desc_icon_center">' +
        '<img id="hover_item_icon" src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/trans.gif" alt="" />' +
        '</div>' +
        '</div>' +
        '<div class="item_desc_description">' +
        '<h1 class="hover_item_name" id="hover_item_name"></h1>' +
        '<div class="fraud_warning" id="hover_fraud_warnings"></div>' +
        '<div class="item_desc_game_info" id="hover_game_info">' +
        '<div class="item_desc_game_icon">' +
        '<img id="hover_game_icon" src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/trans.gif" alt="" />' +
        '</div>' +
        '<div id="hover_game_name" class="ellipsis"></div>' +
        '<div id="hover_item_type" class=""></div>' +
        '</div>' +
        '<div class="item_desc_descriptors" id="hover_item_descriptors">' +
        '</div>' +
        '<div class="item_desc_descriptors" id="hover_item_owner_descriptors">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="hover_arrow_left" id="hover_arrow_left">' +
        '<div class="hover_arrow_inner"></div>' +
        '</div>' +
        '<div class="hover_arrow_right" id="hover_arrow_right">' +
        '<div class="hover_arrow_inner"></div>' +
        '</div>' +
        '</div>';
    $J('body').append(dialog);
    $J('#lstParts').on('change', 'input[type=number]', function () {
        BuyCardSetDialog.CalculateTotal();
    });
};

var g_rgWalletInfo = null;
var g_strLanguage = 'english';
var g_rgAppContextData = {};
var missingCards = [];

setTimeout(function () {
    var cardsleft = $J('.badge_card_to_collect_links');
    //if (cardsleft.length < 1) {
    //    return;
    //}

    const btn_buymissings= `
      <a class="btn_grey_grey btn_medium btn_buymissings" href="javascript:void(0);">
        <span data-lang="tradingcards.showpopup">${SIHLang.tradingcards.showpopup}</span>
      </a>`;
    $J('.badge_detail_tasks .gamecards_inventorylink:first').append(btn_buymissings);
    $J('.badge_cards_to_collect .gamecards_inventorylink').append(btn_buymissings);
    var inventLink = $J('.popup_menu_item.header_notification_items').attr('href');
    $J.ajax({
        url: inventLink,
        success: function (res) {
            var expWallet = /g_rgWalletInfo = .+?;/;
            var m = expWallet.exec(res);
            if (m) {
                eval(m[0]);
            }

            m = /g_strLanguage = .+?;/.exec(res);
            if (m) {
                eval(m[0]);
            }

            $J('.btn_buymissings').on('click', function () {
                BuyCardSetDialog.Show(missingCards);
            });
        }
    });
    missingCards = [];
    cardsleft.each(function (e, i) {
        var link = $J(this).find('a[href*="/market/listings/"]');
        if (link.length < 1) return;
        missingCards.push({link: link.attr('href')});
    });

    AddBuyCardSet();
    ReloadLang();
}, 100);
