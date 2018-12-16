const expMarketHashName = /market_hash_name=([^&]+)/;
const expCountryCode = /country=([^&]+)/;
const expCurrencyID = /currency=([^&]+)/;
const expAppID = /appid=([^&]+)/;

if (!window.SIHID) window.SIHID = 'cmeakgjggjdlcpncigglobpjbkabhmjl';

var tf2Quality;
$J.getJSON(`chrome-extension://${window.SIHID}/assets/json/tf2_quality.json`, function (data) {
    tf2Quality = data;
});

var PriceQueue = {
    _currentURL: '',
    _numberOfErrors: 0,
    _currentError: 0,
    _isRunning: false,
    _isInit: false,
    _successDelay: 2500,
    _failureDelay: 5000,
    _queue: {},
    _urls: [],
    _cache: {},
    _currentproviderIdx: 0,

    _rebuildURL: function (url) {
        var _appid = expAppID.exec(url)[1];
        var _countryCode = expCountryCode.exec(url)[1];
        var _currencyID = expCurrencyID.exec(url)[1];
        var _marketHashName = expMarketHashName.exec(url)[1];

        if (!_currencyID || _currencyID == 'undefined' || isNaN(parseInt(_currencyID))) {
            _currencyID = 1;
        }
        url = 'appid=' + _appid + '&country=' + _countryCode + '&currency=' + _currencyID + '&market_hash_name=' + _marketHashName;
        return url;
    },
    GetPrice: function (options) {
        if (!PriceQueue._isInit) {
            PriceQueue.Init();
        }

        options.url = PriceQueue._rebuildURL(options.url);

        if (PriceQueue._cache[options.url]) {
            var cache = PriceQueue._cache[options.url];
            options.success(cache.response, options.pars);
        } else {
            if (!PriceQueue._queue[options.url]) {
                PriceQueue._queue[options.url] = { url: options.url, handlers: [], pars: [] };
                if (options.insert) {
                    PriceQueue._urls.unshift(options.url);
                } else {
                    PriceQueue._urls.push(options.url);
                }
            }
            PriceQueue._queue[options.url].handlers.push(options.success);
            PriceQueue._queue[options.url].pars.push(options.pars || null);
            PriceQueue.StartQueue();
            PriceQueue.UpdateLabels();
        }
    },
    PricesProviders: [{
        name: 'SteamOverviewPrice',
        getprice: function (appid, countryCode, currencyId, market_hash_name) {
            var cacheURL = 'appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;
            var url = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;

            $J.ajax({
                method: "GET",
                url,
                cacheURL,
                success: function (response, textStatus, jqXHR) {
                    PriceQueue._generalHandler.success(response, this.cacheURL, 'SteamOverviewPrice');
                },
                error: PriceQueue._generalHandler.error,
                complete: PriceQueue._generalHandler.complete
            });
        }
    }, {
        name: 'SteamListingPrice',
        getprice: function (appid, countryCode, currencyId, market_hash_name) {
            var cacheURL = 'appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;
            var url = window.location.protocol + '//steamcommunity.com/market/listings/' + appid + '/' + market_hash_name + '/render/?start=0&count=5&country=' + countryCode + '&language=english&currency=' + currencyId;

            $J.ajax({
                method: "GET",
                url: url,
                cacheURL: cacheURL,
                success: function (response, textStatus, jqXHR) {
                    if (response && response.success && response.listinginfo) {
                        var pprice1, pprice2;
                        var $html = $J(response.results_html);
                        var $priceBlock = $html.find('.market_table_value');
                        var $curItem;
                        $priceBlock.each(function (idx, elem) {
                            var lowest = $J(elem).find('span.market_listing_price_with_fee').text();
                            if (!/SOLD!/i.test(lowest)) {
                                $curItem = $J(elem);
                                pprice1 = $curItem.find('span.market_listing_price_with_fee').text();
                                pprice2 = $curItem.find('span.market_listing_price_without_fee').text();
                                return false;
                            } else {
                                console.log('SOLD', elem);
                            }
                        });

                        var _response = { success: true };
                        if (response.total_count > 1) {
                            _response.volume = response.total_count;
                        }
                        if (pprice1 && pprice1.length > 1) {
                            _response.lowest_price = pprice1.trim();
                        }
                        if (pprice2 && pprice2.length > 1) {
                            _response.median_price = pprice2.trim();
                        }

                        if (pprice1 === undefined) {
                            PriceQueue._generalHandler.error();
                        } else {
                            PriceQueue._generalHandler.success(_response, this.cacheURL, 'SteamListingPrice');
                        }
                    } else {
                        PriceQueue._generalHandler.error(true);
                    }
                },
                error: PriceQueue._generalHandler.error,
                complete: PriceQueue._generalHandler.complete
            });
        }
    }, {
        name: 'SihPriceOverview',
        getprice: function (appid, countryCode, currencyId, market_hash_name) {
            var cacheURL = 'appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;

            const data = {
                appid,
                market_hash_name: decodeURIComponent(market_hash_name),
                country: countryCode,
                currency: currencyId
            };
            chrome.runtime.sendMessage(SIHID, { type: 'GET_STEAM_PRICES', data }, (res) => {
                if (res && res.success) {
                    PriceQueue._generalHandler.success(res, cacheURL, 'SihPriceOverview');
                } else {
                    PriceQueue._generalHandler.error(res);
                }
                PriceQueue._generalHandler.complete();
            });
        }
    }],
    StartQueue: function () {
        if (PriceQueue._isRunning) return;

        PriceQueue._isRunning = true;
        PriceQueue._currentURL = PriceQueue._urls.shift();
        if (PriceQueue._currentURL !== undefined) {
            var appid = expAppID.exec(PriceQueue._currentURL)[1];
            var countryCode = expCountryCode.exec(PriceQueue._currentURL)[1];
            var currencyID = expCurrencyID.exec(PriceQueue._currentURL)[1];
            var marketHashName = expMarketHashName.exec(PriceQueue._currentURL)[1];

            PriceQueue.PricesProviders[PriceQueue._currentproviderIdx].getprice(appid, countryCode, currencyID, marketHashName);
        } else {
            PriceQueue._currentError = 0;
            PriceQueue._isRunning = false;
            PriceQueue._generalHandler.complete();
        }
    },
    UpdateHandler: function () { },
    UpdateLabels: function () {
        if (PriceQueue._urls.length == 0) {
            $J('#_priceQueueCont').hide();
        } else {
            $J('#_priceQueueCont').show();
            var hashname = '';
            var m = /market_hash_name=([^&]+)/.exec(PriceQueue._currentURL);
            if (m && m.length > 1) {
                hashname = decodeURI(m[1]);
            }
            $J('#_priceQueueCont .pq-info').html(hashname + '<br />' + PriceQueue._urls.length + ' items remain - ' + PriceQueue._currentError + ' errors');
        }
    },
    GenPriceDescription: function (rgItems) {
        if (!rgItems || !rgItems.descriptions || !rgItems.lowestPrice) {
            return;
        }
        for (var i = 0; i < rgItems.descriptions.length; i++) {
            var des = rgItems.descriptions[i];
            if (des.isprice) {
                return;
            }
        }
        var priceProvider = rgItems.providerName || 'Lowest price';
        var marketLink = `${window.location.protocol}//steamcommunity.com/market/listings/${rgItems.appid}/${encodeURIComponent(rgItems.market_hash_name)}`;

        var ddHtml = `${SIHLang.steamprice}: <a href="${marketLink}" target="_blank" style="color:#FF0" title="${rgItems.nofeePrice}">${rgItems.lowestPrice}`;
        if (rgItems.volume) {
            ddHtml += ` <span style="font-size: 0.9em; font-style: italic">(${rgItems.volume} ${SIHLang.sold24h})</span>`;
        }

        if (mediumPrice && rgItems.market_hash_name !== mediumName) {
            var price = getPriceAsInt(rgItems.lowestPrice),
                mprice = getPriceAsInt(mediumPrice),
                eq = (price / mprice).toFixed(2);

            ddHtml += ' (' + eq + ' ' + mediumName + ')';
        }

        var pdes = {
            isprice: true,
            type: 'html',
            value: ddHtml
        };

        rgItems.descriptions.unshift(pdes);
    },
    _generalHandler: {
        success: function (response, url, providerName) {
            PriceQueue._numberOfErrors = 0;
            const { lowest_price, median_price, volume } = response;
            const appid = expAppID.exec(url)[1];
            if (providerName !== 'SihPriceOverview' && ExternalPrices[appid] !== undefined && lowest_price !== undefined) {
                chrome.runtime.sendMessage(SIHID, { type: 'SET_STEAM_PRICE', data: { url, body: { lowest_price, median_price, volume } } }, (e) => { });
            }

            response.providerName = providerName;
            PriceQueue._cache[url] = { response: response, providerName: providerName };

            if (PriceQueue._queue[url]) {
                var handlers = PriceQueue._queue[url].handlers;
                var pars = PriceQueue._queue[url].pars;
                for (var i = 0; i < handlers.length; i++) {
                    try {
                        handlers[i](response, pars[i]);
                    } catch (err) {
                        console.log(err);
                    }
                }
                delete PriceQueue._queue[url];
            }
            $J('#_priceQueueCont .pq-progress').stop().css({ width: '1%' }).animate({ width: '100%' }, PriceQueue._successDelay);
            window.setTimeout(() => {
                PriceQueue._isRunning = false;
                PriceQueue.StartQueue();
            }, PriceQueue._successDelay);
        },
        error: function (isAppError) {
            PriceQueue._currentError++;
            PriceQueue._currentproviderIdx++;

            // if (isAppError) {
            //     var strUrl = PriceQueue._urls.shift();
            //     PriceQueue._urls.push(strUrl);
            // }

            if (PriceQueue._currentproviderIdx >= PriceQueue.PricesProviders.length) {
                PriceQueue._currentproviderIdx = 0;
                PriceQueue._numberOfErrors++;
                console.log('Number round', PriceQueue._numberOfErrors);
                $J('#_priceQueueCont .pq-progress').stop().css({ width: '1%' }).animate({ width: '100%' }, PriceQueue._failureDelay);

                PriceQueue._urls.push(PriceQueue._currentURL);
                window.setTimeout(function () {
                    PriceQueue._isRunning = false;
                    PriceQueue.StartQueue();
                }, PriceQueue._failureDelay);
            } else {
                PriceQueue._urls.unshift(PriceQueue._currentURL);
                PriceQueue._isRunning = false;
                PriceQueue.StartQueue();
            }
        },
        complete: function () {
            if (PriceQueue.UpdateHandler) {
                PriceQueue.UpdateHandler();
            }
            PriceQueue.UpdateLabels();
        }
    },
    Init: function () {
        if (PriceQueue._isInit) {
            return;
        }

        var cnt = $J('<div id="_priceQueueCont" class="pq-container"><div class="pq-timer"><div class="pq-progress">&nbsp;</div></div><div class="pq-info">&nbsp;</div></div>');
        $J('body').append(cnt);
        PriceQueue._isInit = true;
    }
};

