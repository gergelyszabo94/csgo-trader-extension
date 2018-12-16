/*global $J, g_ActiveInventory, g_ActiveUser, g_sessionID, UserYou, SellItemDialog*/
var lowestPriceWithFeeRegExp = /<span class="market_listing_price market_listing_price_with_fee">\s*(((?!Sold).)*?)\s*<\/span>/i;
var lowestPriceWithoutFeeRegExp = /<span class="market_listing_price market_listing_price_without_fee">\s*(((?!Sold).)*?)\s*<\/span>/i;
var insGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Inscribed Gem<\/span>/gi;
var kinGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Kinetic Gem<\/span>/gi;
var priGemExp = /<span style="font-size: 18px; color: rgb\(\d+, \d+, \d+\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Prismatic Gem<\/span>/gi;
var ethGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Ethereal Gem<\/span>/gi;
var corGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Foulfell Shard<\/span>/gi;
var masGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Rune of the Duelist Indomitable<\/span>/gi;
var buyingExp = /javascript:BuyMarketListing\('listing', '(\d+)', (\d+), '(\d+)', '(\d+)'\)/;
var itemRegExp = /BuildHover.*;/i;
var taradableStrExp = /Tradable after.+?/i;
var cacheItems = {};
var cachePrices = {};
var itemsInTrades = [];
var sellingStack = {};
var selectmode = false;
var currencyId = 1;
var sellcurrencyId = 1;
var lastSelectedItem = null;
var reqPriceHistory = true;
var apiItems = {};
var inventoryPrice = 0;
var userInventory = [];

const COOKIE_ENABLED_SIH = 'enableSIH';
let IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';
// $J('.inventory_filters .filter_tag_button_ctn').after(`
$J('#inventory_logos').append(`
    <div>&nbsp;</div>
    <div id="switchPanel">
        <span style="margin-right: 5px;">SIH - Steam Inventory Helper</span>
        <label class="switch">
            <input id="switcher" type="checkbox" ${IS_ENABLED_SIH ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>
    </div>
`);
$J('#switchPanel #switcher').change((e) => {
    const { currentTarget } = e;
    SetCookie(COOKIE_ENABLED_SIH, currentTarget.checked, 365, 'inventory');
    window.location.reload();
});

if (typeof (BShouldSuppressFades) == 'undefined') {
    BShouldSuppressFades = function () {
        return false;
    };
}

const addQuickSellButton = (item, elActions) => {
    const description = item.description;
    var inputValue = getPriceAsInt(description.lowestPrice);
    var nAmount = inputValue;
    var sellingPrice = null;
    if (inputValue > 0 && nAmount == parseInt(nAmount)) {
        // Calculate what the seller gets
        var publisherFee = typeof item.market_fee != 'undefined' ? item.market_fee : g_rgWalletInfo.wallet_publisher_fee_percent_default;
        var feeInfo = CalculateFeeAmount(nAmount, publisherFee);
        nAmount = nAmount - feeInfo.fees + (100 * (window.fastdelta));
        if (nAmount <= 0) nAmount = 1;

        var info = CalculateAmountToSendForDesiredReceivedAmount(nAmount, publisherFee);
        inputValue = info.amount;
        sellingPrice = v_currencyformat(inputValue, GetCurrencyCode(g_rgWalletInfo.wallet_currency));
    }

    $J(elActions).find('#quicksellbtn').remove();
    fastSellBt = CreateMarketActionButton('green', 'javascript:void(0);', SIHLang.quicksell.replace('$1', sellingPrice));
    fastSellBt.id = 'quicksellbtn';
    $J(fastSellBt).css({ 'marginRight': '12px', 'marginBottom': '8px' });
    const elPriceInfoContent = $J('.item_market_actions:visible').find('div div:last');
    $J(fastSellBt).click(function () {
        elPriceInfoContent.html('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
        SellItemDialog.m_item = item;
        $J.ajax({
            url: 'https://steamcommunity.com/market/sellitem/',
            type: 'POST',
            data: {
                sessionid: g_sessionID,
                appid: item.appid,
                contextid: item.contextid,
                assetid: item.assetid,
                amount: 1,
                price: nAmount
            },
            crossDomain: true,
            xhrFields: { withCredentials: true }
        }).done(function (data) {
            SellItemDialog.OnSuccess({ responseJSON: data });
            // if ($J('#Ck_NoReload').is(':checked')) PopulateMarketActions(elActions, item);
        }).fail(function (jqxhr) {
            // jquery doesn't parse json on fail
            elPriceInfoContent.html('Error...');
            var data = $J.parseJSON(jqxhr.responseText);
            SellItemDialog.OnFailure({ responseJSON: data });
        });
        return false;
    });

    elActions.appendChild(fastSellBt);
};

const addInstantSellButton = (item, elActions) => {
    const strMarketName = GetMarketHashName(item.description);
    const marketListingsURL = window.location.protocol + '//steamcommunity.com/market/listings/' + item.appid + '/' + encodeURIComponent(strMarketName);

    RequestCacher.get({
        type: 'GET',
        url: marketListingsURL
    }).then((response) => {
        var nameid = response.match(/Market_LoadOrderSpread\( (\d+)/)[1];

        RequestCacher.get({
            url: `${window.location.protocol}//steamcommunity.com/market/itemordershistogram`,
            type: 'GET',
            data: {
                country: g_strCountryCode,
                language: 'english',
                currency: (g_rgWalletInfo && g_rgWalletInfo.wallet_currency ? g_rgWalletInfo.wallet_currency : 1),
                item_nameid: nameid,
                two_factor: 0
            }
        }).then((data) => {
            if (data.success && data.highest_buy_order) {
                var nAmount = parseInt(data.highest_buy_order, 10);
                // Calculate what the seller gets
                var publisherFee = typeof item.market_fee != 'undefined' ? item.market_fee : g_rgWalletInfo.wallet_publisher_fee_percent_default;
                var feeInfo = CalculateFeeAmount(nAmount, publisherFee);
                nAmount = nAmount - feeInfo.fees;
                if (nAmount <= 0) nAmount = 1;

                var info = CalculateAmountToSendForDesiredReceivedAmount(nAmount, publisherFee);
                var inputValue = info.amount;
                var sellingPrice = v_currencyformat(inputValue, GetCurrencyCode(g_rgWalletInfo.wallet_currency));

                $J(elActions).find('#instantsellbtn').remove();
                var instantSellBt = CreateMarketActionButton('green', 'javascript:void(0);', SIHLang.instantsell.replace('$1', sellingPrice));
                instantSellBt.id = 'instantsellbtn';
                $J(instantSellBt).css({ 'marginRight': '12px', 'marginBottom': '8px' });

                const elPriceInfoContent = $J('.item_market_actions:visible').find('div div:last');
                $J(instantSellBt).click(function () {
                    elPriceInfoContent.html('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
                    SellItemDialog.m_item = item;
                    $J.ajax({
                        url: 'https://steamcommunity.com/market/sellitem/',
                        type: 'POST',
                        data: {
                            sessionid: g_sessionID,
                            appid: item.appid,
                            contextid: item.contextid,
                            assetid: item.assetid,
                            amount: 1,
                            price: nAmount
                        },
                        crossDomain: true,
                        xhrFields: { withCredentials: true }
                    }).done(function (data) {
                        SellItemDialog.OnSuccess({ responseJSON: data });
                        // if ($J('#Ck_NoReload').is(':checked')) PopulateMarketActions(elActions, item);
                    }).fail(function (jqxhr) {
                        // jquery doesn't parse json on fail
                        elPriceInfoContent.html('Error...');
                        var data = $J.parseJSON(jqxhr.responseText);
                        SellItemDialog.OnFailure({ responseJSON: data });
                    });
                });

                elActions.appendChild(instantSellBt);
            } else {
                console.log('nothing');
            }
        });
    });
}

var checkPrice = function () {
    var currentIdx = $J('#iteminfo0').is(':visible') ? 0 : 1;
    var name = $J('#iteminfo' + currentIdx + '_item_name').text();
    getLowestPriceHandler();
};

var reloadDes = function () {
    var sOldInfo = 'iteminfo' + iActiveSelectView;
    var elDescriptors = $(sOldInfo + '_item_descriptors');
    PopulateDescriptions(elDescriptors, g_ActiveInventory.selectedItem.description.descriptions);
};

var mediumPrice = 0;
var mediumName = '';

var getSetLink = function (d, sItem, isGenuine) {
    var itname = d.market_hash_name || d.value;
    var setLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode + '&currency=' + currencyId + '&market_hash_name=' + (isGenuine ? 'Genuine%20' : '') + encodeURIComponent(itname);
    d.setLink = setLink;
    d.isinset = true;
    if (cachePrices[setLink] && cachePrices[setLink].lowestPrice) {
        d.app_data.price = cachePrices[setLink].lowestPrice;
        d.app_data.market_hash_name = cachePrices[setLink].market_hash_name;
        d.app_data.owned = cachePrices[setLink].owned;

        if (sItem === g_ActiveInventory.selectedItem.description)
            reloadDes();
        return;
    } else {
        cachePrices[setLink] = { market_hash_name: (isGenuine ? 'Genuine ' : '') + itname };
        var exp = new RegExp('.*' + cachePrices[setLink].market_hash_name.replace('The ', '(The )?') + '$');
        $J.each(g_ActiveInventory.rgInventory, function () {
            if (exp.test(this.market_hash_name)) {
                cachePrices[setLink].market_hash_name = this.market_hash_name;
                cachePrices[setLink].owned = true;
                return false;
            }
        });
        d.app_data.market_hash_name = cachePrices[setLink].market_hash_name;
        if (!d.value.startsWith('<a href=')) {
            d.app_data.owned = cachePrices[setLink].owned;
            d.value = '<a href="http://steamcommunity.com/market/listings/' + sItem.appid + "/" + cachePrices[setLink].market_hash_name + '" target="_blank" >' + d.value + '</a>';
        }
        reloadDes();
    }

    return;
};

var getMediumPrice = function (sItem) {
    if (!sItem.market_hash_name) {
        sItem.market_hash_name = sItem.name;
    }
    var itemLink = window.location.protocol + "//steamcommunity.com/market/priceoverview/?appid=" + sItem.appid + "&country=" + g_strCountryCode + "&currency=" + currencyId + "&market_hash_name=" + encodeURIComponent(sItem.market_hash_name);
    mediumName = sItem.market_hash_name;
    PriceQueue.GetPrice({
        method: "GET",
        url: itemLink,
        success: function (response) {
            if (response.success) {
                //cachePrices[itemLink] = new Object();
                mediumPrice = response.lowest_price;
            }
        }
    });

};

var getGiftPrice = function (gitem) {
    var appIdExp = /http:\/\/store.steampowered.com\/app\/(\d+)\//;
    var storeLink = gitem.description.actions[0].link;
    var appid = appIdExp.exec(storeLink)[1];
    $J('.dd_price').html("Loading...");
    RequestCacher.get({
        url: window.location.protocol + '//store.steampowered.com/api/appdetails?appids=' + appid,
        crossDomain: true,
    }).then(function (res) {
        if (res && res[appid] && res[appid].success) {
            var price_overview = res[appid].data.price_overview;
            var strPrice = '';
            if (price_overview.discount_percent > 0) {
                strPrice = (price_overview.final / 100) + ' (-' + price_overview.discount_percent + ') ' + price_overview.currency;
            } else {
                strPrice = (price_overview.final / 100) + ' ' + price_overview.currency;
            }
            $J('.dd_price').html(strPrice);
        }
    }).catch(function () {
        $J('.dd_price').html("Error");
    });
};

var getLowestPriceHandler = function (gitem, callback) {
    var sItem = gitem || g_ActiveInventory.selectedItem;
    if (sItem.appid == 753 && !sItem.description.marketable) {
        //getGiftPrice(sItem);
        return;
    }
    if (!sItem.description.market_hash_name) {
        sItem.description.market_hash_name = sItem.description.name;
    }
    var theItemString = encodeURIComponent(name);
    // from Steam's community market website
    var appID = g_ActiveInventory.appid;
    var isGenuine = false;
    const cc = g_strCountryCode || getStoreRegionCountryCode() || g_rgWalletInfo.wallet_country;
    var itemLink = window.location.protocol + "//steamcommunity.com/market/priceoverview/?appid=" + sItem.appid + "&country=" + cc + "&currency=" + currencyId + "&market_hash_name=" + encodeURIComponent(sItem.description.market_hash_name);
    var itemLinkW = window.location.protocol + "//steamcommunity.com/market/priceoverview/?appid=" + sItem.appid + "&country=" + cc + "&currency=" + sellcurrencyId + "&market_hash_name=" + encodeURIComponent(sItem.description.market_hash_name);

    var marketLink = window.location.protocol + "//steamcommunity.com/market/listings/" + sItem.appid + "/" + encodeURIComponent(sItem.description.market_hash_name);
    if (cachePrices[itemLink] && cachePrices[itemLink].nofeePrice) {
        sItem.description.nofeePrice = cachePrices[itemLink].nofeePrice;
        sItem.description.lowestPrice = cachePrices[itemLink].lowestPrice;
        sItem.description.providerName = cachePrices[itemLink].providerName;
    } else {
        cachePrices[itemLink] = { market_hash_name: sItem.description.market_hash_name, owned: true };
    }

    if (cachePrices[itemLinkW] && cachePrices[itemLinkW].nofeePrice) {
        sItem.description.nofeePriceW = cachePrices[itemLinkW].nofeePrice;
        sItem.description.lowestPriceW = cachePrices[itemLinkW].lowestPrice;
        sItem.description.providerName = cachePrices[itemLinkW].providerName;
    } else {
        cachePrices[itemLinkW] = { market_hash_name: sItem.description.market_hash_name, owned: true };
    }

    $J.each(sItem.description.tags, function () {
        isGenuine = (isGenuine || (this.category == 'Quality' && this.internal_name == 'genuine'));
        if (isGenuine) return false;
    });

    if (sItem.description.descriptions === undefined) sItem.description.descriptions = [{ type: 'html', value: '' }];

    const hasFloatDescription = sItem.description.descriptions.find(x => x.isFloat);
    const isWeapon = sItem.description.tags.find(x => x.category.toUpperCase() === 'WEAPON');
    if (!hasFloatDescription && isWeapon && sItem.description.actions && sItem.description.actions.length) {
        const btnGetFloat = `
            <div class="float_block">
                <a class="item_market_action_button item_market_action_button_green floatbutton" href="javascript:void(0);">
                    <span class="item_market_action_button_edge item_market_action_button_left"></span>
                    <span class="item_market_action_button_contents">${SIHLang.market.getfloat}</span>
                    <span class="item_market_action_button_edge item_market_action_button_right"></span>
                    <span class="item_market_action_button_preload"></span>
                </a>
                <div class="spinner"></div>
            </div>
        `;
        sItem.description.descriptions.unshift({
            isFloat: true,
            type: 'html',
            value: btnGetFloat
        });
    }

    if (window.agp_gem && sItem.description.type !== "Rare Inscribed Gem" && sItem.appid == 570) {
        for (var i = 0; i < sItem.description.descriptions.length; i++) {
            var d = sItem.description.descriptions[i];
            if (d.app_data && !d.app_data.is_itemset_name && !d.app_data.price && !d.app_data.limited) {
                getSetLink(d, sItem.description, isGenuine);
            }
            if (d.insgems) {
                break;
            }

            var ematch, gidx = 0;
            d.insgems = [];

            while ((ematch = insGemExp.exec(d.value))) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Inscribed ' + ematch[1];
                d.insgems.push({ name: 'Inscribed ' + ematch[1] });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem) {
                                reloadDes();
                            }
                        }
                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            while (ematch = kinGemExp.exec(d.value)) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Kinetic: ' + ematch[1];

                d.insgems.push({ name: 'Kinetic: ' + ematch[1] });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem)
                                reloadDes();
                        }


                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            while (ematch = masGemExp.exec(d.value)) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Rune%20of%20the%20Duelist%20Indomitable';
                d.insgems.push({ name: 'Rune%20of%20the%20Duelist%20Indomitable' });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem)
                                reloadDes();
                        }
                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            while (ematch = corGemExp.exec(d.value)) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Foulfell Shard';

                d.insgems.push({ name: 'Foulfell Shard' });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem)
                                reloadDes();
                        }
                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            while (ematch = ethGemExp.exec(d.value)) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Ethereal: ' + ematch[1];

                d.insgems.push({ name: 'Ethereal: ' + ematch[1] });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem)
                                reloadDes();
                        }
                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            while (ematch = priGemExp.exec(d.value)) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + cc + '&currency=' + currencyId + '&market_hash_name=Prismatic: ' + ematch[1];

                d.insgems.push({ name: 'Prismatic: ' + ematch[1] });

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: { gemidx: gidx },
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === g_ActiveInventory.selectedItem)
                                reloadDes();
                        }


                    },
                    error: function () {

                    }
                });
                gidx++;
            }

            if (gidx > 0) {
            } else {
                delete d.insgems;
            }
        }
    }

    ///Temporary ignore
    if (window.agp_sticker && sItem.appid == 730 && g_strLanguage === 'english') {
        for (var i = 0; i < sItem.description.descriptions.length; i++) {
            var d = sItem.description.descriptions[i];
            if (d.type == 'html' && d.value.startsWith('<br><div id="sticker_info" name="sticker_info"') && !d.stickers) {
                d.orgvalue = d.value;
                d.isstickers = true;
                var stIdx = d.value.indexOf('<br>Sticker:');
                if (stIdx == -1 || d.stickers) break;
                var stickers = d.value.substr(stIdx + 12, d.value.length - (stIdx + 27)).split(',');
                d.stickers = [];
                for (var i2 = 0; i2 < stickers.length; i2++) {
                    d.stickers.push({ name: stickers[i2].trim() });
                    var sticker_hash_name = encodeURIComponent(`Sticker | ${stickers[i2].trim()}`);
                    var stickerLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=730&country=' + cc + '&currency=' + currencyId + '&market_hash_name=' + sticker_hash_name;
                    if (cachePrices[stickerLink]) {
                        d.stickers[i2].prices = cachePrices[stickerLink];
                        if (sItem === g_ActiveInventory.selectedItem) {
                            reloadDes();
                        }
                    } else {
                        PriceQueue.GetPrice({
                            method: "GET",
                            url: stickerLink,
                            pars: { stickeridx: i2 },
                            success: function (response, $this) {
                                var lp = 0, nfp = 0;
                                if (response.success) {
                                    lp = response.lowest_price;
                                    nfp = response.median_price;

                                    d.stickers[$this.stickeridx].prices = { lowestPrice: lp, nofeePrice: nfp };// cachePrices[this.url];

                                    if (sItem === g_ActiveInventory.selectedItem)
                                        reloadDes();
                                }
                            },
                            error: function () {

                            }
                        });
                    }
                }
            }
        }
    }

    if (!sItem.description.marketable) {
        if (callback && itemLinkW == itemLink)
            callback(sItem);
        return;
    }

    const numberOwnedDesc = sItem.description.descriptions.filter(function (x) { return x.iscount; });
    if (!numberOwnedDesc.length) {
        const similarCount = g_bViewingOwnProfile ? `(<a href="javascript:selectSimilar(${sItem.classid})">${SIHLang.selectall}</a>)` : '';
        sItem.description.descriptions.unshift({
            iscount: true,
            type: 'html',
            value: `${SIHLang.numowned}: <i style="color: rgb(153, 204, 255); font-size: 16px">${sItem.description.use_count}</i> ${similarCount}`
        });
    }

    if (sItem.description.lowestPrice) {
        PriceQueue.GenPriceDescription(sItem.description);

        if (callback && itemLinkW == itemLink) {
            callback(sItem);
            return;
        }
    } else {
        PriceQueue.GetPrice({
            method: "GET",
            url: itemLink,
            success: function (response) {
                if (response.success) {
                    if (/SOLD!/i.test(response.lowest_price)) console.log(itemLink, response);
                    cachePrices[itemLink].lowestPrice = sItem.description.lowestPrice = response.lowest_price;
                    cachePrices[itemLink].nofeePrice = sItem.description.nofeePrice = response.median_price;
                    if (response.volume) {
                        cachePrices[itemLink].volume = sItem.description.volume = response.volume;
                    }

                    if (response.providerName) {
                        cachePrices[itemLink].providerName = sItem.description.providerName = response.providerName;
                    }

                    PriceQueue.GenPriceDescription(sItem.description);
                    if (itemLinkW == itemLink) {
                        sItem.description.lowestPriceW = response.lowest_price;
                        sItem.description.nofeePriceW = response.median_price;
                        sItem.description.providerName = response.providerName;
                    }

                    if (sItem === g_ActiveInventory.selectedItem) {
                        reloadDes();

                        $J('.dd_price').find('a').attr('href', marketLink);
                    }

                    if (callback && itemLinkW == itemLink)
                        callback(sItem);
                }
            }
        });
    }

    if (sItem.description.lowestPriceW) {
        if (callback) {
            callback(sItem);
        }
    } else if (itemLinkW != itemLink) {
        PriceQueue.GetPrice({
            method: "GET",
            url: itemLinkW,
            success: function (response) {
                if (response.success) {
                    if (/SOLD!/i.test(response.lowest_price)) console.log(itemLinkW, response);
                    cachePrices[itemLinkW].lowestPrice = sItem.description.lowestPriceW = response.lowest_price;
                    cachePrices[itemLinkW].nofeePrice = sItem.description.nofeePriceW = response.median_price;
                    if (response.volume) {
                        cachePrices[itemLink].volume = sItem.description.volume = response.volume;
                    }

                    if (callback)
                        callback(sItem);
                }
            }
        });
    }
};

