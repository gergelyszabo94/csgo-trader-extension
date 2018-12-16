var expMarketHashName = /market_hash_name=([^&]+)/;
var expCountryCode = /country=([^&]+)/;
var expCurrencyID = /currency=([^&]+)/;
var expAppID = /appid=([^&]+)/;
var PriceQueue = {
    _numberOfErrors: 0,
    _currentError: 0,
    _isRunning: false,
    _isInit: false,
    _successDelay: 800,
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
                PriceQueue._queue[options.url] = {url: options.url, handlers: [], pars: []};
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
    PricesProviders: [
        {
            name: 'SteamOverviewPrice',
            getprice: function (appid, countryCode, currencyId, market_hash_name) {
                var cacheURL = 'appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;
                var url = 'http://steamcommunity.com/market/priceoverview/?appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;

                $.ajax({
                    method: "GET",
                    url: url,
                    cacheURL: cacheURL,
                    success: function (response, textStatus, jqXHR) {
                        response.hashName = decodeURIComponent(market_hash_name);
                        PriceQueue._generalHandler.success(response, this.cacheURL, 'SteamOverviewPrice');
                    },
                    error: PriceQueue._generalHandler.error,
                    complete: PriceQueue._generalHandler.complete
                });
            }
        },
        {
            name: 'SteamListingPrice',
            getprice: function (appid, countryCode, currencyId, market_hash_name) {
                var cacheURL = 'appid=' + appid + '&country=' + countryCode + '&currency=' + currencyId + '&market_hash_name=' + market_hash_name;
                var url = 'http://steamcommunity.com/market/listings/' + appid + '/' + market_hash_name + '/render/?start=0&count=5&country=' + countryCode + '&language=english&currency=' + currencyId;

                $.ajax({
                    method: "GET",
                    url: url,
                    cacheURL: cacheURL,
                    success: function (response, textStatus, jqXHR) {
                        if (response && response.success && response.listinginfo) {
                            var price1, price2;
                            price1 = /market_listing_price_with_fee">([\s\S]+?)<\/span>/g.exec(response.results_html);
                            price2 = /market_listing_price_without_fee">([\s\S]+?)<\/span>/g.exec(response.results_html);

                            var _response = {success: true, hashName: decodeURIComponent(market_hash_name)};
                            if (response.total_count > 1) {
                                _response.volume = response.total_count;
                            }
                            if (price1 && price1.length > 1) {
                                _response.lowest_price = price1[1];
                            }
                            if (price2 && price2.length > 1) {
                                _response.median_price = price2[1];
                            }
                            if (v_currencyformat && GetCurrencyCode) {
                                if (response.listinginfo.length) {
                                    var lstItem = response.listinginfo[Object.keys(response.listinginfo)[0]];
                                    for (var i in response.listinginfo) {
                                        if (response.listinginfo[i] && response.listinginfo[i].converted_price) {
                                            lstItem = response.listinginfo[i];
                                            break;
                                        }
                                    }

                                    _response.lowest_price = v_currencyformat(lstItem.converted_price + lstItem.converted_fee, GetCurrencyCode(currencyId));
                                    _response.median_price = v_currencyformat(lstItem.converted_price, GetCurrencyCode(currencyId));
                                }
                            }

                            if (price1 == 'sold') {
                                PriceQueue._generalHandler.error();
                            }

                            PriceQueue._generalHandler.success(_response, this.cacheURL, 'SteamListingPrice');
                        } else {
                            PriceQueue._generalHandler.error(true);
                        }
                    },
                    error: PriceQueue._generalHandler.error,
                    complete: PriceQueue._generalHandler.complete
                });
            }
        }
    ],
    StartQueue: function () {
        if (PriceQueue._isRunning) {
            return;
        }
        if (PriceQueue._urls.length > 0) {
            PriceQueue._isRunning = true;
            var url = PriceQueue._urls[0];
            var appid = expAppID.exec(url)[1];
            var countryCode = expCountryCode.exec(url)[1];
            var currencyID = expCurrencyID.exec(url)[1];
            var marketHashName = expMarketHashName.exec(url)[1];

            PriceQueue.PricesProviders[PriceQueue._currentproviderIdx].getprice(appid, countryCode, currencyID, marketHashName);
        } else {
            PriceQueue._currentError = 0;
        }
    },
    UpdateHandler: function () { },
    UpdateLabels: function () {
        if (PriceQueue._urls.length == 0) {
            $('#_priceQueueCont').hide();
        } else {
            $('#_priceQueueCont').show();
            var hashname = '';
            var m = /market_hash_name=([^&]+)/.exec(PriceQueue._urls[0]);
            if (m && m.length > 1) {
                hashname = decodeURI(m[1]);
            }
            $('#_priceQueueCont .pq-info').html(hashname + '<br />' + PriceQueue._urls.length + ' items remain - ' + PriceQueue._currentError + ' errors');
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
        var marketLink = "http://steamcommunity.com/market/listings/" + rgItems.appid + "/" + encodeURIComponent(rgItems.market_hash_name);

        var ddHtml = priceProvider + ": <a href='" + marketLink + "' target='_blank' style='color:#FF0' title='" + rgItems.nofeePrice + "'>" + rgItems.lowestPrice;
        if (rgItems.volume) {
            ddHtml += ' <span style="font-size: 0.9em; font-style: italic">(V: ' + rgItems.volume + ')</span>';
        }

        if (mediumPrice && rgItems.market_hash_name !== mediumName) {
            var price = parseFloat(getNumber(rgItems.lowestPrice)),
                mprice = parseFloat(getNumber(mediumPrice)),
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
            response.providerName = providerName;

            PriceQueue._cache[url] = {response: response, providerName: providerName};
            if (url == PriceQueue._urls[0]) {
                PriceQueue._urls.shift();
            }
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
            $('#_priceQueueCont .pq-progress').stop().css({width: '1%'}).animate({width: '100%'}, PriceQueue._successDelay);
            window.setTimeout(function () {
                PriceQueue._isRunning = false;
                PriceQueue.StartQueue();
            }, PriceQueue._successDelay);
        },
        error: function (isAppError) {
            PriceQueue._currentError++;
            PriceQueue._numberOfErrors++;
            PriceQueue._currentproviderIdx++;

            if (isAppError) {
                var strUrl = PriceQueue._urls.shift();
                PriceQueue._urls.push(strUrl);
            }

            if (PriceQueue._currentproviderIdx >= PriceQueue.PricesProviders.length) {
                PriceQueue._currentproviderIdx = 0;
                $('#_priceQueueCont .pq-progress').stop().css({width: '1%'}).animate({width: '100%'}, PriceQueue._failureDelay);
                window.setTimeout(function () {
                    PriceQueue._isRunning = false;
                    PriceQueue.StartQueue();
                }, PriceQueue._failureDelay);
            } else {
                PriceQueue._isRunning = false;
                PriceQueue.StartQueue();
            }

            console.log('No error', PriceQueue._numberOfErrors);
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

        var cnt = $('<div id="_priceQueueCont" class="pq-container"><div class="pq-timer"><div class="pq-progress">&nbsp;</div></div><div class="pq-info">&nbsp;</div></div>');
        $('body').append(cnt);
        PriceQueue._isInit = true;
    }
};