const SteamLvlUpSource = {
    _cache: {},
    GetPrices: (appid, items, show) => {
        const { market } = items;
        const MARKET_NAME = 'steamlvlup';
        const data = { appid, market: MARKET_NAME };
        chrome.runtime.sendMessage(SIHID, { type: 'GET_EXTERNAL_PRICES', data }, (res) => {
            if (res.success) {
                SteamLvlUpSource._cache = res.prices;
                if (typeof g_ActiveInventory.LoadCompleteInventory == 'function' && !g_ActiveInventory.BIsFullyLoaded()) {
                    g_ActiveInventory.LoadCompleteInventory().done(() => {
                        SteamLvlUpSource.SetPrices(appid, market);
                    });
                } else {
                    SteamLvlUpSource.SetPrices(appid, market);
                }
            }

            if (show) {
                GetEquippedItems();
                GetItemsInTrades();
                GetBookmarkedItems();
            }
        });
    },
    SetPrices: (appid, market) => {
        $J('.sih-functions-panel .spinner').hide();
        var items = $J(`div.item.app${appid}`);
        var crate = ExchangeRates.GetCurrentRate();

        items.each((idx, elem) => {
            const $elem = $J(elem);

            const market_fee_app = elem.rgItem.description.market_fee_app;
            const card = elem.rgItem.description.tags.find(x => x.category === 'cardborder');
            if (card === undefined) return;

            const is_foil = card.internal_name === 'cardborder_1' ? true : false;

            if (typeof g_ActiveInventory.LoadItemImage == 'function') g_ActiveInventory.LoadItemImage($elem);

            let $prices = $elem.find('.p-price');
            if (!$prices.length) {
                $prices = $J('<div class="p-price">');
                $elem.append($prices);
            }

            if (typeof PROVIDERS_LIST === "undefined") $prices.find('.price_flag').remove();
            else $prices.find(`.price_flag.${market}`).remove();

            if (SteamLvlUpSource._cache && SteamLvlUpSource._cache[market_fee_app]) {
                const mprice = is_foil
                    ? SteamLvlUpSource._cache[market_fee_app].pf
                    : SteamLvlUpSource._cache[market_fee_app].p;
                if (mprice) {
                    elem.rgItem.extprice_provider = market;
                    if (market === 'steamlvlup') {
                        elem.rgItem.extprice = Math.round(mprice * crate) / 1000;
                        const mprice_formated = v_currencyformat(elem.rgItem.extprice * 100, GetCurrencyCode(currencyId));
                        $prices.append(`<div class="price_flag ${market}" data-price="${mprice_formated}" title="${market}">`);
                    } else {
                        $prices.append(`<div class="price_flag ${market}" data-price="${mprice} gems" title="${market}">`);
                    }
                }
            }
        });
    }
};