var selectSimilar = function (classid) {
    if (!selectmode)
        $J('#Lnk_Sellmulti').trigger('click');
    g_ActiveInventory.LoadCompleteInventory().done(function () {
        $J('.inventory_ctn:visible .inventory_page .item').each(function (i, el) {
            if (el.rgItem.description.marketable && el.rgItem.classid == classid) {
                g_ActiveInventory.LoadItemImage($J(el));
                $J(el).addClass('selectedSell');
            }
        });

        var itC = $J('.selectedSell').length;
        if (itC > 0) {
            $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
            $J('#Lnk_ShowSellMulti').show();
            if (g_ActiveInventory.appid == 753) {
                $J('#Lnk_TurnIntoGems').show();
                $J('#Lnk_SendGifts').show();
            }
        }
    });
    return false;
};

var setGemPrice = function (sItem, gemName, gemType, callback) {
    var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode + '&currency=1&market_hash_name=' + gemName;
    PriceQueue.GetPrice({
        method: "GET",
        url: gemLink,
        success: function (response, textStatus, jqXHR) {
            var lp = 0, nfp = 0;
            if (response.success) {
                lp = response.lowest_price;
                var pp = /([\d\.,]+)/.exec(lp.replace(/\&#\d+;/g, '').replace(' p&#1091;&#1073;.', '').replace(/,/g, '.'))[1];
                sItem.extimatePrice[gemName] = pp;
                callback(sItem);
            }
        },
        error: function () {
        }
    });
};

var imgRex = /<img.*?src="([^"]+?)"[^>]*>/g,
    imgRex2 = /background-image: url\(([^\)]+?)\)/g;

var recalTotal = function () {
    var totalWithoutFee = 0;
    var totalWithFee = 0;
    $J('.queue-item-container:visible').each(function (idx, elem) {
        totalWithoutFee += elem.rgItem.description.sellerPrice;
        totalWithFee += elem.rgItem.description.buyerPrice;
    });
    $J('.queue-total-price .without-fee').html(
        v_currencyformat(totalWithoutFee, GetCurrencyCode(g_rgWalletInfo.wallet_currency))
    );
    $J('.queue-total-price .with-fee').html(
        v_currencyformat(totalWithFee, GetCurrencyCode(g_rgWalletInfo.wallet_currency))
    );
};

var ShowQueue = function (goo) {
    $J('div.queue-container').remove();
    var selectedItems = $J('.selectedSell');
    var div = $J('<div class="queue-container">');
    var rightDiv = $J('<div class="queue-right-panel">');
    div.append(rightDiv);

    var cdiv = $J('<div class="scrollbar-inner">');
    cdiv.append('<a href="#" id="bt_quick_sell">Quick sell all</a>');
    div.append(cdiv);

    selectedItems.sort(function (a, b) {
        var rgItemA = a.rgItem, rgItemB = b.rgItem;

        if (rgItemA.description.market_hash_name == rgItemB.description.market_hash_name) {
            return 0;
        } else if (rgItemA.description.market_hash_name < rgItemB.description.market_hash_name) {
            return -1;
        } else {
            return 1;
        }
    });

    if (window.extmasslisting) {
        ExternalPrices.UpdatePrice(typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo.wallet_currency : 1);
    }

    selectedItems.each(function () {
        var rgItem = null;
        if (!(rgItem = this.rgItem) || ((!rgItem.description.marketable) && !goo) || (goo == '1' && (rgItem.appid != 753 || rgItem.contextid != 6))) {
            $J(this).removeClass('selectedSell');
            return true;
        }
        var container = $J('<div class="queue-item-container" data-id="' + rgItem.assetid + '">');
        container.append('<a href="#" class="queue-item-remove" title="Remove from queue">&#x2212;</a>');
        var img = '';
        if (rgItem.fraudwarnings) {
            img += '<img src="http://steamcommunity-a.akamaihd.net/public/images/sharedfiles/icons/icon_warning.png" height="16" />';
        }
        if (rgItem.description.descriptions && rgItem.description.descriptions.length) {
            var mm = null;
            for (var i = 0; i < rgItem.description.descriptions.length; i++) {
                while ((mm = imgRex.exec(rgItem.description.descriptions[i].value)) != null || (mm = imgRex2.exec(rgItem.description.descriptions[i].value)) != null) {
                    img += '<img src="' + mm[1] + '" height="16"/>';
                }
            }
        }
        if (img.length > 0) {
            container.append('<div class="item-bagde">' + img + '</div>');
        }
        var item = $J('<div class="queue-item">');
        item.css('border-color', '#' + rgItem.description.name_color);
        if ($J(this).find('.item_equipped').length) {
            item.append('<div class="item_flag item_equipped">');
        }

        if ($J(this).find('.item_intrade').length) {
            item.append('<div class="item_flag item_intrade">');
        }
        if (window.extmasslisting && rgItem.extprice) {
            var extpricetag = $J('<div class="p-price"></div>');
            extpricetag.prop('title', rgItem.extprice_provider);
            // extpricetag.text(ExchangeRates.Format(rgItem.extprice));
            extpricetag.text(v_currencyformat(rgItem.extprice * 100, GetCurrencyCode(typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo.wallet_currency : 1)));
            item.append(extpricetag);
        }

        item.append($J(this).find('img').clone());
        container[0].rgItem = rgItem;
        container.append(item);
        AddItemHoverToElement(item[0], rgItem);
        cdiv.append(container);
    });

    const itemCount = $J('.selectedSell').length;
    if (itemCount === 0) {
        if (goo == '1') {
            GrindDialog.Dismiss();
        } else {
            SellItemDialog.Dismiss();
        }
        $J('div.queue-container').remove();
        $J('#Lnk_ShowSellMulti').hide();
        $J('#Lnk_TurnIntoGems').hide();
        $J('#Lnk_SendGifts').hide();
        $J('#Lnk_Unpack').hide();

        return false;
    } else {
        $J('#Lnk_ShowSellMulti').html((itemCount > 1 ? SIHLang.sellnitem.replace('$1', itemCount) : SIHLang.sell1item));
    }

    rightDiv.append(`<div class="queue-panel">
        <div class="queue-item-count">
            <span>${SIHLang.queue.items}</span>
            <span>${$J('.selectedSell').length}</span>
        </div>
    </div>
    <div class="queue-panel">
        <div class="queue-total-price">
            <span class="">${SIHLang.queue.withfee}</span>
            <span class="with-fee" title="Total buyer will pay"></span>
            <span class="">${SIHLang.queue.withoutfee}</span>
            <span class="without-fee" title="Total will recieve"></span>
        </div>
    </div>`);
    rightDiv.append(`<div class="queue-panel">
        <div class="queue-remove-panel">
            <div class="block-title">${SIHLang.queue.removeitem}</div>
            <input type="text" class="num" id="txt_remove_queue" />
            <button class="btnControl btnGreen" id= "bt_lower">${SIHLang.queue.removelower}</button>
            <button class="btnControl btnGreen" id= "bt_higher">${SIHLang.queue.removehigher}</button>
            <button class="btnControl btnGreen" id= "bt_intrade">${SIHLang.queue.removeintrade}</button>
            <button class="btnControl btnGreen" id= "bt_removeequipped">${SIHLang.queue.removeequipped}</button>
        </div>
    </div>`);
    rightDiv.append(`<div class="queue-panel">
        <div class="queue-sort-panel">
            <div class="block-title">${SIHLang.sort.sortitem}</div>
            <button class="btnControl btnGreen" id="bt_sort_price">${SIHLang.sort.price} <span class="market_sort_arrow"></span></button>
        </div>
    </div>`);

    div.find('#bt_lower, #bt_higher').click(function (e) {
        var operator = ($J(this).attr('id') === 'bt_lower' ? -1 : 1);
        var pricetocompare = getPriceAsInt($J('#txt_remove_queue').val());
        if (isNaN(pricetocompare)) return false;
        $J('.queue-item-container:visible').each(function (idx, elem) {
            var item = elem.rgItem;
            if (item && (item.description.lowestPriceW || item.extprice)) {
                var price = item.description.lowestPriceW ? getPriceAsInt(item.description.lowestPriceW) : (item.extprice || 0);
                if ((price * operator) > (pricetocompare * operator)) {
                    $J(elem).find('.queue-item-remove').trigger('click');
                }
            }
        });
        return false;
    });

    div.find('#bt_intrade').click(function (e) {
        $J('.queue-item-container:visible').each(function (idx, elem) {
            if ($J(elem).find('.item_intrade').length) {
                $J(elem).find('.queue-item-remove').trigger('click');
            }
        });
        setTimeout(function () {
            recalTotal();
        }, 100);
        return false;
    });

    div.find('#bt_removeequipped').click(function (e) {
        $J('.queue-item-container:visible').each(function (idx, elem) {
            if ($J(elem).find('.item_equipped').length) {
                $J(elem).find('.queue-item-remove').trigger('click');
            }
        });
        setTimeout(function () {
            recalTotal();
        }, 100);
        return false;
    });

    div.find('#bt_sort_price').click(function (e) {
        if (isSorting) {
            return false;
        }
        isSorting = true;
        var order = 1;
        $this = $J(this);
        if ($this.find('.market_sort_arrow').is(':contains("▲")')) {
            order = -1;
            $this.find('.market_sort_arrow').text('▼');
        } else {
            $this.find('.market_sort_arrow').text('▲');
        }

        var $rows = div.find('div:has(>.queue-item-container:visible)'),
            $rowsli = $rows.children('.queue-item-container:visible');

        $rowsli.sort(function (a, b) {
            var rgIa = a.rgItem, rgIb = b.rgItem;

            if (!rgIa)
                return order;
            if (!rgIb)
                return order * -1;

            var an = (typeof (rgIa.description.lowestPriceW) == 'undefined' ? (rgIa.extprice || 0) : getPriceAsInt(rgIa.description.lowestPriceW)),
                bn = (typeof (rgIb.description.lowestPriceW) == 'undefined' ? (rgIb.extprice || 0) : getPriceAsInt(rgIb.description.lowestPriceW));

            if (an == bn) {
                an = rgIa.market_hash_name;
                bn = rgIb.market_hash_name;
            }

            if (an > bn) {
                return 1 * order;
            }
            if (an < bn) {
                return -1 * order;
            }
            return 0;
        });

        $rowsli.detach().appendTo($rows);

        var rgItem = $J('.queue-item-container:visible')[0].rgItem;
        g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
        g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
        UpdateSellItem(rgItem);

        isSorting = false;
        return false;
    });

    $J('body').append(div);
    $J(cdiv).scrollbar();

    qTotalPrice = 0;
    qTotalBuyerPrice = 0;
    if (goo) {
        GetQueueGoo();
    } else {
        GetQueuePrice();
        PriceQueue.UpdateHandler = ContinueListing;
        var rgItem1 = $J('.queue-item-container')[0].rgItem;
        g_ActiveInventory.SelectItem(null, rgItem1.element, rgItem1);
        g_ActiveInventory.EnsurePageActiveForItem(rgItem1.element);
        updateInfoWindow(rgItem1);
    }
};

var qTimer = null;
var qTotalPrice = 0;
var qTotalBuyerPrice = 0;
var isSorting = false;

var GetQueuePrice = function () {
    isSorting = false;
    if (qTimer) window.clearTimeout(qTimer);
    var it = $J('.queue-item-container:not(:has(>span.price))');
    it.sort(function (a, b) {
        var rgItemA = a.rgItem, rgItemB = b.rgItem;

        if (rgItemA.description.market_hash_name == rgItemB.description.market_hash_name) {
            return 0;
        } else if (rgItemA.description.market_hash_name < rgItemB.description.market_hash_name) {
            return -1;
        } else {
            return 1;
        }
    });
    for (var i = 0; i < it.length; i++) {

        var rgItem = it[i].rgItem;
        if (window.extmasslisting && rgItem.extprice) {
            var num = rgItem.extprice;
            var inputValue = getPriceAsInt(num + '');
            var nAmount = inputValue;
            var priceWithoutFee = null;
            if (inputValue > 0 && nAmount == parseInt(nAmount)) {
                // Calculate what the seller gets
                var publisherFee = typeof SellItemDialog.m_item.market_fee != 'undefined' ? SellItemDialog.m_item.market_fee : g_rgWalletInfo.wallet_publisher_fee_percent_default;
                var feeInfo = CalculateFeeAmount(nAmount, publisherFee);
                nAmount = nAmount - feeInfo.fees;

                priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(currencyId));
            }

            rgItem.description.buyerPrice = inputValue;
            rgItem.description.sellerPrice = nAmount;

            qTotalPrice += inputValue;
            qTotalBuyerPrice += nAmount;

            $J('.queue-total-price .with-fee').html(v_currencyformat(qTotalPrice, GetCurrencyCode(currencyId)));
            $J('.queue-total-price .without-fee').html(v_currencyformat(qTotalBuyerPrice, GetCurrencyCode(currencyId)));

            var pp = $J('<span class="price"></span>');
            pp.html(rgItem.extprice);
            pp.attr('title', priceWithoutFee);

            continue;
        }

        getLowestPriceHandler(rgItem, function (item) {
            var itCnt;
            if (item && item.description.lowestPriceW) {
                var inputValue = getPriceAsInt(item.description.lowestPriceW);
                var nAmount = inputValue;
                var priceWithoutFee = null;
                if (inputValue > 0 && nAmount == parseInt(nAmount)) {
                    // Calculate what the seller gets
                    var publisherFee = typeof SellItemDialog.m_item.market_fee != 'undefined' ? SellItemDialog.m_item.market_fee : g_rgWalletInfo.wallet_publisher_fee_percent_default;
                    var feeInfo = CalculateFeeAmount(nAmount, publisherFee);
                    nAmount = nAmount - feeInfo.fees;

                    priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo.wallet_currency));
                }

                var pp = $J('<span class="price"></span>');
                pp.html(item.description.lowestPriceW);
                pp.attr('title', priceWithoutFee);

                item.description.buyerPrice = inputValue;
                item.description.sellerPrice = nAmount;
                itCnt = $J('.queue-item-container[data-id="' + item.assetid + '"]');
                itCnt.append(pp);
                qTotalPrice += inputValue;
                qTotalBuyerPrice += nAmount;
                $J('.queue-total-price .with-fee').html(v_currencyformat(qTotalPrice, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));
                $J('.queue-total-price .without-fee').html(v_currencyformat(qTotalBuyerPrice, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));

            } else {
                // var rgItemOrg = item;
                $J('#' + item.appid + '_' + item.contextid + '_' + item.assetid + '.selectedSell').removeClass('selectedSell');
                $J(`.queue-item-container[data-id="${item.assetid}"]`).remove();

                var itC = $J('.inventory_page .selectedSell').length;
                if (itC <= 0) {
                    SellItemDialog.Dismiss();
                    $J('#Lnk_ShowSellMulti').hide();
                    $J('#Lnk_TurnIntoGems').hide();
                    $J('#Lnk_SendGifts').hide();
                    $J('#Lnk_Unpack').hide();
                    return false;
                }

                $J('.queue-item-count span:last').html(itC);
                $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));

                var rgItem1 = $J('.queue-item-container')[0].rgItem;
                g_ActiveInventory.SelectItem(null, rgItem1.element, rgItem1);
                g_ActiveInventory.EnsurePageActiveForItem(rgItem1.element);
                UpdateSellItem(rgItem1);
            }
        });
    }
};

var GetQueueGoo = function () {
    isSorting = false;
    if (qTimer) window.clearTimeout(qTimer);
    var it = $J('.queue-item-container:not(:has(>span.price))');
    if (it.length > 0) {
        var rgItem = it[0].rgItem;

        var rgAJAXParams = {
            sessionid: g_sessionID,
            appid: getAppIdFromTags(rgItem.description.tags),
            assetid: rgItem.assetid,
            contextid: rgItem.contextid
        };
        var strActionURL = g_strProfileURL + "/ajaxgetgoovalue/";

        $J.get(strActionURL, rgAJAXParams).done(function (data) {
            var $Content = $J(data.strHTML);
            var strDialogTitle = data.strTitle;
            rgItem.goo_value = data.goo_value;

            if (rgItem.goo_value > 0) {

                var pp = $J('<span class="price"></span>');
                pp.html(rgItem.goo_value);
                pp.attr('title', rgItem.goo_value);
                $J(it[0]).append(pp);
                qTotalPrice += parseInt(rgItem.goo_value);
                $J('.queue-total-price .with-fee').html(qTotalPrice);
                $J('.queue-total-price .without-fee').html('gems');

            } else {
                var rgItemOrg = it[0].rgItem;
                $J('#item' + rgItemOrg.appid + '_' + rgItemOrg.contextid + '_' + $J(it[0]).data().id + '.selectedSell').removeClass('selectedSell');

                var itC = $J('.inventory_page .selectedSell').length;
                if (itC <= 0) {
                    GrindDialog.Dismiss();
                    $J('#Lnk_ShowSellMulti').hide();
                    $J('#Lnk_TurnIntoGems').hide();
                    $J('#Lnk_SendGifts').hide();
                    $J('#Lnk_Unpack').hide();
                    return false;
                }

                var rgItem1 = $J('.queue-item-container')[0].rgItem;
                g_ActiveInventory.SelectItem(null, rgItem1.element, rgItem1);
                g_ActiveInventory.EnsurePageActiveForItem(rgItem1.element);
                UpdateSellItem(rgItem1);
                $J('.queue-item-count span:last').html(itC);
                $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
                $J(it[0]).remove();

            }
            window.setTimeout('GetQueueGoo();', 50);
        });
    }
};

var SetQueueTotal = function () {
    qTotalPrice = 0;
    qTotalBuyerPrice = 0;
    $J('.queue-item-container').each(function (i, e) {

    });
};

var getAppIdFromTags = function (tags) {
    var appId = null;
    var appName = '';
    tags.map(function (item) {
        if (item.category.toLowerCase() === 'game') appName = item.internal_name;
    });
    var matched = appName.match(/app_(\d+)/);
    if (matched) {
        appId = matched[1];
    }
    return appId;
};

var GrindNextItem = function () {
    if ($J('.selectedSell').length == 0) {
        GrindDialog.Dismiss();
        $J('#Lnk_ShowSellMulti').hide();
        $J('#Lnk_TurnIntoGems').hide();
        $J('#Lnk_SendGifts').hide();
        $J('#Lnk_Unpack').hide();
    } else if ($J('.selectedSell').length > 0 && !GrindDialog.m_bIsDismissed) {
        var itC = $J('.selectedSell').length;
        $J('.queue-item-count span:last').html(itC);
        $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
        var rgItem = $J('.queue-item-container:visible')[0].rgItem;
        g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
        g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);

        if (rgItem.goo_value) {
            var rgAJAXParams = {
                sessionid: g_sessionID,
                appid: getAppIdFromTags(rgItem.description.tags),
                assetid: rgItem.assetid,
                contextid: rgItem.contextid,
                goo_value_expected: rgItem.goo_value
            };
            strActionURL = g_strProfileURL + "/ajaxgrindintogoo/";

            $J.post(strActionURL, rgAJAXParams).done(function (data) {

                g_ActiveInventory.selectedItem.description.marketable = 0;
                $J(g_ActiveInventory.selectedItem.element).removeClass('selectedSell');
                $J(g_ActiveInventory.selectedItem.element).css('opacity', '0.3');
                $J('div.queue-item-container[data-id=' + g_ActiveInventory.selectedItem.assetid + ']').hide(200, function () {
                    setTimeout('GrindNextItem()', 100);
                });
            }).fail(function () {
                ShowAlertDialog(strDialogTitle, 'There was an error communicating with the network. Please try again later.');
            });
        }
    } else {
        GrindDialog.Dismiss();
    }
};

var ModifyMarketActions = function () {
    if (typeof (window.fastdelta) == 'undefined') window.fastdelta = -0.01;
    if (typeof (window.delaylistings) == 'undefined') window.delaylistings = 200;
    if (typeof (window.quicksellbuttons) == 'undefined') window.quicksellbuttons = true;
    if (typeof (window.buysetbuttons) == 'undefined') window.buysetbuttons = true;

    PopulateMarketActions = function (elActions, item) {
        var description = item.description;
        elActions.update('');
        if (!description.marketable || (item.is_currency && CurrencyIsWalletFunds(item))) {
            elActions.hide();
            return;
        }

        var bIsTrading = typeof (g_bIsTrading) != 'undefined' && g_bIsTrading;

        if ((typeof (g_bViewingOwnProfile) != 'undefined' && g_bViewingOwnProfile) || bIsTrading) {
            var strMarketName = GetMarketHashName(description);

            var elPriceInfo = new Element('div');
            var elPriceInfoHeader = new Element('div', { 'style': 'height: 24px;' });

            var elMarketLink = new Element('a', {
                'href': 'http://steamcommunity.com/market/listings/' + item.appid + '/' + encodeURIComponent(strMarketName)
            });
            elMarketLink.update(`${SIHLang.info.viewcm || 'View in Community Market'}`);

            if (bIsTrading)
                Steam.LinkInNewWindow($J(elMarketLink));

            elPriceInfoHeader.appendChild(elMarketLink);

            elPriceInfo.appendChild(elPriceInfoHeader);

            var elPriceInfoContent = new Element('div', { 'style': 'min-height: 3em; margin-left: 1em;' });
            elPriceInfoContent.update(`<img src="${window.location.protocol}//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">`);
            elPriceInfo.appendChild(elPriceInfoContent);
            elActions.appendChild(elPriceInfo);

            if (!bIsTrading) {
                var elSellButton = CreateMarketActionButton('green', 'javascript:SellCurrentSelection()', `${SIHLang.info.sell || 'Sell'}`);
                $J(elSellButton).css({ 'marginRight': '12px', 'marginBottom': '8px' });
                elActions.appendChild(elSellButton);

                if (window.instantsellbuttons && !selectmode) addInstantSellButton(item, elActions);
            }

            const itemLink = `${window.location.protocol}//steamcommunity.com/market/priceoverview/?appid=${item.appid}&country=${g_strCountryCode}&currency=${typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo.wallet_currency : 1}&market_hash_name=${encodeURIComponent(strMarketName)}`;

            // new Ajax.Request( 'http://steamcommunity.com/market/priceoverview/', {
            //     method: 'get',
            //     parameters: {
            //         country: g_strCountryCode,
            //         currency: typeof( g_rgWalletInfo ) != 'undefined' ? g_rgWalletInfo['wallet_currency'] : 1,
            //         appid: item.appid,
            //         market_hash_name: strMarketName
            //     },
            //     onSuccess: function({ responseJSON }) {
            PriceQueue.GetPrice({
                method: 'GET',
                url: itemLink,
                success: function (responseJSON) {
                    if (responseJSON && responseJSON.success) {
                        var strInfo = '';
                        if (responseJSON.lowest_price) {
                            strInfo += `${SIHLang.info.startingAt || 'Starting at'}: ${responseJSON.lowest_price}<br>`
                            item.description.lowestPrice = responseJSON.lowest_price;
                            item.description.lowestPriceW = responseJSON.lowest_price;
                        } else {
                            strInfo += `${SIHLang.info.nosales || 'There are no listings currently available for this item.'}<br>`;
                        }

                        if (responseJSON.volume) {
                            var strVolume = `${SIHLang.info.last24 || '%1$s sold in the last 24 hours'}`;
                            strVolume = strVolume.replace('%1$s', responseJSON.volume);
                            //strInfo += 'Median price: ' + responseJSON.median_price + '<br>';
                            strInfo += `${SIHLang.info.volume || 'Volume'}: ${strVolume}<br>`;
                        }

                        if (window.hidedefaultprice) {
                            elPriceInfoContent.update('');
                            // elPriceInfo.hide();
                        } else {
                            elPriceInfoContent.update(strInfo);
                        }

                        if (window.quicksellbuttons && responseJSON.lowest_price) addQuickSellButton(item, elActions);
                        $J(elActions).trigger('v_contentschanged');
                    }
                },
                // onFailure: function( transport ) { elPriceInfo.hide(); }
            });


            if (!g_bMarketAllowed) {
                var elTooltip = $('market_tip_noaccess');
                InstallHoverTooltip(elSellButton, elTooltip);
            }
        } else {
            elActions.hide();
            return;
        }

        elActions.show();
    };
};

var ModifyDescriptionFunction = function () {
    const orgPopulateDescriptions = PopulateDescriptions;
    PopulateDescriptions = function (elDescriptions, rgDescriptions) {
        elDescriptions.update('');
        if (!rgDescriptions || !rgDescriptions.length) {
            elDescriptions.hide();
            return;
        }

        elDescriptions.show();
        var setEl = null;
        var setName = null;
        var totalPrice = 10;
        const playerItems = new Set(Object.keys(g_ActiveInventory.m_rgAssets).map(item => {
            const rgItem = g_ActiveInventory.GetLoadedAsset(item);
            return rgItem.description.market_hash_name;
        }));
        var missingParts = [];
        for (var i = 0; i < rgDescriptions.length; i++) {
            var description = rgDescriptions[i];
            if (!description.value.trim()) continue;
            description.value = description.value.trim();

            var strParsedDescription = v_trim(description.value.replace(/\[date\](\d*)\[\/date\]/g, function (match, p1) {
                var date = new Date(p1 * 1000);
                return date.toLocaleString();
            }));

            var elDescription = new Element('div', { 'class': 'descriptor' });
            if (description.color)
                elDescription.style.color = '#' + description.color;

            // just use a blank space for an empty string
            if (strParsedDescription.length == 0) {
                elDescription.update('&nbsp;');
            } else if (description.type == 'image') {
                var elImage = new Element('img', { src: v_trim(description.value) });
                elDescription.appendChild(elImage);
            } else if (description.type == 'html') {
                var html = strParsedDescription;
                if (description.app_data && !description.app_data.limited && !description.app_data.is_itemset_name) {
                    var item = {};
                    if (description.app_data.price) {
                        var pp = getPriceAsInt(description.app_data.price);
                        item.price = pp;
                        item.link = window.location.protocol + '//steamcommunity.com/market/listings/' + g_ActiveInventory.appid + '/' + encodeURIComponent(description.app_data.market_hash_name);
                        item.name = strParsedDescription;
                        item.market_hash_name = description.app_data.market_hash_name;
                        totalPrice += parseFloat(pp);
                        html = '<a href="' + window.location.protocol + '//steamcommunity.com/market/listings/' + g_ActiveInventory.appid + '/' + encodeURIComponent(description.app_data.market_hash_name) + '" target="_blank" style="color:inherit" class="whiteLink">' + html + ' (' + description.app_data.price + ')</a>';
                    }

                    if (description.isinset) {
                        if (description.app_data.owned) {
                            html = '&#10003; ' + html;
                        } else {
                            html = '&#10007;&nbsp; ' + html;
                            if (description.app_data.price) {
                                missingParts.push(item);
                            }
                        }
                    }
                }

                if (description.color && description.color === '9da1a9') {
                    setEl = elDescription;
                }

                if (description.color && description.color === '6c7075') {
                    if (playerItems.has(description.value) || [...playerItems].find(item => item.endsWith(description.value) || description.value.endsWith(item))) {
                        html = '&#10003;&nbsp;' + html;
                    } else {
                        html = '&#10007;&nbsp;' + html;
                        const item = {};
                        item.link = `${window.location.protocol}//steamcommunity.com/market/listings/${g_ActiveInventory.appid}/${encodeURIComponent(description.value.replace('The ', ''))}`;
                        item.name = strParsedDescription;
                        missingParts.push(item);
                    }
                }

                if (description.isstickers) {
                    html = html.substr(0, html.indexOf('<br>Sticker:') + 12);
                    for (var k = 0; k < description.stickers.length; k++) {
                        var sticker = description.stickers[k];
                        if (k) html += ', ';
                        html += sticker.name;
                        if (sticker.prices && sticker.prices.lowestPrice) {
                            html += ' - <span title="' + sticker.prices.nofeePrice + '" style="color: #FF0">' + sticker.prices.lowestPrice + '</span>'
                        }
                    }
                    html += '</center></div>';
                }

                if (description.insgems && description.insgems.length) {
                    if (!description.orgvalue) {
                        description.orgvalue = description.value;
                    } else {
                        description.value = description.orgvalue;
                    }

                    var regexgem = /<span style="font-size: 12px">([\w\s]+)<\/span>/gi;
                    for (var j = 0; j < description.insgems.length; j++) {
                        var m = regexgem.exec(description.orgvalue);
                        var ggem = description.insgems[j];
                        var gemLink = window.location.protocol + '//steamcommunity.com/market/listings/570/' + ggem.name;
                        if (ggem.lowestPrice) {
                            description.value = description.value.replace(m[0], '<a href="' + gemLink + '" target="_blank" title="' + ggem.name + '">' + m[1] + ' <span style="color: #FF0">(' + ggem.lowestPrice + ')</span></a>')
                        } else {
                            description.value = description.value.replace(m[0], '<a href="' + gemLink + '" target="_blank" title="' + ggem.name + '">' + m[1] + '</a>')
                        }
                    }
                    html = description.value;
                }
                elDescription.update(html);
            } else {
                elDescription.update(strParsedDescription.escapeHTML().replace(/\n/g, '<br>'));
            }

            if (description.app_data && description.app_data.is_itemset_name) {
                setEl = elDescription;
                setName = description.value;
            }

            if (description.label) {
                var elLabel = new Element('span', { 'class': 'descriptor_label' });
                elLabel.update(description.label + ': ');
                elDescription.insert({ top: elLabel });
            }

            elDescriptions.appendChild(elDescription);
        }
        if (setEl) {
            if (missingParts.length > 0 && g_bViewingOwnProfile && g_bMarketAllowed && buysetbuttons && !elDescriptions.id.startsWith('hover')) {
                var buySetBtn = $J('<a href="javascript:void(0);" class="buy-set">' + SIHLang.buymissing + '</a>');
                buySetBtn.click(function () {
                    BuySetDialog.Show(missingParts);
                    return false;
                });
                $J(setEl).append('<br />').append(buySetBtn);
            }
        }

    };

    var orgPopulateTags = PopulateTags;
    PopulateTags = function (elTags, elTagsContent, rgTags) {
        orgPopulateTags(elTags, elTagsContent, rgTags);
        if (rgTags && rgTags.length > 0) {
            var link = $J('<a href="javascript:void(0)">Gen. expression</a>');
            link.click(function () {
                GenExpDialog.Show(rgTags);
            });
            $J(elTagsContent).append('<br />').append(link);
        }
    }
};