const UniversalSource = {
    _cache: {},
    GetPrices: (appid, items, show) => {
        const { market } = items;
        const MARKET_NAME = market.toLowerCase();
        const data = { appid, market: MARKET_NAME };
        if (MARKET_NAME === 'steam') data.currency = currencyId;
        chrome.runtime.sendMessage(SIHID, { type: 'GET_EXTERNAL_PRICES', data }, (e) => {
            if (e.success) {
                if (!UniversalSource._cache[MARKET_NAME]) UniversalSource._cache[MARKET_NAME] = {};
                UniversalSource._cache[MARKET_NAME][appid] = e.prices;
                if (typeof g_ActiveInventory.LoadCompleteInventory == 'function' && !g_ActiveInventory.BIsFullyLoaded()) {
                    g_ActiveInventory.LoadCompleteInventory().done(() => {
                        UniversalSource.SetPrices(appid, MARKET_NAME);
                    });
                } else {
                    UniversalSource.SetPrices(appid, MARKET_NAME);
                }
            }

            if (show) {
                GetEquippedItems();
                GetItemsInTrades();
                GetBookmarkedItems();
            }
        });
    },
    SetPrices: (appid, marketName) => {
        $J('.sih-functions-panel .spinner').hide();
        var items = $J(`div.item.app${appid}`);
        var crate = ExchangeRates.GetCurrentRate();
        const MARKET_NAME = marketName.toLowerCase();

        items.each((idx, elem) => {
            const item_hash_name = elem.rgItem ? elem.rgItem.market_hash_name || (elem.rgItem.description && elem.rgItem.description.market_hash_name) || elem.rgItem.name : null;
            const $elem = $J(elem);

            if (typeof g_ActiveInventory.LoadItemImage == 'function') g_ActiveInventory.LoadItemImage($elem);

            let $prices = $elem.find('.p-price');
            if (!$prices.length) {
                $prices = $J('<div class="p-price">');
                $elem.append($prices);
            }

            if (typeof PROVIDERS_LIST === "undefined") $prices.find('.price_flag').remove();
            else $prices.find(`.price_flag.${MARKET_NAME}`).remove();

            if (UniversalSource._cache[MARKET_NAME] && UniversalSource._cache[MARKET_NAME][appid]) {
                const mprice = UniversalSource._cache[MARKET_NAME][appid][item_hash_name];
                if (mprice) {
                    if (MARKET_NAME !== 'bpoints') {
                        elem.rgItem.extprice = MARKET_NAME === 'steam' && appid != '753' ? getPriceAsInt(mprice) / 100 : Math.round(mprice * crate * 100) / 100;
                        elem.rgItem.extprice_provider = MARKET_NAME;
                        const mprice_formated = v_currencyformat(elem.rgItem.extprice * 100, GetCurrencyCode(currencyId));
                        $prices.append(`<div class="price_flag ${MARKET_NAME}" data-price="${mprice_formated}" title="${MARKET_NAME}">`);
                    } else {
                        let $points = $elem.find('.b-points');
                        if (!$points.length) {
                            $points = $J('<div class="b-points">');
                            $elem.append($points);
                        }
                        $points.find(`.price_flag.${MARKET_NAME}`).remove()
                        $points.append(`<div class="price_flag ${MARKET_NAME}" data-price="${mprice}" title="${MARKET_NAME}">`);
                    }
                }
            }
        });
    }
};