var ModifyItemDisplay = function () {
    UserYou.OnLoadInventoryComplete = function (transport, appid, contextid) {
        this.cLoadsInFlight--;
        if (transport.responseJSON && transport.responseJSON.success) {
            var inventory = new CInventory(this, appid, contextid, transport.responseJSON.rgInventory, transport.responseJSON.rgCurrency);

            this.addInventory(inventory);
            var elInventory = inventory.getInventoryElement();
            elInventory.hide();
            $('inventories').insert(elInventory);

            var elTags = inventory.getTagContainer();
            var elTagHolder = $('filter_options');
            if (elTagHolder && elTags) {
                elTags.hide();
                elTagHolder.insert(elTags);
                elTagHolder.addClassName('filter_collapsed');
            }

            var classArr = {};
            for (var ii in transport.responseJSON.rgInventory) {
                var rgItem = transport.responseJSON.rgInventory[ii];
                if (!classArr[rgItem.classid]) {
                    classArr[rgItem.classid] = 1;
                } else {
                    classArr[rgItem.classid]++;
                }
            }
            //console.log(classArr);

            for (var ii in transport.responseJSON.rgInventory) {
                var rgItem = transport.responseJSON.rgInventory[ii];
                if (classArr[rgItem.classid] && classArr[rgItem.classid] > 1 && rgItem.descriptions) {
                    if (!rgItem.descriptions[0].iscount) {
                        rgItem.descriptions.unshift({
                            iscount: true,
                            type: 'html',
                            value: 'Number owned: <i style="color: rgb(153, 204, 255); font-size: 16px">' + classArr[rgItem.classid] + '</i>' + (g_bViewingOwnProfile ? ' (<a href="javascript:selectSimilar(' + rgItem.classid + ')">Select all</a>)' : '')
                        });
                    }
                }
            }

            if (appid == 570) {
                $J.ajax({
                    url: 'https://api.steampowered.com/IEconItems_570/GetPlayerItems/v0001/',
                    strSteamId: this.strSteamId,
                    data: {
                        SteamID: this.strSteamId,
                        key: apiKey
                    },
                    success: function (data) {
                        if (!apiItems[this.strSteamId]) {
                            apiItems[this.strSteamId.toString()] = {};
                        }

                        if (data && data.result && data.result.status == 1) {
                            apiItems[this.strSteamId][appid] = data.result.items;
                            $J.each(apiItems[this.strSteamId][appid], function (i, o) {
                                var elIt = $J('div.item[id=item570_2_' + o.id + ']');
                                if (o.equipped) {
                                    elIt.addClass('item-equipped');
                                    elIt.each(function () {
                                        this.rgItem.equipped = true;
                                    });
                                }
                                elIt.each(function () {
                                    this.rgItem.defindex = o.defindex;
                                });
                            });
                        }
                    },
                    error: function () {

                    }
                });
            } else if (appid == 440) {
                $J.ajax({
                    url: 'https://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/',
                    strSteamId: this.strSteamId,
                    data: {
                        SteamID: this.strSteamId,
                        key: apiKey
                    },
                    success: function (data) {
                        if (!apiItems[this.strSteamId]) {
                            apiItems[this.strSteamId.toString()] = {};
                        }

                        if (data && data.result && data.result.status == 1) {
                            apiItems[this.strSteamId][appid] = data.result.items;
                            $J.each(apiItems[this.strSteamId][appid], function (i, o) {
                                var elIt = $J('div.item[id=item440_2_' + o.id + ']');
                                if (o.equipped) {
                                    elIt.addClass('item-equipped');
                                    elIt.each(function () {
                                        this.rgItem.equipped = true;
                                    });
                                }
                                elIt.each(function () {
                                    this.rgItem.defindex = o.defindex;
                                    this.rgItem.apivalue = o;
                                });
                            });
                        }
                        if (TF2BP && TF2BP.SetPrices) {
                            TF2BP.SetPrices(appid);
                        }
                    },
                    error: function () { }
                });
            }
            if (window.extprice) {
                SetupExternalDropdown(g_ActiveInventory.appid);
                if (ExternalPrices[appid]) {
                    var lastAPI = GetCookie('lastext_' + appid);
                    if (lastAPI != null) {
                        lastAPI = parseInt(lastAPI);
                    } else {
                        lastAPI = 0;
                    }
                    $J.each(ExternalPrices[appid].apis, function (idx, el) {
                        if (this.api && this.api.GetPrices) {
                            this.api.GetPrices(appid, inventory.rgInventory, (idx == lastAPI));
                        }
                    });
                }
            }
        } else {
            this.OnInventoryLoadFailed(transport, appid, contextid);
            return;
        }

        this.ShowInventoryIfActive(appid, contextid);
        $J(window).trigger('resize.DynamicInventorySizing');

        $J.each(itemsInTrades, function () {
            var it = this;
            if (it.appid == appid) {
                var elIt = $J(`div.item[id=${it.appid}_${it.context}_${it.id}]`);
                elIt.addClass('item-in-trade');
            }
        });

        if (g_bIsTrading) {
            RedrawCurrentTradeStatus();
        }
    };
};

var numberOfRetries = 0, maxRetries = 10;
var dopplerPhaseName = {
    421: 'Phase 4',
    420: 'Phase 3',
    419: 'Phase 2',
    418: 'Phase 1',
    417: 'Black Pearl',
    416: 'Sapphire',
    415: 'Ruby'
};

var SortItem = function (asc, cat = 'price') {
    // lastSort = asc;
    var order = (asc ? 1 : -1);
    var sortFunc = function (a, b) {
        const aobj = a[0].rgItem;
        const bobj = b[0].rgItem;

        let an;
        let bn;
        switch (cat) {
            case 'price':
                an = (aobj && aobj.extprice !== undefined) ? aobj.extprice : 0;
                bn = (bobj && bobj.extprice !== undefined) ? bobj.extprice : 0;
                break;

            case 'float':
                an = (aobj && aobj.floatvalue !== undefined) ? aobj.floatvalue : 1 * order;
                bn = (bobj && bobj.floatvalue !== undefined) ? bobj.floatvalue : 1 * order;
                break;

            default:
                an = aobj.description.market_hash_name;
                bn = bobj.description.market_hash_name;
                break;
        }

        if (an === bn) {
            an = aobj.description.market_hash_name;
            bn = bobj.description.market_hash_name;
        }

        if (an === bn) {
            an = a.assetid;
            bn = b.assetid;
        }

        if (an > bn) {
            return order;
        }
        if (an < bn) {
            return -1 * order;
        }
        return 0;
    };

    // var userInv= UserYou.rgContexts[730][2]["inventory"];
    g_ActiveInventory.m_rgItemElements.sort(sortFunc);
    var curTags = Filter.rgCurrentTags;
    var elFilter = Filter.elFilter;
    var strLastFilter = Filter.strLastFilter;
    // Filter.ClearTextFilter();
    Filter.ClearFilter();
    g_ActiveInventory.LayoutPages();
    Filter.strLastFilter = strLastFilter;
    Filter.elFilter = elFilter;
    Filter.elFilter.value = strLastFilter;
    Filter.UpdateTagFiltering(curTags);
    Filter.ReApplyFilter();
};

var ModifyGamesTabs = function () {
    var numberOfGames = $J('.games_list_tabs a.games_list_tab').length;
    var cIdx = $J('.games_list_tabs a.games_list_tab').index($J('.games_list_tabs .active'));

    if (numberOfGames > 10) {
        var divCont = $J('<div class="holder">');
        var divCtrl = $J('<div class="tab-controls">');
        var children = $J('.games_list_tabs').children().remove();
        divCont.append(children);
        divCtrl.append('<a href="#" class="tab-up">up</a><a href="#" class="tab-down">down</a>');
        divCtrl.find('.tab-up').click(function () {
            divCont.stop();

            var cPos = parseInt(divCont.scrollTop() / 56) * 56;
            divCont.animate({ scrollTop: cPos - 112 }, 500);
            return false;
        });
        divCtrl.find('.tab-down').click(function () {
            divCont.stop();
            var cPos = (parseInt(divCont.scrollTop() / 56)) * 56;
            divCont.animate({ scrollTop: cPos + 112 }, 500);
            return false;
        });
        $J('.games_list_tabs').append(divCont);
        $J('.games_list_tabs').append(divCtrl);
        if (cIdx > 5) {
            divCont.animate({ scrollTop: cIdx * 56 }, 500);
        }
    }
};

var loadPriceHistory = function (rgItem) {
    // Load price history
    $J('#pricehistory_container').show();
    $J('#pricehistory').hide();
    $J('#pricehistory_throbber').show();
    $J('#pricehistory_notavailable').hide();
    new Ajax.Request(`${window.location.protocol}//steamcommunity.com/market/pricehistory/`, {
        method: 'get',
        parameters: {
            appid: rgItem.appid,
            market_hash_name: GetMarketHashName(rgItem.description)
        },
        onSuccess: function (transport) { SellItemDialog.OnPriceHistorySuccess(transport); },
        onFailure: function (transport) { SellItemDialog.OnPriceHistoryFailure(transport); }
    });
};

var updateInfoWindow = function (item) {
    SellItemDialog.m_item = item;
    var elItem = $('market_sell_dialog_item');
    if (item.description.name_color)
        elItem.style.borderColor = '#' + item.description.name_color;
    if (item.description.background_color)
        elItem.style.backgroundColor = '#' + item.description.background_color;

    var elItemImage = $('market_sell_dialog_item_img');
    if (item.description.is_stackable) {
        elItemImage.src = ImageURL(item.description.icon_url, '96f', '58f');
    } else {
        elItemImage.src = ImageURL(item.description.icon_url, '96f', '96f');
    }

    SellItemDialog.m_strName = GetEscapedNameForItem(item);
    $('market_sell_dialog_item_name').update(SellItemDialog.m_strName);
    $('market_sell_quantity_available_amt').update(item.amount);

    if (item.description.name_color) {
        $('market_sell_dialog_item_name').style.color = '#' + item.description.name_color;
    } else {
        $('market_sell_dialog_item_name').style.color = '';
    }

    if (item.appid && g_rgAppContextData[item.appid]) {
        var rgAppData = g_rgAppContextData[item.appid];
        $('market_sell_dialog_game_icon').src = rgAppData.icon;
        $('market_sell_dialog_game_icon').alt = rgAppData.name;
        $('market_sell_dialog_game_name').update(rgAppData.name);
        $('market_sell_dialog_item_type').update(item.description.type);
        $('market_sell_dialog_game_info').show();
    } else {
        $('market_sell_dialog_game_info').hide();
    }

    if (item.amount == 1) {
        $('market_sell_quantity_input').disable();

        $('market_sell_quantity_label').hide();
        $('market_sell_quantity_input').hide();
        $('market_sell_quantity_available').hide();
    } else {
        $('market_sell_quantity_label').show();
        $('market_sell_quantity_input').show();
        $('market_sell_quantity_available').show();
    }

    if ($J('#pricehistory_container').is(':visible')) loadPriceHistory(item);
};

var UpdateSellItem = function (item) {
    if ($J('#ck_autoadjust').is(':checked')) {
        if (item.description.lowestPriceW === undefined && !isSorting) {
            SellItemDialog.b_isInterupted = true;
            return false;
        }
        recalcPrice(item);
    }

    updateInfoWindow(item);
    return true;
};

var recalcPrice = function (item) {
    var rgItem = item || g_ActiveInventory.selectedItem;
    $J('#market_sell_currency_input').val(v_currencyformat(0, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));
    $J('#market_sell_buyercurrency_input').val(v_currencyformat(0, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));
    if (rgItem.description.lowestPriceW === undefined && rgItem.description.buyerPrice === undefined) return;
    var calPrice, info, sellerPrice, buyerPrice;
    var publisherFee = typeof SellItemDialog.m_item.market_fee != 'undefined' ? SellItemDialog.m_item.market_fee : g_rgWalletInfo.wallet_publisher_fee_percent_default;

    buyerPrice = rgItem.description.buyerPrice || getPriceAsInt(rgItem.description.lowestPriceW);

    calPrice = CalculateSellingPrice(buyerPrice);
    if (calPrice < 3) calPrice = buyerPrice;  // minimal price is 0.03

    info = CalculateFeeAmount(calPrice, publisherFee);
    sellerPrice = calPrice - info.fees;
    buyerPrice = calPrice;

    $J('#market_sell_currency_input').val(v_currencyformat(sellerPrice, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));
    $J('#market_sell_buyercurrency_input').val(v_currencyformat(buyerPrice, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));
    SellItemDialog.m_nConfirmedPrice = sellerPrice;
};

const setSellingType = (e, selType) => {
    $J('.tabs button').each((idx, elem) => {
        $J(elem).removeClass('active');
    });
    $J(e.currentTarget || e.target).addClass('active');
    if (selType === 'auto') {
        $J('#div_multi').show();
    } else {
        $J('#ck_autoadjust').prop('checked', false);
        $J('#market_sell_currency_input, #market_sell_buyercurrency_input').prop('disabled', false);
        $J('#Txt_adjust, #cb_adtype').prop('disabled', true);
        $J('#div_multi').hide();
    }
    $J('#ck_autoaccept').prop('checked', selType === 'auto');
};

var ModifySellingFunctions = function () {
    SellItemDialog.orgOnSuccess = SellItemDialog.OnSuccess;
    SellItemDialog.orgOnFailure = SellItemDialog.OnFailure;
    SellItemDialog.newOnSuccess = function (transport) {
        this.m_bWaitingForUserToConfirm = false;
        this.m_bWaitingOnServer = false;
        if (transport.responseJSON) {
            $('market_headertip_itemsold_itemname').update(this.m_strName);
            if (this.m_item.description.name_color) {
                $('market_headertip_itemsold_itemname').style.color = '#' + this.m_item.description.name_color;
            } else {
                $('market_headertip_itemsold_itemname').style.color = '';
            }

            $J(g_ActiveInventory.selectedItem.element).removeClass('selectedSell');
            $J(g_ActiveInventory.selectedItem.element).css('opacity', '0.3');
            $J('div.queue-item-container[data-id=' + g_ActiveInventory.selectedItem.assetid + ']').hide(200, function () {

                var items = $J('.queue-item-container:visible');
                var itC = items.length;
                if (itC > 0) {
                    $J('.queue-item-count span:last').html(itC);
                    var nextItem = items.has('span.price')[0] || items[0];
                    $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
                    var rgItem = nextItem.rgItem;
                    g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
                    g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
                    if (!UpdateSellItem(rgItem)) return;

                    if ($J('#ck_autoaccept').is(':checked')) {
                        if ($J('#market_sell_dialog').is(':visible'))
                            window.setTimeout('SellItemDialog.OnConfirmationAccept({stop:function(){}});', window.delaylistings);
                    } else {
                        var $marketSellDialogOk = $('market_sell_dialog_ok');
                        $marketSellDialogOk.show();
                        $marketSellDialogOk.setOpacity('0');
                        $marketSellDialogOk.fade({ duration: 0.25, from: 0, to: 1 });
                        var $marketSellDialogBack = $('market_sell_dialog_back');
                        $marketSellDialogBack.show();
                        $marketSellDialogBack.setOpacity('0');
                        $marketSellDialogBack.fade({ duration: 0.25, from: 0, to: 1 });
                        $('market_sell_dialog_throbber').fade({ duration: 0.25 });
                    }
                }
            });

            if ($J('.selectedSell').length <= 0) {
                SellItemDialog.Dismiss();
                $J('.item.selectedSell').removeClass('selectedSell');
                $J('.similar-item').removeClass('similar-item');

                $J('#Lnk_Cancel').hide();
                $J('#Lnk_ShowSellMulti').hide();
                $J('#Lnk_TurnIntoGems').hide();
                $J('#Lnk_SendGifts').hide();
                $J('#Lnk_Unpack').hide();
                selectmode = false;
                SellItemDialog.OnFailure = SellItemDialog.orgOnFailure;
                $J('.item_market_actions').html('');
            }
        } else {
            this.DisplayError('There was a problem listing your item. Refresh the page and try again.');
        }
    };

    SellItemDialog.orgShow = SellItemDialog.Show;

    SellItemDialog.Show = function (item) {
        SellItemDialog.orgShow(item);
        SellItemDialog.m_modal.m_fnOnDismiss = function () {
            $J('div.queue-container').remove();
            $J('#manualsell').click();
            HideHover();
        }
    };

    SellItemDialog.newOnFailure = function (transport) {
        this.m_bWaitingOnServer = false;

        var queue = Effect.Queues.get('global');
        queue.each(function (effect) {
            effect.cancel();
        });

        var $marketSellDialogOk = $('market_sell_dialog_ok');
        $marketSellDialogOk.show();
        $marketSellDialogOk.setOpacity('0');
        $marketSellDialogOk.fade({ duration: 0.25, from: 0, to: 1 });
        var $marketSellDialogBack = $('market_sell_dialog_back');
        $marketSellDialogBack.show();
        $marketSellDialogBack.setOpacity('0');
        $marketSellDialogBack.fade({ duration: 0.25, from: 0, to: 1 });
        $('market_sell_dialog_throbber').fade({ duration: 0.25 });

        if (transport.responseJSON && transport.responseJSON.message) {
            this.DisplayError(transport.responseJSON.message);
            var errMsgList = [
                'Лот с этим предметом уже ожидает вашего согласия на продажу. Подтвердите или отмените его.',
                'You already have a listing for this item pending confirmation. Please confirm or cancel the existing listing.',
                'The item specified is no longer in your inventory or is not allowed to be traded on the Community Market.'
            ];
            if (errMsgList.indexOf(transport.responseJSON.message) === -1) {
                if ($J('#ck_autoaccept').is(':checked') && transport.responseJSON.message.indexOf('exceed the maximum wallet balance') < 0) {
                    window.setTimeout('SellItemDialog.OnConfirmationAccept({stop:function(){}});', 200);
                }
            } else {
                $J(g_ActiveInventory.selectedItem.element).removeClass('selectedSell');
                $J(g_ActiveInventory.selectedItem.element).css('opacity', '0.3');
                $J('.queue-item-container[data-id="' + g_ActiveInventory.selectedItem.assetid + '"]').find('.queue-item-remove ').trigger('click');
                $J('#market_sell_dialog_skip').trigger('click');
            }
        } else {
            this.DisplayError('There was a problem listing your item. Refresh the page and try again.');
        }
    };
    //g_bMarketAllowed
    $J('#filter_options').after(
        '<div id="control-panel">' +
        '<label for="Ck_NoReload" style="margin-left: 12px; display: none"><input type="checkbox" name="Ck_NoReload" checked="checked" id="Ck_NoReload" /><span data-lang="noreload">No inventory reloading when sell item</span></label>' +
        '</div>'
    );

    if (window.selectallbuttons) $J('#Lnk_Sellall').show();
    else $J('#Lnk_Sellall').hide();

    $J('.market_dialog_content:has(#market_sell_dialog_input_area)').before(`
        <div class="tabs">
            <button id="manualsell" onclick="setSellingType(event, 'manual')" class="active">${SIHLang.queue.manualsell}</button>
            <button id="autosell" onclick="setSellingType(event, 'auto')">${SIHLang.queue.autosell}</button>
        </div>
    `);
    $J('#marker_sell_dialog_terms').prop('style', 'width:100%');
    $J('#market_sell_dialog_accept_ssa_label').after('<div id="div_multi" style="display:none">' +
        '<input hidden type="checkbox" id="ck_autoaccept"><br/>' +
        '<label for="ck_autoadjust"><input type="checkbox" id="ck_autoadjust"> <span data-lang="autoadjust">auto adjust price</span></label>' +
        '<input type="number" step="0.01" title="adjust amount" id="Txt_adjust" value="0" disabled />' +
        '<select id="cb_adtype" disabled><option value="1">Value</option><option value="2">Percentage</option></select>' +
        '</div>');

    $J('.market_dialog_bottom_buttons').prepend('<a id="market_sell_dialog_skip" href="#" class="btn_green_white_innerfade btn_medium_wide" style="float: left; display: none;"><span>Skip</span></a>');
    $J('#market_sell_dialog_skip').click(function () {
        var items = $J('.queue-item-container:visible');
        var nextItem = items.has('span.price')[0] || items[0];
        const rgItem = nextItem.rgItem;
        $J('#market_sell_dialog_error').hide();
        g_ActiveInventory.selectedItem = rgItem;
        // updateInfoWindow(rgItem);
        // if ($J('#ck_autoadjust').prop('checked')) recalcPrice(rgItem);

        // Load price history
        // $J('#pricehistory_container').show();
        $J('#pricehistory_container').hide();
        $J('#pricehistory').hide();
        // $J('#pricehistory_throbber').show();
        $J('#pricehistory_notavailable').hide();
        // new Ajax.Request( 'http://steamcommunity.com/market/pricehistory/', {
        //     method: 'get',
        //     parameters: {
        //         appid: rgItem.appid,
        //         market_hash_name: GetMarketHashName( rgItem.description )
        //     },
        //     onSuccess: function( transport ) { SellItemDialog.OnPriceHistorySuccess( transport ); },
        //     onFailure: function( transport ) { SellItemDialog.OnPriceHistoryFailure( transport ); }
        // });
        console.log('Skipping this item');
        setTimeout(function () {
            // $J('#market_sell_dialog_back').trigger('click');
            document.getElementById('market_sell_dialog_ok').click();
        }, 500);
        $J(this).hide();
    });


    // выбираем целевой элемент
    var target = document.getElementById('market_sell_dialog_confirm_buttons');

    // создаём экземпляр MutationObserver
    var observer = new MutationObserver(function (mutations) {
        const isVisible = $J('#market_sell_dialog_ok').is(':visible');
        $J('#div_multi input[type=checkbox], #Txt_adjust, #cb_adtype').prop('disabled', isVisible);
        if (isVisible) {
            $J('#price_history_refresh, .tabs').hide();
        } else {
            $J('#price_history_refresh, .tabs').show();
            if (!reqPriceHistory) loadPriceHistory(g_ActiveInventory.selectedItem);
        }
        reqPriceHistory = !isVisible;
    });

    // конфигурация нашего observer:
    var config = { attributes: true };

    // передаём в качестве аргументов целевой элемент и его конфигурацию
    observer.observe(target, config);

    SellItemDialog.OnSuccess = SellItemDialog.newOnSuccess;

    $J('#Ck_NoReload').click(function () {
        if ($J(this).is(':checked')) {
            SellItemDialog.OnSuccess = SellItemDialog.newOnSuccess;
        } else {
            SellItemDialog.OnSuccess = SellItemDialog.orgOnSuccess;
        }
    });
    $J('#Txt_adjust, #cb_adtype').change(function (e) {
        if (e.target.id == 'Txt_adjust' && e.target.value === '') e.target.value = 0;
        recalcPrice();
    });
    $J('#ck_autoadjust').change(function () {
        const isChecked = $J(this).prop('checked');
        $J('#market_sell_currency_input, #market_sell_buyercurrency_input').prop('disabled', isChecked);
        $J('#Txt_adjust, #cb_adtype').prop('disabled', !isChecked);
        if (isChecked) recalcPrice();
    });

    $J('#Lnk_Sellmulti').click(function () {
        selectmode = !selectmode;
        if (selectmode) {
            $J('#Lnk_Cancel').show();
            $J('#Ck_NoReload').prop('checked', true);
            SellItemDialog.OnSuccess = SellItemDialog.newOnSuccess;
            SellItemDialog.OnFailure = SellItemDialog.newOnFailure;
        } else {
            CancelSelectAll();
            $J('#Lnk_Cancel').hide();
            $J('#Lnk_ShowSellMulti').hide();
            $J('#Lnk_TurnIntoGems').hide();
            $J('#Lnk_SendGifts').hide();
            $J('#Lnk_Unpack').hide();
            SellItemDialog.OnFailure = SellItemDialog.orgOnFailure;
        }
        $J('.item.selectedSell').removeClass('selectedSell');
        $J('.similar-item').removeClass('similar-item');

        return false;
    });
    $J('#Lnk_Sellall').click(function () {
        $J('#Lnk_Cancel').show();

        $J('#Ck_NoReload').prop('checked', true);
        $J('.equiped').remove();
        $J('.review').remove();

        $J('div[id^="inventory_"]:visible.inventory_ctn').each(function (i) {
            var $visiblePage = $J(this).find('.inventory_page:visible');
            $visiblePage.find('div.item:visible').each(function (i) {
                if (!$J(this).hasClass('selectedSell')) {
                    if (this.rgItem && (this.rgItem.description.marketable || this.rgItem.appid == 753)) {
                        // g_ActiveInventory.LoadItemImage(this);
                        $J(this).addClass('selectedSell');
                    }
                }
            });
        });

        var itC = $J('.selectedSell').length;
        if (itC > 0) {
            $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
            $J('#Lnk_ShowSellMulti').show();
            if (g_ActiveInventory.appid == 753) {
                $J('#Lnk_TurnIntoGems').show();
                $J('#Lnk_SendGifts').show();
                $J('#Lnk_Unpack').show();
            }
        }

        selectmode = true;
        SellItemDialog.OnSuccess = SellItemDialog.newOnSuccess;
        SellItemDialog.OnFailure = SellItemDialog.newOnFailure;
        return false;
    });
    $J('#Lnk_ShowSellMulti').click(function () {
        if ($J('.selectedSell').length > 0) {
            $J('#div_multi input[type=checkbox]').prop('disabled', false);
            $J('.tabs').show();
            if ($J('#ck_autoaccept').prop('checked')) $J('.tabs button:last').click();
            else $J('.tabs button:first').click();
            var rgItem = $J('.selectedSell')[0].rgItem;
            g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
            g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
            SellItemDialog.m_bWaitingOnServer = false;
            SellItemDialog.Show(rgItem);
            ShowQueue();
        }
        return false;
    });
    $J('#Lnk_TurnIntoGems').click(function () {
        if ($J('.selectedSell').length > 0) {
            //$J('#div_multi input[type=checkbox]').prop('disabled', false);
            //$J('#div_multi').show();
            //$J('#ck_autoaccept').prop('checked', true);
            //var rgItem = $J('.selectedSell')[0].rgItem;
            ////g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
            ////g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
            ////SellItemDialog.m_bWaitingOnServer = false;
            ////SellItemDialog.Show(rgItem);

            //var rgAJAXParams = {
            //    sessionid: g_sessionID,
            //    appid: rgItem.app_data.appid,
            //    assetid: rgItem.id,
            //    contextid: rgItem.contextid
            //};
            var strActionURL = g_strProfileURL + "/ajaxgetgoovalue/";
            GrindDialog.Show();
            ShowQueue(1);
            //$J.get(strActionURL, rgAJAXParams).done(function (data) {
            //    var $Content = $J(data.strHTML);
            //    var strDialogTitle = data.strTitle;
            //    ShowConfirmDialog(strDialogTitle, $Content).done(function () {
            //        GrindNextItem();
            //    });
            //});
        }
        return false;
    });
    $J('#Lnk_SendGifts').click(function () {
        var url = '';
        $J('.selectedSell').each(function () {
            var rgItem = this.rgItem;
            if (rgItem.appid == 753 && rgItem.contextid == 1) {
                var isSent = false;
                var msgSent = '';
                // проверяем чтобы gift не был отправлен ранее
                if (rgItem.description.owner_descriptions && Array.isArray(rgItem.description.owner_descriptions)) {
                    var re = new RegExp('<a href=.*://steamcommunity.com/.* data-miniprofile="\\d+">.*</a>');  // ссылка на профиль получателя
                    isSent = rgItem.description.owner_descriptions.some(function (desc) {
                        var res = re.test(desc.value);
                        if (res) msgSent = rgItem.name + ': ' + desc.value.replace(/<[^>]*>/g, '');  // текст сообщения что gift был уже отправлен пользователю
                        return res;
                    });
                }
                if (!isSent) {
                    url += rgItem.assetid + '/';
                } else {
                    alert(msgSent);
                }
            }
        });

        if (url != '') {
            url = 'http://store.steampowered.com/checkout/sendgift/' + url + g_steamID;
            window.location.href = url;
        } else {
            $J('#Lnk_SendGifts').hide();
        }
        return false;
    });

    $J('#Lnk_Unpack').click(function () {
        const $rgCards = [];
        const reqData = [];
        const CARDS_PER_BOOSTER_PACK = 3;

        $J('.selectedSell').each(function (idx, elem) {
            const rgItem = elem.rgItem;
            const market_hash_name = rgItem.description.market_hash_name;
            if (rgItem.appid == 753 && rgItem.contextid == 6 && market_hash_name.toUpperCase().endsWith('BOOSTER PACK')) {
                console.log(market_hash_name);
                reqData.push({
                    appid: rgItem.description.market_fee_app,
                    communityitemid: rgItem.assetid,
                    sessionid: g_sessionID
                });
            }
        });
        var submitUrl = `${g_strProfileURL}/ajaxunpackbooster/`;
        if (reqData.length) {
            Promise.all(
                reqData.map(data => new Promise((resolve, reject) => $J.post(submitUrl, data).then(resolve).fail(reject)))
            ).then(respValues => {
                var $Content = $J('<div/>', { 'class': 'booster_unpack_dialog' });

                var $TitleArea = $J('<div/>', { 'class': 'booster_unpack_title' });
                $Content.append($TitleArea);

                var $PostUnpackActions = $J('<div/>', { 'class': 'booster_unpack_actions post_unpack' });

                var $BtnClose = $J('<div/>', { 'class': 'btn_grey_white_innerfade btn_medium booster_unpack_closebtn' });
                $BtnClose.append($J('<span/>').text('Close'));
                $PostUnpackActions.append($BtnClose);

                respValues.map((respData, idx) => {
                    if (respData.rgItems && respData.rgItems.length > 0) {
                        var $CardArea = $J('<div/>', { 'class': 'booster_unpack_cardarea cardarea' + (idx + 1) });
                        for (let i = 0; i < CARDS_PER_BOOSTER_PACK; i += 1) {
                            var item = respData.rgItems[i];
                            // if ( item.foil )
                            //     $PostUnpackActions.find('.foil_badge_progress').show();
                            var $Card = $J('<div/>', { 'class': 'booster_unpack_card card_front card' + (i + 1) });
                            var $Img = $J('<img/>', { 'class': 'booster_unpack_card_image', src: item.image });
                            var $CardTitle = $J('<div/>', { 'class': 'booster_unpack_card_title' }).text(item.name);
                            var $CardSeries = $J('<div/>', { 'class': 'booster_unpack_card_title' }).text('Series %s'.replace(/%s/, item.series));
                            $Card.append($Img, $CardTitle, $CardSeries);
                            $CardArea.append($Card);
                        }
                        $Content.append($CardArea);
                    }
                });

                $Content.append($PostUnpackActions);
                var Modal = ShowDialog('Unpacking booster pack', $Content, { bExplicitDismissalOnly: true });
                $BtnClose.click(function () { Modal.Dismiss(); });
                Modal.GetContent().find('.newmodal_close').fadeIn(500);
                Modal.SetDismissOnBackgroundClick(true);
                ReloadCommunityInventory();
            }).catch(reason => {
                console.log(reason);
                ShowAlertDialog('Unpacking booster pack', 'Sorry, there was a problem unpacking some booster pack.  It may have already been unpacked.  Please try again later.');
                ReloadCommunityInventory();
            });
        }
    });
    $J('body').on('click', '#Lnk_Cancel', function () {
        CancelSelectAll();
        $J('.item.selectedSell').removeClass('selectedSell');
        $J('.similar-item').removeClass('similar-item');
        return false;
    });
    $J('body').on('click', '.queue-item-remove', function () {
        var p = $J(this).parent('.queue-item-container');
        var rgItemOrg = p[0].rgItem;
        $J('#' + rgItemOrg.appid + '_' + rgItemOrg.contextid + '_' + p.data().id + '.selectedSell').removeClass('selectedSell');
        p.hide(100);
        var items = $J('.selectedSell');
        var itC = items.length;
        if (itC <= 0) {
            SellItemDialog.Dismiss();
            $J('#Lnk_ShowSellMulti').hide();
            $J('#Lnk_TurnIntoGems').hide();
            $J('#Lnk_SendGifts').hide();
            $J('#Lnk_Unpack').hide();
            return false;
        }

        var nextItem = items.has('span.price')[0] || items[0];
        var rgItem = nextItem.rgItem;
        g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
        g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
        $J('.queue-item-count span:last').html(itC);
        updateInfoWindow(rgItem);
        if ($J('#ck_autoadjust').prop('checked')) recalcPrice(rgItem);
        //   UpdateSellItem(rgItem);
        setTimeout(recalTotal, 200);
        $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
        return false;
    });

    // $J('body').on('click', '.queue-item-container', function () {
    //     const $item = $J(this);
    //     const rgItem = $item[0].rgItem;
    //     $J('#market_sell_dialog_error').hide();
    //     g_ActiveInventory.selectedItem = rgItem;
    //     // g_ActiveInventory.SelectItem(null, rgItem.element, rgItem);
    //     // g_ActiveInventory.EnsurePageActiveForItem(rgItem.element);
    //     updateInfoWindow(rgItem);
    //     recalcPrice(rgItem);
    //
    //     // Load price history
    //     $J('#pricehistory_container').show();
    //     $J('#pricehistory').hide();
    //     $J('#pricehistory_throbber').show();
    //     $J('#pricehistory_notavailable').hide();
    //     new Ajax.Request( 'http://steamcommunity.com/market/pricehistory/', {
    //         method: 'get',
    //         parameters: {
    //             appid: rgItem.appid,
    //             market_hash_name: GetMarketHashName( rgItem.description )
    //         },
    //         onSuccess: function( transport ) { SellItemDialog.OnPriceHistorySuccess( transport ); },
    //         onFailure: function( transport ) { SellItemDialog.OnPriceHistoryFailure( transport ); }
    //     });
    // });
};