var TF2BP = {
    name: 'backpacktf',
    _cache: {},

    GetPrices: function (appid, items, show) {
        chrome.runtime.sendMessage(SIHID, { type: "TF2BP" }, function (e) {
            if (e.success) {
                TF2BP._cache = e.prices;
                if (typeof g_ActiveInventory.LoadCompleteInventory == 'function' && !g_ActiveInventory.BIsFullyLoaded()) {
                    g_ActiveInventory.LoadCompleteInventory().done(function () {
                        TF2BP.SetPrices(appid);
                    });
                } else {
                    TF2BP.SetPrices(appid);
                }
            }
            if (show) {
                GetEquippedItems();
                GetItemsInTrades();
                GetBookmarkedItems();
            }
        });
    },
    SetPrices: function (appid) {
        $J('.sih-functions-panel .spinner').hide();
        if (appid != 440) return;

        var items = $J('div.item.app' + appid);
        var strangeModifiers = ['Strange Specialized Killstreak ', 'Strange Professional Killstreak ', 'Strange ', 'Vintage ', 'The ', 'Genuine '];

        var prepareData = function (sItem) {
            if (sItem.description !== undefined) {
                var desc = sItem.description;
                sItem.tradable = desc.tradable;
                var qualityName;
                desc.tags.map(function (tag) {
                    if (tag.category.toLowerCase() == 'quality') qualityName = tag.internal_name;
                });
                sItem.app_data = { quality: tf2Quality[qualityName] };
                sItem.market_hash_name = desc.market_hash_name;
                sItem.apivalue = { attributes: desc.attributes };
            }
            return sItem;
        };

        items.each(function () {
            this.rgItem = prepareData(this.rgItem);

            if (!this.rgItem || (!this.rgItem.description && !this.rgItem.tradable) || (this.rgItem.description && !this.rgItem.description.tradable)) return;

            var nprice = 0,
                quality = this.rgItem.app_data.quality,
                tradable = (this.rgItem.tradable ? 'Tradable' : 'Untradable'),
                craftable = 'Craftable',
                priceindex = 0;
            var name = GetMarketHashName(this.rgItem.description || this.rgItem);
            if (TF2BP._cache[name] === undefined) {
                for (var i = 0; i < strangeModifiers.length; i++) {
                    if (name.indexOf(strangeModifiers[i]) == 0 && TF2BP._cache[name.substr(strangeModifiers[i].length)]) {
                        name = name.substr(strangeModifiers[i].length);
                        break;
                    }
                }
            }

            var isUnusual = false;
            if (name.indexOf('Unusual ') == 0) {
                isUnusual = true;
                name = name.substr(8);
                if (this.rgItem.apivalue && this.rgItem.apivalue.attributes) {
                    for (var iidx = 0; iidx < this.rgItem.apivalue.attributes.length; iidx++) {
                        if (this.rgItem.apivalue.attributes[iidx].defindex == 134) {
                            priceindex = this.rgItem.apivalue.attributes[iidx].float_value;
                            break;
                        }
                    }
                }
            }

            if (!priceindex && name.indexOf('#') !== -1) {
                priceindex = name.substr(name.indexOf('#') + 1).trim();
            }

            if (name.indexOf('Series') !== -1) {
                name = name.substr(0, name.indexOf('Series')).trim();
            }

            var $elem = $J(this);
            let $prices = $elem.find('.p-price');
            if (!$prices.length) {
                $prices = $J('<div class="p-price">');
                $elem.append($prices);
            }

            if (typeof PROVIDERS_LIST === "undefined") $prices.find(`.price_flag`).remove();
            else $prices.find(`.price_flag.backpacktf`).remove();

            if (TF2BP._cache[name] &&
                TF2BP._cache[name].prices &&
                TF2BP._cache[name].prices[quality] &&
                TF2BP._cache[name].prices[quality][tradable] &&
                TF2BP._cache[name].prices[quality][tradable][craftable] &&
                TF2BP._cache[name].prices[quality][tradable][craftable][priceindex]
            ) {
                var iprice = TF2BP._cache[name].prices[quality][tradable][craftable][priceindex];
                this.rgItem.extcrr = iprice.currency;
                this.rgItem.extprice = iprice.value;

                $prices.append(`<div class="price_flag backpacktf" data-price="${iprice.value} ${iprice.currency}" title="backpacktf">`);
            }
        });
    }
};