var AddDialogHTML = function () {
    var dialog = '<div id="market_buyset_dialog" class="market_modal_dialog" style="display: none;">' +
        '<div class="market_dialog_title">' +
        '<span id="market_buyset_dialog_title" data-lang="buymissing">Buy missing parts</span>' +
        '<span class="market_dialog_cancel">' +
        '<a id="market_buyset_dialog_cancel" href="#" class="market_dialog_title_cancel">Cancel<span class="market_dialog_title_cancel_X">X</span></a>' +
        '</span>' +
        '</div>' +
        '<div class="market_dialog_contents">' +
        '<div class="market_dialog_content_frame">' +
        '<div class="market_dialog_content">' +
        '<div class="market_dialog_iteminfo">' +
        '<div id="lstParts" class="market_content_block market_home_listing_table market_home_main_listing_table market_listing_table"></div>' +
        '</div>' +
        '</div>' +
        '<div class="market_dialog_content_separator"></div>' +
        '<div class="market_dialog_content market_dialog_content_dark">' +
        '<div class="market_sell_dialog_input_area">' +
        //'<a id="market_buyset_dialog_accept" href="#" class="btn_green_white_innerfade btn_small_wide"><span>Buy missing parts</span></a>' +
        '<a id="market_buyset_dialog_reload" href="javascript:void(0);" class="btn_green_white_innerfade btn_small_wide"><span data-lang="tradingcards.reload">Reload list</span></a>' +
        '<div>&nbsp;<br /><br /></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    dialog += '<div id="hover" style="display: none; z-index: 1001">' +
        '<div class="shadow_ul"></div><div class="shadow_top"></div><div class="shadow_ur"></div><div class="shadow_left"></div><div class="shadow_right"></div><div class="shadow_bl"></div><div class="shadow_bottom"></div><div class="shadow_br"></div>		<div class="inventory_iteminfo hover_box shadow_content" id="iteminfo_clienthover">' +
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
    dialog += '<div id="market_getexp_dialog" class="market_modal_dialog" style="display: none;">' +
        '<div class="market_dialog_title">' +
        '<span id="market_getexp_dialog_title" data-lnag="">Generate custom button expression</span>' +
        '<span class="market_dialog_cancel">' +
        '<a id="market_getexp_dialog_cancel" href="#" class="market_dialog_title_cancel">Cancel<span class="market_dialog_title_cancel_X">X</span></a>' +
        '</span>' +
        '</div>' +
        '<div class="market_dialog_contents">' +
        '<div class="market_dialog_content_frame">' +
        '<div class="market_dialog_content">' +
        '<div>' +
        '<div class="tags-container"></div>' +
        '<div class="tag-textbox"><input type="text" style="width:100%" id="market_getexp_dialog_exptext" /></div>' +
        '</div>' +
        '</div>' +
        '<div class="market_dialog_content_separator"></div>' +
        '<div class="market_dialog_content market_dialog_content_dark">' +
        '<div class="market_sell_dialog_input_area">' +
        //'<a id="market_getexp_dialog_accept" href="#" class="btn_green_white_innerfade btn_small_wide"><span>Buy missing parts</span></a>' +
        '<a id="market_getexp_dialog_gen" href="#" class="btn_green_white_innerfade btn_small_wide"><span>Generate</span></a>' +
        '<div>&nbsp;<br /><br /></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    dialog += '<div id="market_grind_dialog" class="market_modal_dialog" style="display: none;">' +
        '<div class="market_dialog_title">' +
        '<span id="market_grind_dialog_title" data-lang="turngems">Turn into gems</span>' +
        '<span class="market_dialog_cancel">' +
        '<a id="market_grind_dialog_cancel" href="#" class="market_dialog_title_cancel">Cancel<span class="market_dialog_title_cancel_X">X</span></a>' +
        '</span>' +
        '</div>' +
        '<div class="market_dialog_contents">' +
        '<div class="market_dialog_content_frame">' +
        '<div class="market_dialog_content">' +
        '<div>' +
        '<div class="tags-container">Did you want to convert these items into Gems? It cannot be undone.</div>' +
        '</div>' +
        '</div>' +
        '<div class="market_dialog_content_separator"></div>' +
        '<div class="market_dialog_content market_dialog_content_dark">' +
        '<div class="market_sell_dialog_input_area">' +
        //'<a id="market_grind_dialog_accept" href="#" class="btn_green_white_innerfade btn_small_wide"><span>Buy missing parts</span></a>' +
        '<a id="market_grind_dialog_grind" href="#" class="btn_green_white_innerfade btn_small_wide"><span>OK</span></a>' +
        '<div>&nbsp;<br /><br /></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $J('body').append(dialog);
};

var CalculateSellingPrice = function (basePrice) {
    var calPrice = basePrice;
    if ($J('#cb_adtype').val() == '2') {
        var per = Math.round((basePrice * parseFloat($J('#Txt_adjust').val())) / 100);
        if (per == 0 && parseFloat($J('#Txt_adjust').val()) != 0) {
            per = (parseFloat($J('#Txt_adjust').val()) < 0 ? -1 : 1);
        }
        calPrice = basePrice + per;
    } else {
        calPrice = basePrice + Math.floor(parseFloat($J('#Txt_adjust').val()) * 100);
    }

    if (calPrice <= 0) calPrice = basePrice;
    return calPrice;
};

var ContinueListing = function () {
    if (!SellItemDialog.b_isInterupted) return;

    console.log('Resume listing');

    var firstItem = $J('.queue-item-container:has(>span.price):visible');
    if (firstItem.length == 0) return;
    var rgItem = firstItem[0].rgItem;
    SellItemDialog.b_isInterupted = false;

    if (!UpdateSellItem(rgItem)) return;

    if ($J('#ck_autoaccept').is(':checked')) {
        if ($J('#market_sell_dialog').is(':visible'))
            window.setTimeout('SellItemDialog.OnConfirmationAccept({stop:function(){}});', window.delaylistings);
    }
};

var SetupAcceptAllGifts = function () {
    if ($J('#tabcontent_pendinggifts .pending_gift').length == 0) return;
    var divCnt = $J('<div style="padding: 20px" />');
    var AcceptAllGifts = $J('<a href="#" class="btn_darkblue_white_innerfade btn_medium new_trade_offer_btn"><span>Add all to my Steam Gift Inventory</span></a>');// CreateMarketActionButton('yellow', '#', 'Add all to my Steam Gift Inventory');
    divCnt.append(AcceptAllGifts);

    $J(AcceptAllGifts).click(function (e) {
        e.preventDefault();
        var giftIds = [];
        $J('#tabcontent_pendinggifts .pending_gift > div[id^="pending_gift_"]').each(function () {
            var thisID = $J(this).attr('id');
            var giftID = thisID.substring(13);
            giftIds.push(giftID);
            ShowAcceptGiftOptions(giftID);
            DoAcceptGift(giftID, false);
        });
    });

    $J('#tabcontent_pendinggifts .pending_gifts_header').after(divCnt);
};