var ExchangeRates = {
    _rates: null,

    GetRate: function () {
        chrome.runtime.sendMessage(SIHID, { type: "exchangerate" }, function (e) {
            if (e && e.success) {
                ExchangeRates._rates = e.rates.rates;
            }
        });
    },
    GetCurrentRate: function () {
        if (currencyId && currencyId > 1 && ExchangeRates._rates != null) {
            var ccode = GetCurrencyCode(currencyId);
            return (ExchangeRates._rates[ccode]) ? ExchangeRates._rates[ccode] : 1;
        } else {
            return 1;
        }
    },
    Format: function (input) {
        if (currencyId && currencyId > 1 && ExchangeRates._rates != null) {
            var ccode = GetCurrencyCode(currencyId);
            if (ExchangeRates._rates[ccode]) {
                input *= ExchangeRates._rates[ccode];
                return v_currencyformat(Math.round(input * 100), ccode);
            } else {
                return v_currencyformat(Math.round(input * 100), 'USD');
            }
        } else {
            return v_currencyformat(Math.round(input * 100), 'USD');
        }
    }
};

var ExternalPrices = {
    // Team Fortress 2
    440: {
        apis: [{
            name: 'BackpackTF',
            api: TF2BP
        }, {
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // DOTA 2
    570: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }, {
            name: 'CSGOFast',
            api: UniversalSource
        }, {
            name: 'Dota2Net',
            api: UniversalSource
        }, {
            name: 'd2droulette',
            api: UniversalSource
        }, {
            name: 'Steam',
            api: UniversalSource
        }]
    },
    // Counter-Strike: Global Offensive
    730: {
        apis: [{
            name: 'CSGOFast',
            api: UniversalSource
        }, {
            name: 'CSGOBackpack',
            api: UniversalSource
        }, {
            name: 'CSGOTM',
            api: UniversalSource
        }, {
            name: 'CSMoney',
            api: UniversalSource
        }, {
            name: 'BitSkins',
            api: UniversalSource
        }, {
            name: 'LootFarm',
            api: UniversalSource
        }, {
            name: 'Steam',
            api: UniversalSource
        }]
    },
    // PAYDAY 2
    218620: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Rust
    252490: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // H1Z1: Just Survive
    295110: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // H1Z1: King of the Kill
    433850: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Unturned
    304930: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Killing Floor 2
    232090: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // PLAYERUNKNOWN'S BATTLEGROUNDS
    578080: {
        apis: [{
            name: 'CSGOFast',
            api: UniversalSource
        }, {
            name: 'BPoints',
            api: UniversalSource
        }, {
            name: 'CSGOTM',
            api: UniversalSource
        }, {
        //     name: 'Dota247',
        //     api: UniversalSource
        // }, {
            name: 'BitSkins',
            api: UniversalSource
        }, {
            name: 'LootFarm',
            api: UniversalSource
        }, {
            name: 'Steam',
            api: UniversalSource
        }]
    },
    // Battalion 1944
    489940: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Depth
    274940: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Black Squad
    550650: {
        apis: [{
            name: 'BitSkins',
            api: UniversalSource
        }]
    },
    // Steam Community
    753: {
        apis: [{
            name: 'steamlvlup',
            api: SteamLvlUpSource
        }, {
            name: 'steamlvlupgems',
            api: SteamLvlUpSource
        }, {
            name: 'Steam',
            api: UniversalSource
        }]
    },

    UpdatePrice: function (_currencyid) {
        if (_currencyid && _currencyid > 0) {
            currencyId = _currencyid;
        } else {
            currencyId = typeof (g_rgWalletInfo) != 'undefined' ? g_rgWalletInfo['wallet_currency'] : 1;
        }
        var apiIdx = 0;
        if ($J('#cb_ExternalPrices').length) {
            apiIdx = $J('#cb_ExternalPrices').val();
        }
        if (apiIdx === null) return;
        var _api = ExternalPrices[g_ActiveInventory.appid].apis[apiIdx];
        if (_api && _api.api && _api.api.SetPrices) {
            _api.api.SetPrices(g_ActiveInventory.appid, _api.name);
        }
    },
    Push: function (data) { },
    cusapis: {}
};

ExchangeRates.GetRate();

// chrome.runtime.sendMessage(SIHID, { type: "getcustomtotal" }, function (e) {
//     if (e) {
//         for (var i = 0; i < e; i++) {
//             getCustomAPI(i);
//         }
//     }
// });

var getCustomAPI = function (idx) {
    chrome.runtime.sendMessage(SIHID, { type: "getcustom", idx: idx }, function (e) {
        if (!e) {
            return;
        }
        var isApproved = false;
        if (e.aprrovedids && typeof (g_ulTradePartnerSteamID) != 'undefined') {
            var arr = e.aprrovedids;
            for (var i = 0; i < arr.length; i++) {
                if (g_ulTradePartnerSteamID == arr[i]) {
                    var a = $J('<a href="#" class="verified-user" title="">Verified</a>');
                    a.prop('title', 'Verified by ' + e.name);
                    a.text('Verified by ' + e.name);
                    $J('#trade_theirs h2').append(a);
                    isApproved = true;
                    break;
                }
            }
        }
        if (e.prices) {
            if (!ExternalPrices.cusapis[e.name]) {
                var napi = {
                    name: e.name,

                    GetPrices: function (appid, items, show) {
                        if (items && (items.appid || Object.keys(items).length) && show) {
                            var appid = items.appid || items[Object.keys(items)[0]].appid;
                            var $__api = this;
                            window.setTimeout(function () {
                                $__api.SetPrices(appid);
                            }, 100);
                        }
                    },
                    SetPrices: function (appid) {
                        var $__api = this;
                        //console.log($__api);
                        if (!$__api._cache[appid]) {
                            return;
                        }
                        var context = 'item' + appid + '_';
                        var items = $J('[id^="' + context + '"]');
                        var crate = ExchangeRates.GetCurrentRate();
                        //console.log(items);
                        items.each(function () {
                            var name = this.rgItem.market_hash_name || this.rgItem.market_name || this.rgItem.name;
                            if (!this.rgItem || !$__api._cache[appid][name]) {
                                return;
                            }
                            var el = $J(this);
                            var pprice = el.find('.p-price');
                            if (!pprice.length) {
                                pprice = $J('<div class="p-price"></div>');
                                el.append(pprice);
                            }
                            var nprice = $__api._cache[appid][name].lowest;
                            if (el[0].rgItem) {
                                el[0].rgItem.extprice = Math.round(nprice * crate * 100) / 100;
                            }
                            pprice.prop('title', $__api.name);
                            pprice.text(ExchangeRates.Format(nprice));
                        });
                    }
                };
                ExternalPrices.cusapis[e.name] = napi;
                $J.each(e.prices, function (idx, o) {
                    idx = parseInt(idx) + '';
                    if (!ExternalPrices[idx]) {
                        ExternalPrices[idx] = { apis: [] };
                    }
                    ExternalPrices[idx].apis.push({
                        name: e.name,
                        api: ExternalPrices.cusapis[e.name],
                        isApproved: isApproved
                    });
                });
            }
            var capi = ExternalPrices.cusapis[e.name];
            capi._cache = e.prices;
        }
    });
};