BuySetDialog = {
    m_bInitialized: false,
    m_oItemsToBuy: [],
    m_fnDocumentKeyHandler: null,

    Initialize: function () {
        //$('market_buyset_dialog_accept').observe('click', this.OnAccept.bindAsEventListener(this));
        $('market_buyset_dialog_cancel').observe('click', this.OnCancel.bindAsEventListener(this));
        $('market_buyset_dialog_reload').observe('click', this.OnReload.bindAsEventListener(this));

        var $marketBuysetDialog = $('market_buyset_dialog');
        $marketBuysetDialog.style.visibility = 'hidden';
        $marketBuysetDialog.show();
        // TODO: Slider
        $marketBuysetDialog.hide();
        $marketBuysetDialog.style.visibility = '';

        this.m_bInitialized = true;
    },

    Show: function (items) {
        if (!this.m_bInitialized)
            this.Initialize();
        if (items.length == 0) return;
        m_oItemsToBuy = items;
        this.m_fnDocumentKeyHandler = this.OnDocumentKeyPress.bindAsEventListener(this);
        $(document).observe('keydown', this.m_fnDocumentKeyHandler);
        showModal('market_buyset_dialog', true);
        this.OnReload({
            stop: function () { }
        });
    },

    OnCancel: function (event) {
        this.Dismiss();
        event.stop();
    },

    Dismiss: function () {
        $(document).stopObserving('keydown', this.m_fnDocumentKeyHandler);
        hideModal('market_buyset_dialog');
        if (this.m_modal)
            this.m_modal.Dismiss();
    },

    OnAccept: function (event) {
        event.stop();
    },

    OnReload: function (event) {
        event.stop();

        $J('#lstParts').html('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" class="loading" alt="Working...">');
        for (var i = 0; i < m_oItemsToBuy.length; i++) {
            var it = m_oItemsToBuy[i];
            //var li = $J('<div>');
            //li.html(it.name + ' (' + it.price + ')');
            //li[0].item = it;
            $J.ajax({
                method: 'GET',
                url: `${it.link}/render/?start=0&count=5&country=${g_rgWalletInfo.wallet_country}&language=${g_strLanguage}&currency=${g_rgWalletInfo.wallet_currency}`
            }).then(function (data) {
                $J('#lstParts').find('img.loading').remove();
                if (data.success) {
                    let itemDiv;
                    var listDiv = $J(`<div>${data.results_html}</div>`);
                    listDiv.find('.market_listing_row').each((idx, elem) => {
                        const lowest = $J(elem).find('span.market_listing_price_with_fee').text();
                        if (!/SOLD!/i.test(lowest)) {
                            itemDiv = $J(elem);
                            return false;
                        }
                    });
                    $J('#lstParts').append(itemDiv);
                    $J('#lstParts').find('.market_listing_table_header').remove();
                    itemDiv.find('a.item_market_action_button').each(function () {
                        var $row = $J(this).parents('.market_listing_row');
                        var match = buyingExp.exec($J(this).attr('href'));
                        if (match) {
                            $J(this).attr('href', 'javascript:void(0);');
                            // $J(this).find('.item_market_action_button_contents').html(SIHLang.quickbuy);
                            // AddItemHoverToElement(this, data.assets[match[2]][match[3]][match[4]]);
                            $J(this).click(function () {
                                $J(this).hide();
                                var obj = {
                                    listingid: match[1],
                                    appid: match[2],
                                    contextid: match[3],
                                    id: match[4]
                                };
                                var rgListing = data.listinginfo[obj.listingid]
                                var dat = {
                                    sessionid: g_sessionID,
                                    currency: g_rgWalletInfo.wallet_currency,
                                    subtotal: rgListing.converted_price,
                                    fee: rgListing.converted_fee,
                                    total: rgListing.converted_price + rgListing.converted_fee,
                                    quantity: 1
                                };

                                //var setLink = 'http://steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode + '&currency=' + g_rgWalletInfo['wallet_currency'] +
                                //    '&market_hash_name=' + data.assets[match[2]][match[3]][match[4]].market_hash_name;

                                //var itemLink = "http://steamcommunity.com/market/priceoverview/?appid=" + obj.appid + "&country=" + g_strCountryCode +
                                //    "&currency=" + g_rgWalletInfo['wallet_currency'] + "&market_hash_name=" + data.assets[match[2]][match[3]][match[4]].market_hash_name;
                                //console.log(cachePrices[setLink]);
                                //cachePrices[setLink].owned = true;
                                //return false;

                                $row.find('.market_listing_buy_button').append('<img src="' + window.location.protocol + '//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
                                $J.ajax({
                                    url: 'https://steamcommunity.com/market/buylisting/' + obj.listingid,
                                    type: 'POST',
                                    data: dat,
                                    crossDomain: true,
                                    xhrFields: { withCredentials: true }
                                }).done(function (data1) {
                                    if ($row.is(':visible')) {
                                        $row.find('.market_listing_buy_button').html('Success');
                                    } else {
                                        alert('Success');
                                    }
                                }).fail(function (jqxhr) {
                                    $row.find('.market_listing_buy_button img').remove();
                                    var data1 = $J.parseJSON(jqxhr.responseText);
                                    if (data1 && data1.message) {
                                        alert(data1.message);
                                    }
                                });
                                return false;
                            });
                        }
                    });
                }
            });
        }
        const divInfoBlock = $J('#market_buyset_dialog_reload').siblings('div');
        divInfoBlock.css('height', '32px');
        divInfoBlock.css('line-height', '32px');
        divInfoBlock.css('text-align', 'right');
        divInfoBlock.html(`Updated at: ${new Date().toLocaleTimeString()}<br><br>`);
    },

    OnDocumentKeyPress: function (event) {
        if (event.keyCode == Event.KEY_ESC) {
            this.Dismiss();
            event.stop();
        }
    }
};

GrindDialog = {
    m_bInitialized: false,
    m_bIsDismissed: true,
    m_fnDocumentKeyHandler: null,
    m_modal: null,
    m_elDialogContent: null,

    Initialize: function () {
        //$('market_grind_dialog_accept').observe('click', this.OnAccept.bindAsEventListener(this));
        $('market_grind_dialog_cancel').observe('click', this.OnCancel.bindAsEventListener(this));
        $('market_grind_dialog_grind').observe('click', this.OnGrind.bindAsEventListener(this));

        this.m_elDialogContent = $('market_grind_dialog');

        this.m_elDialogContent.style.visibility = 'hidden';
        this.m_elDialogContent.show();
        // TODO: Slider
        this.m_elDialogContent.hide();
        this.m_elDialogContent.style.visibility = '';

        this.m_bInitialized = true;
    },

    Show: function () {

        if (!this.m_bInitialized)
            this.Initialize();
        this.m_bIsDismissed = false;
        this.m_fnDocumentKeyHandler = this.OnDocumentKeyPress.bindAsEventListener(this);
        $(document).observe('keydown', this.m_fnDocumentKeyHandler);
        this.m_modal = new CModal($J(this.m_elDialogContent));
        this.m_modal.m_fnBackgroundClick = () => { if (this.m_modal.BIsActiveModal() && this.m_modal.m_bDismissOnBackgroundClick) { this.Dismiss(); } };
        this.m_modal.Show();
    },

    OnCancel: function (event) {
        this.Dismiss();
        event.stop();
    },

    Dismiss: function () {
        $(document).stopObserving('keydown', this.m_fnDocumentKeyHandler);
        //hideModal('market_grind_dialog');

        if (this.m_modal)
            this.m_modal.Dismiss();
        this.m_bIsDismissed = true;
        $J('div.queue-container').remove();
    },

    OnAccept: function (event) {
        event.stop();
    },

    OnGrind: function (event) {
        event.stop();
        GrindNextItem();
    },

    OnDocumentKeyPress: function (event) {
        if (event.keyCode == Event.KEY_ESC) {
            this.Dismiss();
            event.stop();
        }
    }
};

GenExpDialog = {
    m_bInitialized: false,
    m_oItem: null,
    m_fnDocumentKeyHandler: null,

    Initialize: function () {
        //$('market_getexp_dialog_accept').observe('click', this.OnAccept.bindAsEventListener(this));
        $('market_getexp_dialog_cancel').observe('click', this.OnCancel.bindAsEventListener(this));
        $('market_getexp_dialog_gen').observe('click', this.OnGenerate.bindAsEventListener(this));

        var $marketGetexpDialog = $('market_getexp_dialog');
        $marketGetexpDialog.style.visibility = 'hidden';
        $marketGetexpDialog.show();
        // TODO: Slider
        $marketGetexpDialog.hide();
        $marketGetexpDialog.style.visibility = '';
        $J('#market_getexp_dialog_exptext').click(function () {
            $J(this).select();
        });
        this.m_bInitialized = true;
    },

    Show: function (item) {
        if (!this.m_bInitialized)
            this.Initialize();
        if (!item) return;
        this.m_oItem = item;
        this.m_fnDocumentKeyHandler = this.OnDocumentKeyPress.bindAsEventListener(this);
        $(document).observe('keydown', this.m_fnDocumentKeyHandler);
        this.CreateList();
        showModal('market_getexp_dialog', true);
    },

    CreateList: function () {
        var container = $J('#market_getexp_dialog .tags-container');
        container.empty();
        for (var i = 0; i < this.m_oItem.length; i++) {
            var tag = this.m_oItem[i];
            var ck = $J('<input type="checkbox" checked="checked" id="ck_tag_' + tag.internal_name + '"/>');
            ck.data('exp', tag);
            container.append(ck);
            container.append(' ' + tag.localized_category_name + ': ' + tag.localized_tag_name + '<br />');
        }
        this.OnGenerate({
            stop: function () {
            }
        });
    },

    OnCancel: function (event) {
        this.Dismiss();
        event.stop();
    },

    Dismiss: function () {
        $(document).stopObserving('keydown', this.m_fnDocumentKeyHandler);
        hideModal('market_getexp_dialog');

        if (this.m_modal)
            this.m_modal.Dismiss();
    },

    OnGenerate: function (event) {
        event.stop();
        var container = $J('#market_getexp_dialog .tags-container');
        var exp = '';
        var cats = [];
        container.find('input[type=checkbox]').each(function () {
            if ($J(this).prop('checked')) {
                var tag = $J(this).data('exp');
                if (cats.indexOf(tag.category) >= 0) return;
                exp += ',"' + tag.category + '":"' + tag.internal_name + '"';
                cats.push(tag.category);
            }
        });
        if (exp.length > 0) exp = "{" + exp.substring(1) + "}";
        $J('#market_getexp_dialog_exptext').val(exp);
        $J('#market_getexp_dialog_exptext').select();

    },

    OnDocumentKeyPress: function (event) {
        if (event.keyCode == Event.KEY_ESC) {
            this.Dismiss();
            event.stop();
        }
    }
};

function hasExternalPricesAPI(appid) {
    return Object.keys(ExternalPrices).includes(appid.toString());
}

const updateInventoryProviders = () => {
    const providersCombobox = $J('#cb_provider');
    const allCurrentSources = ExternalPrices[g_ActiveInventory.appid].apis.map(it => it.name.toLowerCase());
    const providersData = window.PROVIDERS_LIST.filter(x => allCurrentSources.includes(x.id) && !['backpacktf', 'steam'].includes(x.id));
    providersCombobox.find('option').remove();
    providersData.forEach((it) => {
        providersCombobox.append(`<option value="${it.id}">${it.title}</option>`);
    });
    providersCombobox.val(ExternalPrices[g_ActiveInventory.appid].apis[0].name.toLowerCase());
};

if (IS_ENABLED_SIH) {
    setTimeout(function () {
        //INVENTORY_PAGE_ITEMS = 36;
        //INVENTORY_PAGE_WIDTH = 104 * 6
        sellcurrencyId = typeof (g_rgWalletInfo) !== 'undefined' && g_rgWalletInfo.success ? g_rgWalletInfo.wallet_currency : 1;
        currencyId = (typeof (window.currency) !== 'undefined' && window.currency !== '') ? window.currency : sellcurrencyId;

        var qs = function (key) {
            key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
            var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
            return match && decodeURIComponent(match[1].replace(/\+/g, " "));
        };
        $J('.inventory_page_right .hover_item_name').after('<h2 class="dd_price"></h2>');
        if (window.usevector) {
            $J('.inventory_page_right .hover_item_name').after('<a href="javascript:void(0)" id="lnk_Medium" style="clear:both; display: block">use this as vector</a>');
            var _mediumName = GetCookie('mediumname');
            var _mediumAppid = GetCookie('mediumappid');
            $J('#lnk_Medium').click(function () {
                SetCookie('mediumname', g_ActiveInventory.selectedItem.description.market_hash_name, 365 * 10, '/');
                SetCookie('mediumappid', g_ActiveInventory.selectedItem.appid, 365 * 10, '/');
                getMediumPrice(g_ActiveInventory.selectedItem.description);
                return false;
            });

            if (_mediumName && _mediumAppid) {
                getMediumPrice({ market_hash_name: _mediumName, appid: _mediumAppid });
            }
        }

        apiKey = window._apikey;

        $J('body').on('click', '.item', function (e) {
            getLowestPriceHandler();
            $J('.equiped').remove();
            $J('.review').remove();

            if (selectmode) {
                if (this.rgItem && (this.rgItem.description.marketable || this.rgItem.description.appid == 753)) {
                    $J(this).toggleClass('selectedSell');
                    $J('.similar-item').removeClass('similar-item');
                    var p_market_hash_name = this.rgItem.description.market_hash_name;
                    var iclassid = this.rgItem.classid;
                    var bselected = $J(this).hasClass('selectedSell');
                    if (e.ctrlKey) {
                        $J('.inventory_ctn:visible .inventory_page .item').each(function (i, el) {
                            if (this.rgItem.description.marketable && this.rgItem.classid == iclassid) {
                                if (bselected) {
                                    // g_ActiveInventory.LoadItemImage(this);
                                    $J(this).addClass('selectedSell');
                                } else {
                                    $J(this).removeClass('selectedSell');
                                }
                            }
                        });
                    } else if (bselected) {
                        $J('.inventory_ctn:visible .inventory_page .item').each(function (i, el) {
                            if (this.rgItem && this.rgItem.description && this.rgItem.description.market_hash_name == p_market_hash_name && this.rgItem.description.marketable) {
                                $J(this).addClass('similar-item');
                            }
                        });
                    }

                    if (e.shiftKey && lastSelectedItem) {
                        var lastContainer = $J(lastSelectedItem).parent('.itemHolder');
                        var itemsPage = lastContainer.parent('.inventory_page');
                        var idx1 = lastContainer.index(), idx2 = $J(this).parent('.itemHolder').index(),
                            pidx1 = itemsPage.index(), pidx2 = $J(this).parents('.inventory_page').index();

                        if ((pidx1 == pidx2 && idx1 > idx2) || (pidx2 < pidx1)) {
                            var tmp = idx1;
                            idx1 = idx2;
                            idx2 = tmp;
                        }
                        //console.log(pidx1 + '-' + idx1 + ' ' + pidx2 + '-' + idx2);
                        for (var pi = pidx1; pi <= pidx2; pi++) {
                            var filter = '.inventory_ctn:visible .inventory_page:eq(' + pi + ') .itemHolder';
                            if (pi == pidx1) {
                                filter += ':gt(' + idx1 + ')';

                                if (pi == pidx2) {
                                    filter += ':lt(' + (idx2 - idx1) + ')';
                                }
                            } else if (pi == pidx2) {
                                filter += ':lt(' + idx2 + ')';
                            }

                            $J(filter + '[style!="display: none;"] .item').each(function () {
                                if (this.rgItem && (this.rgItem.description.marketable || this.rgItem.description.appid == 753)) {
                                    $J(this).addClass('selectedSell');
                                }
                            });

                            //for (var i = idx1 + 1; i <= idx2; i++) {
                            //    itemsPage.find('.itemHolder:eq(' + i + ')[style!="display: none;"] .item ').addClass('selectedSell');
                            //}
                        }

                        if (itemsPage.is(':visible')) {

                        }
                    }

                    var itC = $J('.selectedSell').length;
                    if (itC > 0) {
                        $J('#Lnk_ShowSellMulti').html((itC > 1 ? SIHLang.sellnitem.replace('$1', itC) : SIHLang.sell1item));
                        $J('#Lnk_ShowSellMulti').show();
                        if (g_ActiveInventory.appid == 753) {
                            $J('#Lnk_TurnIntoGems').show();
                            $J('#Lnk_SendGifts').show();
                            $J('#Lnk_Unpack').show();
                        }
                    } else {
                        $J('#Lnk_ShowSellMulti').hide();
                        $J('#Lnk_TurnIntoGems').hide();
                        $J('#Lnk_SendGifts').hide();
                        $J('#Lnk_Unpack').hide();
                    }

                    lastSelectedItem = this;
                }
                return false;
            }
        });

        $J('body').on('click', '.floatbutton', function () {
            const $btn = $J(this);
            const $parent = $btn.parents('.descriptor');
            const $curItem = $J('.item.activeInfo');
            const rgItem = $curItem[0].rgItem;

            const updateFloatValue = function (data) {
                const itemOrigin = CSGO_ORIGINS.find(item => item.origin === data.iteminfo.origin);
                const floatValue = `
                    <div class="float_block received">
                        <div class="itemfloat">Float Value: <span>${data.iteminfo.floatvalue}</span></div>
                        <div class="itemseed">Paint Seed: <span>${data.iteminfo.paintseed}</span></div>
                        <div class="itemorigin">Origin: <span>${itemOrigin.name}</span></div>
                    <div>
                `;
                $parent.html(floatValue);
                rgItem.floatvalue = data.iteminfo.floatvalue;
                rgItem.paintseed = data.iteminfo.paintseed;
                rgItem.origin = data.iteminfo.origin;
                if (!$curItem.find('.float-value').length) {
                    $curItem.append(`<div class="float-value">Float: <strong>${data.iteminfo.floatvalue.toFixed(4)}</strong></div>`);
                }
            };

            if (!rgItem.floatvalue) {
                const actionLink = rgItem.description.actions[0].link
                    .replace('%owner_steamid%', g_ActiveUser.strSteamId)
                    .replace('%assetid%', rgItem.assetid);
                $btn.hide();
                $btn.siblings('.spinner').show();
                chrome.runtime.sendMessage(SIHID, { type: 'floatvalue', data: actionLink }, function (data) {
                    updateFloatValue(data)
                });
            } else {
                const { floatvalue, paintseed, origin } = rgItem;
                updateFloatValue({ iteminfo: { floatvalue, paintseed, origin } });
            }
        });

        $J('body').on('click', '#bt_quick_sell', function () {
            var itemsAmount = $J('.queue-item-container:visible').length;
            var currentItem = 0;
            var time = 200;

            function applyItem() {
                if (currentItem == itemsAmount) {
                    return;
                }

                document.getElementById('bt_quick_sell').innerText = 'Selling...';
                document.getElementById('market_sell_dialog_accept_ssa').checked = true;
                document.getElementById('ck_autoaccept').click();
                document.getElementById('ck_autoaccept').checked = true;
                document.getElementById('ck_autoadjust').click();
                document.getElementById('ck_autoadjust').checked = true;
                document.getElementById('market_sell_dialog_accept').click();
                document.getElementById('market_sell_dialog_ok').click();
            }

            applyItem();
            return false;
        });

        $J('#inventory_load_error_ctn').before(`
            <div id="sih-inventory-panel">
                <div class="row">
                    <div id="optionalPanel">
                        <button id="Lnk_Reload" class="icon-refresh"></button>
                        <div id="Lnk_SortItems" class="dropdown">
                            <div class="dropbtn">
                                <div class="sortType asc" data-title="${SIHLang.sort.price}" data-category="price"></div>
                                <div class="caret"></div>
                            </div>
                            <div id="sort-types-content" class="dropdown-content">
                                <a href="javascript:void(0);" id="price" data-category="price">${SIHLang.sort.price}</a>
                                <a href="javascript:void(0);" id="float" data-category="float">${SIHLang.sort.float}</a>
                                <a href="javascript:void(0);" id="name" data-category="name">${SIHLang.sort.name}</a>
                            </div>
                        </div>
                        <button onclick="GetFloatValues();" id="Bt_GetFloat">${SIHLang.market.getfloat}</button>
                    </div>
                    <div id="pricesPanel">
                        <div id="steamPrice">Steam price: <span class="priceValue">----</span></div>
                        <div id="providerPrice">
                            <select id="cb_provider" class="priceProvider"></select>: <span class="priceValue">----</span>
                        </div>
                        <button id="invValue">${SIHLang.inventvalue}</button>
                    </div>
                </div>
                <div class="row">
                    <div id="selectPanel">
                        <button id="Lnk_Sellmulti">${SIHLang.selectitem}</button>
                        <button id="Lnk_Sellall">${SIHLang.selectall}</button>
                        <button id="Lnk_Cancel" style="display: none;">${SIHLang.cancel}</button>
                    </div>
                    <div id="tradePanel">
                        <button id="Lnk_TurnIntoGems" style="display:none;">${SIHLang.turngems || 'Turn into gems'}</button>
                        <button id="Lnk_SendGifts" style="display:none;">${SIHLang.sendgifts || 'Send gifts'}</button>
                        <button id="Lnk_Unpack" style="display:none;">${SIHLang.unpack || 'Unpack Boosterpack'}</button>
                        <button id="Lnk_ShowSellMulti" style="display:none;">${SIHLang.sell1item}</button>
                    </div>
                </div>
            </div>
        `);

        if (hasExternalPricesAPI(g_ActiveInventory.appid)) {
          $J.getJSON(`chrome-extension://${window.SIHID}/assets/json/providers.json`, (dataList) => {
            window.PROVIDERS_LIST = dataList;
            updateInventoryProviders();
          });
        }

        if (!g_bViewingOwnProfile) $J('#sih-inventory-panel .row:last').remove();

        $J('.games_list_tab').click(() => {
            $J('#pricesPanel').toggle(window.inventoryprice && hasExternalPricesAPI(g_ActiveInventory.appid));
            if (hasExternalPricesAPI(g_ActiveInventory.appid)) {
                updateInventoryProviders();
                $J('#Lnk_SortItems').show();
                g_ActiveInventory.LoadCompleteInventory();
            } else {
                $J('#Lnk_SortItems').hide();
            }

            $J('#Bt_GetFloat, #sort-types-content #float').toggle(g_ActiveInventory.appid == 730);
            $J('#steamPrice').toggle([730, 578080, 570, 753].includes(parseInt(g_ActiveInventory.appid, 10)));
        });

        $J('#Bt_GetFloat, #sort-types-content #float').toggle(g_ActiveInventory.appid == 730);
        $J('#steamPrice').toggle([730, 578080, 570, 753].includes(parseInt(g_ActiveInventory.appid, 10)));
        $J('#pricesPanel').toggle(window.inventoryprice && hasExternalPricesAPI(g_ActiveInventory.appid));
        $J('#Lnk_SortItems').toggle(hasExternalPricesAPI(g_ActiveInventory.appid));

        $J('#Lnk_Reload').click(function () {
            var { selectedItem: { appid, contextid }, m_owner } = g_ActiveInventory;
            m_owner.ReloadInventory(appid, contextid);
            cachePrices = {};
            selectmode = false;
            $J('#Lnk_Cancel').hide();
            $J('#Lnk_ShowSellMulti').hide();
            $J('#Lnk_TurnIntoGems').hide();
            $J('#Lnk_SendGifts').hide();
            $J('#Lnk_Unpack').hide();
            SellItemDialog.OnFailure = SellItemDialog.orgOnFailure;
            $J('.item.selectedSell').removeClass('selectedSell');
            $J('.similar-item').removeClass('similar-item');

            SetupExternalDropdown(appid);

            return false;
        });

        $J('#sih-inventory-panel .dropbtn .caret').click(() => {
            $J('#sih-inventory-panel #sort-types-content').toggleClass('show');
        });
        $J('#sih-inventory-panel .dropbtn .sortType').click((e) => {
            const { currentTarget } = e;
            const cat = $J(currentTarget).attr('data-category');
            const isAsc = $J(currentTarget).hasClass('asc');
            $J(currentTarget).toggleClass('asc');
            $J(currentTarget).toggleClass('desc');
            SortItem(!isAsc, cat);
        });
        $J('#sih-inventory-panel #sort-types-content').on('click', 'a', (e) => {
            const { currentTarget } = e;
            const cat = $J(currentTarget).attr('data-category');
            const title = $J(currentTarget).text();
            $J('#sih-inventory-panel .sortType').attr('data-title', title).attr('data-category', cat);
            const isAsc = $J('#sih-inventory-panel .dropbtn .sortType').hasClass('asc');
            SortItem(isAsc, cat);
            $J('#sih-inventory-panel #sort-types-content').toggleClass('show');
        });

        // Close the dropdown menu if the user clicks outside of it
        window.onclick = (event) => {
            if (!event.target.matches('.dropdown .caret')) {
                $J('.dropdown-content').removeClass('show');
            }
        }

        //var btSellSelected = '<a class="item_market_action_button item_market_action_button_green" href="javascript:void();" id="btSellSelected"><span class="item_market_action_button_edge item_market_action_button_left"></span><span class="item_market_action_button_contents">Sell selected items</span><span class="item_market_action_button_edge item_market_action_button_right"></span><span class="item_market_action_button_preload"></span></a>'
        //$J('.item_market_actions').append(btSellSelected);
        if (g_bViewingOwnProfile) {
            ModifySellingFunctions();
            ModifyMarketActions();
        }

        ModifyDescriptionFunction();
        AddDialogHTML();
        // ModifyItemDisplay();
        SetupAcceptAllGifts();

        if (window.extprice) {
            var divRight = $J(`
              <div class="sih-functions-panel">
                <div style="display: flex; align-items: center;">
                  <button id="cb_ExternalPrices">${SIHLang.showpriceproviders}</button>
                  <div class="spinner" style="display: none; margin-left: 5px; width: 16px; height: 16px; background: url(//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif) no-repeat; background-size: 16px;"></div>
                </div>
                <div id="provider_list"></div>
              </div>
            `);

            divRight.find('#cb_ExternalPrices').click((e) => {
                const { currentTarget } = e;
                const providersList = $J('.sih-functions-panel').find('#provider_list');
                providersList.toggleClass('show');
                if (providersList.hasClass('show')) $J(currentTarget).text(SIHLang.hidepriceproviders);
                else $J(currentTarget).text(SIHLang.showpriceproviders);
            });

            $J('#inventory_pagecontrols').after(divRight);
            if (g_ActiveInventory && g_ActiveInventory.appid) {
                SetupExternalDropdown(g_ActiveInventory.appid);
            }

            // watch for incoming # urls
            $J(window).on('hashchange', function () {
                OnLocationChange(null, window.location.hash);
                SetupExternalDropdown(g_ActiveInventory.appid);
            });
        }

        var inventoryLink = $J('.whiteLink').attr('href').split(':')[1];
        if (window.inventoryprice) {

            $J('.games_list_tab').on('click', function () {
                $J('#steamPrice, #providerPrice').find('.priceValue').text('----');
            });

            $J('body').on('click', '#invValue', function () {
                const $total = $J('#steamPrice .priceValue');
                const inventar = $J('div[id^="inventory_"]:visible');
                $J('#steamPrice, #providerPrice').find('.priceValue').text(`${SIHLang.loading || ''}`);
                if ([730, 578080, 570, 753].includes(parseInt(g_ActiveInventory.appid, 10))) {
                    const items = [];
                    inventar.find('div.item').each((idx, elem) => {
                        items.push(GetMarketHashName(elem.rgItem.description));
                    });
                    window.chrome.runtime.sendMessage(SIHID, {
                        type: 'GET_EXTERNAL_PRICES', data: { appid: g_ActiveInventory.appid, market: 'steam', currency: currencyId }
                    }, (res) => {
                        if (res.success) {
                            const crate = ExchangeRates.GetCurrentRate();
                            const sum = g_ActiveInventory.appid == 753
                              ? items.reduce((acc, x) => (acc += (res.prices[x] || 0) * crate * 100), 0)
                              : items.reduce((acc, x) => (acc += getPriceAsInt(res.prices[x])), 0);
                            $total.text(v_currencyformat(sum, GetCurrencyCode(currencyId)));
                        } else {
                            inventoryPrice = 0;
                            $total.text("Error! Sorry :'(");
                        }
                    });
                    // chrome.runtime.sendMessage(SIHID, { type: 'GetInventoryValue', data: g_ActiveUser.strSteamId }, function (resp) {
                    //     if (resp.success) {
                    //         $total.text(ExchangeRates.Format(resp.value));
                    //     } else {
                    //         inventoryPrice = 0;
                    //         $total.text("Error! Sorry :'(");
                    //     }
                    // });
                }

                setTimeout(function () {
                    inventoryPrice = 0;
                    GetAllInventoryPrice(inventar);
                }, 1000);

                return false;
            });
        }
        if (window.tradableinfo) {
            $J('body').on('click', '#tradable-msg-holder .hide-msg', function () {
                $J(this).parent().remove();
            });
            showNonTradableItems();
        }
        if (window.simplyinvent) {
            ModifyGamesTabs();
        }
        if (window.gpdelayscc) {
            PriceQueue._successDelay = window.gpdelayscc;
        }
        if (window.gpdelayerr) {
            PriceQueue._failureDelay = window.gpdelayerr;
        }

        ReloadLang();
    }, 100);
}

const floatQueue = [];
const GetFloat = (link) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(SIHID, { type: 'floatvalue', data: link }, (respData) => {
            if (respData && respData.success) {
                resolve(respData);
            } else {
                reject(respData);
            }
        });
    });
};