const GetBookmarkedItems = () => {
    const appid = g_ActiveInventory.appid;
    const filteredBookmarkedItems = Object.keys(bookmarkeditems)
        .filter(key => bookmarkeditems[key].appid == appid)
        .reduce((res, key) => Object.assign(res, { [key]: bookmarkeditems[key] }), {});
    if (!$J.isEmptyObject(filteredBookmarkedItems)) $J(`div.item.app${appid}[id*=${appid}_]`).each((idx, elem) => {
        const $elem = $J(elem);
        const market_hash_name = GetMarketHashName(elem.rgItem.description || elem.rgItem);
        const bookmarkname = `${appid}/${encodeURIComponent(market_hash_name).replace('(', '%28').replace(')', '%29')}`;
        if (filteredBookmarkedItems[bookmarkname]) {
            if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_bookmarked');
            else $elem.append('<div class="item_flag item_bookmarked">')
        }
    });
};

const GetEquippedItems = () => {
    const appid = g_ActiveInventory.appid;
    const steamid = g_ActiveUser.GetSteamId();
    if (appid == 440 || appid == 570) {
        chrome.runtime.sendMessage(SIHID, { type: 'GetPlayerItems', steamid, appid }, function (response) {
            if (response && response.success) {
                Object.keys(response.data).forEach((itemId) => {
                    const elIt = $J(`div.item[id*=${itemId}]`);
                    if (elIt.find('.item_flag').length) elIt.find('.item_flag').addClass('item_equipped');
                    else elIt.append('<div class="item_flag item_equipped">')
                    elIt[0].rgItem.equipped = true;
                });
            }
        });
    }
};

var econItemExp = /data-economy-item="(\w+)\/(\d+)\/(\d+)\/(\d+)"/gi;
const GetItemsInTrades = () => {
    // if (g_ActiveUser.GetSteamId() !== UserYou.GetSteamId() || (typeof g_bViewingOwnProfile !== 'undefined' && !g_bViewingOwnProfile)) return;
    if (typeof g_bViewingOwnProfile !== 'undefined' && !g_bViewingOwnProfile) return;

    if (window._apikey || window.apikey) {
        const data = { active_only: 1, get_received_offers: 1, get_sent_offers: 1 };
        window.chrome.runtime.sendMessage(SIHID, { type: "GetLastTrades", data }, (res) => {
            $J.each((res.response.trade_offers_sent || []), (i, row) => {
                $J.each((row.items_to_give || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    itemsInTrades.push({ id: assetid, appid, contextid, classid, instanceid });
                    $elem = $J(`div.item[id*=${appid}_${contextid}_${assetid}]`);
                    if ($elem.length) {
                        if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_intrade');
                        else $elem.append('<div class="item_flag item_intrade">')
                    }
                });

                $J.each((row.items_to_receive || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    $elem = $J(`div.item[id*=${appid}_${contextid}_${assetid}]`);
                    itemsInTrades.push({ id: assetid, appid, contextid, classid, instanceid });
                    if ($elem.length) {
                        if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_intrade');
                        else $elem.append('<div class="item_flag item_intrade">')
                    }
                });
            });

            $J.each((res.response.trade_offers_received || []), (i, row) => {
                $J.each((row.items_to_give || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    $elem = $J(`div.item[id*=${appid}_${contextid}_${assetid}]`);
                    itemsInTrades.push({ id: assetid, appid, contextid, classid, instanceid });
                    if ($elem.length) {
                        if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_intrade');
                        else $elem.append('<div class="item_flag item_intrade">')
                    }
                });

                $J.each((row.items_to_receive || []), (idx, item) => {
                    const { assetid, appid, contextid, classid, instanceid } = item;
                    itemsInTrades.push({ id: assetid, appid, contextid, classid, instanceid });
                    $elem = $J(`div.item[id*=${appid}_${contextid}_${assetid}]`);
                    if ($elem.length) {
                        if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_intrade');
                        else $elem.append('<div class="item_flag item_intrade">')
                    }
                });
            });
        });
    } else {
        $J.ajax({
            url: window.location.protocol + window.userUrl + 'tradeoffers/sent/'
        }).done(function (res) {
            var m = null;
            $J(res.replace(/\n/gi, '')).find('.tradeoffer_items.primary .trade_item').each((idx, tradeItem) => {
                let assetid = null;
                let contextid = null;

                const [infoType, appid, classid, instanceid] = $J(tradeItem).data('economy-item').split('/');
                if (g_ActiveInventory.appid == appid) {
                    $J(`.app${appid}[id*=${appid}_]`).each((idx1, elem) => {
                        const rgItem = elem.rgItem;
                        if (rgItem.classid == classid && rgItem.instanceid == instanceid) {
                            contextid = rgItem.contextid;
                            assetid = rgItem.assetid ? rgItem.assetid : rgItem.id;
                            return false;
                        }
                    });

                    if (assetid && contextid) {
                        itemsInTrades.push({
                            id: assetid,
                            appid: parseInt(appid),
                            context: parseInt(contextid)
                        });
                        var $elem = $J(`div.item[id*=${appid}_${contextid}_${assetid}]`);
                        if ($elem.length) {
                            if ($elem.find('.item_flag').length) $elem.find('.item_flag').addClass('item_intrade');
                            else $elem.append('<div class="item_flag item_intrade">')
                        }
                    }
                }
            });
        });
    }
};