const processFloatQueue = () => {
    if (!floatQueue.length) return null;

    const { id, element, link } = floatQueue.shift();
    const $curItem = $J(element);

    GetFloat(link)
        .then((data) => {
            if (!$curItem.find('.float-value').length) {
                const { rgItem } = $curItem[0];
                rgItem.floatvalue = data.iteminfo.floatvalue;
                rgItem.paintseed = data.iteminfo.paintseed;
                rgItem.origin = data.iteminfo.origin;
                $curItem.append(`<div class="float-value">Float: <strong>${data.iteminfo.floatvalue.toFixed(4)}</strong></div>`);
            }
            processFloatQueue();
        })
        .catch((err) => {
            processFloatQueue();
        });
};

const GetFloatValues = () => {
    $J('div.item.app730').each((idx, elem) => {
        const { element, assetid, appid, description: { actions, tags } } = elem.rgItem;
        const isWeapon = tags.find(x => x.category.toUpperCase() === 'WEAPON');
        if (isWeapon && actions !== undefined) {
            const action = actions[0];
            const actionLink = action.link.replace('%assetid%', assetid).replace('%owner_steamid%', g_ActiveUser.strSteamId);
            floatQueue.push({ assetid, element, link: actionLink });
        }
    });
    processFloatQueue();
};

var SetupExternalDropdown = function (appid) {
    // $J('#cb_ExternalPrices').empty();
    if (ExternalPrices[appid]) {
        let favSource = GetCookie(`extproviders_${appid}`);
        if (favSource != null) favSource = favSource.split(',');
        else favSource = ['csgofast', 'opskins', 'backpacktf'];

        let curSources = [];
        const allCurrentSources = ExternalPrices[appid].apis.map(it => it.name.toLowerCase());
        const filteredSources = allCurrentSources.filter(it => favSource.includes(it));
        curSources = allCurrentSources.length > 1 ? filteredSources : allCurrentSources;

        var rgDeferreds = g_ActiveInventory.LoadCompleteInventory().done(function () {
            for (var i = 0; i < g_ActiveInventory.m_cPages; i++) {
                g_ActiveInventory.EnsurePageItemsCreated(i);
            }
        });

        $J('.sih-functions-panel').show();
        const providersList = $J('#provider_list');
        providersList.find('.provider-item').remove();

        let cnt = 0;
        $J.each(ExternalPrices[appid].apis, (idx, elem) => {
            const it = window.PROVIDERS_LIST.find(x => x.id === elem.name.toLowerCase());
            const $item = $J(`
                <div class="provider-item" style="color: ${it.color};">
                    <input type="checkbox" id="${it.id}">
                    <label class="provider ${it.id}" for="${it.id}" data-title="${it.title}"></label>
                </div>
            `);
            $item.on('change', `#${it.id}`, (e) => {
                const { currentTarget: { id, checked } } = e;
                if (!checked) $J(`.price_flag.${id}`).remove();
                else {
                    $J('.sih-functions-panel .spinner').show();
                    const source = ExternalPrices[appid].apis.find(x => x.name.toLowerCase() === id);
                    source.api.GetPrices(appid, { market: id }, false);
                }
                favSource = providersList.find('input:checked').map((idx, x) => x.id).toArray();
                SetCookie(`extproviders_${appid}`, favSource, 365, 'inventory');
            });

            if (elem.api && elem.api.GetPrices && curSources.includes(it.id)) {
                cnt += 1;
                elem.api.GetPrices(appid, { market: elem.name }, cnt === curSources.length);
                $item.find(`#${it.id}`).prop('checked', true);
                $J('.sih-functions-panel .spinner').show();
            }
            providersList.append($item);
        });
    } else {
      $J('#provider_list .provider-item').remove();
      $J('.sih-functions-panel').hide();
    }
};

var CancelSelectAll = function () {
    $J('#Lnk_ShowSellMulti').hide();
    $J('#Lnk_TurnIntoGems').hide();
    $J('#Lnk_SendGifts').hide();
    $J('#Lnk_Unpack').hide();

    var items = $J(g_ActiveInventory.getInventoryElement()).find('div.item.selectedSell');
    items.each(function (idx, elem) {
        $J(elem).removeClass('similar-item').removeClass('selectedSell');
    });

    selectmode = false;
    SellItemDialog.OnFailure = SellItemDialog.orgOnFailure;
    $J('#Lnk_Cancel').hide();
};

var GetAllInventoryPrice = function (inventar) {
    const items = [];
    let appid;
    inventar.find('div.item').each(function () {
        if (this.rgItem.appid == 753 && this.rgItem.contextid == 3) return;
        appid = this.rgItem.appid;
        if (appid == 753) {
          //only for tarding cards
          const marketFeeApp = this.rgItem.description.market_fee_app;
          const card = this.rgItem.description.tags.find(x => x.category === 'cardborder');
          if (card === undefined) return;
          const isFoil = card.internal_name === 'cardborder_1' ? true : false;
          items.push({ marketFeeApp, isFoil });
        } else {
          const { description: { market_hash_name } } = this.rgItem;
          items.push(market_hash_name);
        }


        // var dataEconomyItem = $J(this).attr('id').split('_');
        // dataEconomyItem.push(UserYou.strSteamId);
        // var strURL = null, appId = dataEconomyItem[0];

        // if (dataEconomyItem.length == 3 || dataEconomyItem.length == 4) {
        //     if (appId == 'classinfo') {
        //         var classId = dataEconomyItem[2];
        //         var instanceId = (dataEconomyItem.length > 3 ? dataEconomyItem[3] : 0);

        //         appId = dataEconomyItem[1];
        //         strURL = 'economy/itemclasshover/' + appId + '/' + classId + '/' + instanceId + '?content_only=1&l=english';
        //     } else {
        //         var contextId = dataEconomyItem[1];
        //         var assetId = dataEconomyItem[2];
        //         var currentItem = cacheItems[appId + '/' + contextId + '/' + assetId];

        //         if (currentItem != null && currentItem.lowest_price !== undefined) {
        //             var price = currentItem.lowest_price.replace(',', '.').split(' ');
        //             inventoryPrice += parseFloat(price[0]);
        //             $J('#providerPrice .priceValue').text(inventoryPrice.toFixed(2) + ' ' + price[1]);
        //             return true;
        //         }

        //         strURL = 'economy/itemhover/' + appId + '/' + contextId + '/' + assetId + '?content_only=1&omit_owner=1&l=english';
        //         if (dataEconomyItem.length == 4 && dataEconomyItem[3]) {
        //             var strOwner = dataEconomyItem[3];
        //             strURL += (strOwner.indexOf('id:') == 0) ? '&o_url=' + strOwner.substr(3) : '&o=' + strOwner;
        //         }
        //     }

        //     RequestCacher.get({
        //         url: window.location.protocol + '//steamcommunity.com/' + strURL,
        //         cache: true
        //     }).then(function (data) {
        //         var match = itemRegExp.exec(data);
        //         if (match) {
        //             eval(match[0].replace('BuildHover', 'CheckItem'));
        //         }
        //     });
        // }
    });

    const ccode = GetCurrencyCode(currencyId);
    const providerCode = $J('#cb_provider').val();
    window.chrome.runtime.sendMessage(SIHID, {
        type: 'GetInventoryValue',
        data: { appid, ccode, items, providerCode }
    }, (res) => {
        if (res.success) {
          $J('#providerPrice .priceValue').text(
            providerCode === 'steamlvlupgems'
              ? `${res.amount} gems`
              : v_currencyformat(Math.round(res.amount * 100), ccode)
          );
        } else $J('#providerPrice .priceValue').text("Error! Sorry :'(");
    });
};

var CheckItem = function (prefix, item, owner) {
    var cacheId = item.appid + '/' + item.contextid + '/' + item.id;
    var sItem = item || g_ActiveInventory.selectedItem.description;

    if (sItem.appid == 753 && sItem.actions && sItem.actions[0].link && sItem.actions[0].link.startsWith('http://store.steampowered.com/app/')) {
        return;
    }

    if (!sItem.market_hash_name) {
        sItem.market_hash_name = sItem.name;
    }

    var itemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=' + sItem.appid
        + '&country=' + g_strCountryCode
        + '&currency=' + currencyId
        + '&market_hash_name=' + encodeURIComponent(sItem.market_hash_name);

    RequestCacher.get({
        type: 'GET',
        url: itemLink
    }).then((response) => {
        if (response.success) {
            cacheItems[cacheId] = response;
            if (response.lowest_price) {
                var lowest_price = response.lowest_price.replace(',', '.').split(' ');
                var price = getPriceAsInt(response.lowest_price);
                if (!isNaN(price)) {
                    inventoryPrice += price;
                    var formatPrice = v_currencyformat(inventoryPrice * 100, GetCurrencyCode(g_rgWalletInfo.wallet_currency));
                    $J('#providerPrice .priceValue').text(formatPrice);
                }
            }
        }
    });
};

function showNonTradableItems() {
    $J('body').append('<div id="tradable-msg-holder">Loading...</div>');

    var nonTradableCounter = 0;
    var tradableDates = [];
    var assets = [];
    var gameData = getUserGames();
    var counter = 0;
    var dataSize = gameData.length;

    function getGameInfo() {
        if (counter >= dataSize) return;

        RequestCacher.get({
            // method: 'GET',
            url: `${location.origin}${location.pathname}json/${gameData[counter].id}/${gameData[counter].param}`
        }).then(function (res) {
            if (res.success) {
                var items = res.rgDescriptions;
                for (var i in items) {
                    if (!items[i].tradable && items[i].cache_expiration !== undefined) {
                        var tradableDate = new Date(items[i].cache_expiration).getTime();
                        var time = Math.floor(tradableDate / 1000);
                        Object.keys(res.rgInventory).forEach(itemID => {
                            const invItem = res.rgInventory[itemID];
                            if (`${invItem.classid}_${invItem.instanceid}` === i) {
                                nonTradableCounter += 1;
                                assets.push({
                                    appid: items[i].appid,
                                    name: (items[i].market_hash_name || items[i].market_name || items[i].name)
                                });
                            }
                        });
                        tradableDates.push(parseInt(time));
                    }
                }
            }

            if (++counter === dataSize) {
                if (nonTradableCounter) {
                    tradableDates.sort();
                    $J('#tradable-msg-holder').html(makeItemsInfoMessage(nonTradableCounter, tradableDates[0], tradableDates[tradableDates.length - 1]));
                    getNonTradableItemsPrice(assets);
                } else {
                    $J('#tradable-msg-holder').text('All items are tradable.');
                    setTimeout(function () {
                        $J('#tradable-msg-holder').remove();
                    }, 5000);
                }
            } else {
                getGameInfo();
            }
        }).catch((e) => { console.error(e); getGameInfo(); });
    }
    getGameInfo();
}

function getUserGames() {
    var apps = [730, 570, 440], data = [];

    $J('.games_list_tab').each(function () {
        var gameId = this.getAttribute('href').substr(1);
        var param = (apps.indexOf(parseInt(gameId)) !== -1) ? 2 : 1;
        data.push({ id: gameId, param: param });
    });

    return data;
}

function getNonTradableItemsPrice(assets) {
    PriceQueue._successDelay = 600;
    var totalPrice = 0;
    var size = assets.length;

    for (var i = 0; i < size; ++i) {
        var itemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=' + assets[i].appid
            + '&country=' + g_strCountryCode
            + '&currency=' + currencyId
            + '&market_hash_name=' + encodeURIComponent(assets[i].name);

        PriceQueue.GetPrice({
            method: 'get',
            // RequestCacher.get({
            url: itemLink,
            success: function (res) {
                if (res.success && res.lowest_price) {
                    totalPrice += getPriceAsInt(res.lowest_price);
                    var formatPrice = v_currencyformat(totalPrice * 100, GetCurrencyCode(g_rgWalletInfo.wallet_currency));
                    $J('#tradable-msg-holder .non-tradable-total').text(formatPrice);
                }
            },
            error: function () { }
            // }).catch();
        });
    }
}

function makeItemsInfoMessage(count, timeStart, timeEnd) {
    return `<span class="msg">${count} ${SIHLang.nontradable.counter}.
        <br/>${SIHLang.nontradable.startdate}: ${timeStart ? formatDate(timeStart) : 'UNKNOWN'}.
        <br/>${SIHLang.nontradable.lastdate}: ${timeEnd ? formatDate(timeEnd) : 'UNKNOWN'}.
        <br/>${SIHLang.nontradable.totalprice}: <span class="non-tradable-total"></span></span>
        <span class="hide-msg">x</span>`;
}

function findDate(str) {
    var time = 0;
    try {
        if (str.toLowerCase().indexOf('tradable after') !== -1) {
            var value = str.replace(taradableStrExp, '');
            if (value.indexOf('[date]') !== -1) {
                time = /\d+/.exec(value)[0];
            } else {
                var tradableDate = new Date(value).getTime();
                time = Math.floor(tradableDate / 1000);
            }
        }
    } catch (err) { }
    return time;
}
