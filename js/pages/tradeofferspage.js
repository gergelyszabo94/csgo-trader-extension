/* global chrome */
var steamOfferExp = /<div class="link_overlay" onclick="ShowTradeOffer\( '(\d+)' \);"><\/div>[\s\S]+?<img src="(.+)">[\s\S]+?">([\s\S]+?)[：:]/g;
var imgExp = /<img src="http:\/\/steamcommunity-a.akamaihd.net\/economy\/image\/[^"]+(\d{2})f".+>/g;
var userUrlExp = /<a href="https:\/\/steamcommunity.com\/.+?\/.+?\/">/;
var sessionIDJSExp = /g_sessionID = \"(.+)\";/;
var sessionID = '';
var _tradesTimers = {};
var _openedWins = {};

chrome.storage.sync.get({
    quickaccept: false,
    quickacceptprompt: true,
    quickrefuse: false,
    quickrefuseprompt: true,
    offertotalprice: false,
    qadelay: 10,
    qrdelay: 10,
    currency: '',
    userUrl: null,
    lang: '',
    apikey: ''
}, function (items) {
    window.quickaccept = items.quickaccept;
    window.quickacceptprompt = items.quickacceptprompt;
    window.quickrefuse = items.quickrefuse;
    window.quickrefuseprompt = items.quickrefuseprompt;
    window.offertotalprice = items.offertotalprice;
    window.qadelay = items.qadelay;
    window.qrdelay = items.qrdelay;
    window.currencyId = items.currency !== '' ? items.currency : 1;
    window.userUrl = items.userUrl;
    window._apikey = items.apikey;
    window.userLanguage = items.lang;

    $(function () {
        if (items.apikey === '' && (items.userUrl === null || items.userUrl === '//steamcommunity.com/my/')) {
            $.ajax({
                method: 'get',
                url: 'https://steamcommunity.com/my/'
            }).done(function (response) {
                if ($(response).find('.mainLoginPanel').length) {
                    userSignedOut();
                } else {
                    var userUrl = userUrlExp.exec(response)[0].split('"')[1];
                    chrome.storage.sync.set({userUrl: userUrl.split(':')[1]});
                    getTrades(userUrl.split(':')[1]);
                }
            });
        } else {
            getTrades(items.userUrl);
        }

        chrome.browserAction.setPopup({popup: 'html/tradeoffers.html'});
    });
});

$(document).ready(function () {
  setTimeout(function () {
    // const lang = ( (window.userLanguage || detectUserLanguage()) == 'ru' ? 'ru' : 'en');
    // const link = (
    //     lang.toLowerCase() === 'ru'
    //         ? 'https://csgocasino.ru/?utm_source=SIH&utm_medium=1020-170&utm_campaign=promo-SIH2018-ru#r/175o6y'
    //         : 'https://csgofast.com/?utm_source=SIH&utm_medium=1020-170&utm_campaign=promo-SIH2018#r/175o6y'
    // );
    $('.sponsor a').prop('href', 'http://d2d-roulette.com/');
    $('.sponsor-link a').prop('href', 'http://d2d-roulette.com/');
    var sponsorImg = $('.sponsor img');
    chrome.runtime.sendMessage(chrome.runtime.id, { type: 'GetBanner', data: { size: 'big', partner: 'd2droulette' } }, (res) => {
      if (res.success) {
        sponsorImg.prop('src', res.url);
        sponsorImg.delay(500).fadeIn(500);
      }
    });
    sponsorImg.on('load', function () {
        chrome.runtime.sendMessage(chrome.runtime.id, {type: "adstat", data: "mto", action: "show"});
    });
    $('.sponsor').click(function () {
        chrome.runtime.sendMessage(chrome.runtime.id, {type: "adstat", data: "mto", action: "click"});
    });
  }, 10);
});

var lastleft = 0, lasttop = 0;
var nofSteam = function (idOffer, img, name) {
    name = name.trim();
    name = name.replace(/<span.+?>/g, '').replace(/<\/span>/g, '');
    var path = img.replace('.jpg', '_medium.jpg');// chrome.runtime.getURL("/icon64.png");
    var div = $('<div class="tradeoffer" data-id="' + idOffer + '">');
    var link = $('<a href="https://steamcommunity.com/tradeoffer/' + idOffer + '/" target="_blank"><img src="' + path + '"></a>');
    var declineLink = $('<a class="decline-bt" href="#" >' + i18next.t('tradeoffers.decline') + '</a>');
    var acceptLink = $('<a class="accept-bt" href="#" >' + i18next.t('tradeoffers.quickaccept') + '</a>');
    var refuseLink = $('<a class="refuse-bt" href="#" >' + i18next.t('tradeoffers.quickrefuse') + '</a>');

    $(div).append('<div style="clear:both; float:none">' + name + '</div>');
    $(div).append(link);
    $(div).append('<div class="offer-theirs"></div><div>for</div><div class="offer-yours"></div><div class="clearer">&nbsp;</div>');
    $(div).append(declineLink);

    if (quickaccept) {
        $(div).append(acceptLink);
        acceptLink.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (_tradesTimers[idOffer]) {
                window.clearInterval(_tradesTimers[idOffer].timer);
                _tradesTimers[idOffer] = null;
                $(this).html(i18next.t('tradeoffers.quickaccept'));
                return false;
            }

            if (window.quickacceptprompt && !confirm(i18next.t('tradeoffers.confirmation'))) {
                return false;
            }

            if (window.qadelay) {
                _tradesTimers[idOffer] = {
                    timer: window.setInterval(function () {
                        TradeAcceptTimerTick(idOffer);
                    }, 1000),
                    remain: window.qadelay
                };
                $(this).html(i18next.t('tradeoffers.cancel') + ' (' + (window.qadelay < 10 ? '0' : '') + window.qadelay + ')');
            } else if (window.qadelay == 0) {
                var link = $J(this);
                link.html('Accepting...');
                link.prop('disabled', true);
                AcceptTradeOffer(idOffer);
            }
        });
    }

    if (quickrefuse) {
        $(div).append(refuseLink);
        refuseLink.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (_tradesTimers[idOffer]) {
                window.clearInterval(_tradesTimers[idOffer].timer);
                _tradesTimers[idOffer] = null;
                $(this).html(i18next.t('tradeoffers.quickrefuse'));
                return false;
            }

            if (window.quickrefuseprompt && !confirm(i18next.t('tradeoffers.confirmation'))) {
                return false;
            }

            if (window.qrdelay) {
                _tradesTimers[idOffer] = {
                    timer: window.setInterval(function () {
                        TradeRefuseTimerTick(idOffer);
                    }, 1000),
                    remain: window.qrdelay
                };
                $(this).html(i18next.t('tradeoffers.cancel') + ' (' + (window.qrdelay < 10 ? '0' : '') + window.qrdelay + ')');
            } else if (window.qrdelay == 0) {
                var link = $J(this);
                link.html('Refusing...');
                link.prop('disabled', true);
                RefuseTradeOffer(idOffer);
            }
        });
    }

    $(div).append('<div class="clearer">&nbsp;</div>');
    $('#Div_Offers').append(div);
    $(declineLink).click(function (event) {
        DeclineTradeOffer(idOffer, sessionID);
        event.stopPropagation();
        return false;
    });
    $(div).click(function (e) {
        chrome.windows.create({
            'url': 'https://steamcommunity.com/tradeoffer/' + idOffer + '/',
            'type': 'popup',
            'left': lastleft,
            'top': lasttop
        }, function (window) {});
        lastleft += 10;
        lasttop += 10;
        e.preventDefault();
    });
    return div;
};

var TradeAcceptTimerTick = function (IdTradeOffer) {
    if (!_tradesTimers[IdTradeOffer]) return;

    var remain = _tradesTimers[IdTradeOffer].remain;
    var link = $('.tradeoffer[data-id="' + IdTradeOffer + '"]').find('.accept-bt');

    if (remain == 0) {
        link.html('Accepting...');
        link.prop('disabled', true);
        window.clearInterval(_tradesTimers[IdTradeOffer].timer);
        AcceptTradeOffer(IdTradeOffer);
    } else {
        remain--;
        _tradesTimers[IdTradeOffer].remain = remain;
        link.html(i18next.t('tradeoffers.cancel') + ' (' + (remain < 10 ? '0' : '') + remain + ')');
    }
};

var TradeRefuseTimerTick = function (IdTradeOffer) {
    if (!_tradesTimers[IdTradeOffer]) return;

    var remain = _tradesTimers[IdTradeOffer].remain;
    var link = $('.tradeoffer[data-id="' + IdTradeOffer + '"]').find('.refuse-bt');

    if (remain == 0) {
        link.html('Refusing...');
        link.prop('disabled', true);
        window.clearInterval(_tradesTimers[IdTradeOffer].timer);
        RefuseTradeOffer(IdTradeOffer);
    } else {
        remain--;
        _tradesTimers[IdTradeOffer].remain = remain;
        link.html(i18next.t('tradeoffers.cancel') + ' (' + (remain < 10 ? '0' : '') + remain + ')');
    }
};

var AcceptTradeOffer = function (IdTradeOffer) {
    window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihaccept=' + sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
    return;
};

var RefuseTradeOffer = function (IdTradeOffer) {
    window.open('https://steamcommunity.com/tradeoffer/' + IdTradeOffer + '/?sihrefuse=' + sessionID, 'HiddenTradeOffer' + IdTradeOffer, 'height=10,width=10,resize=yes,scrollbars=yes');
    return;
};

var DeclineTradeOffer = function (tradeOfferID, g_sessionID) {
    var strAction = 'decline';
    var request;
    if (window._apikey.length) {
        request = $.ajax({
          method: 'POST',
          url: 'https://api.steampowered.com/IEconService/DeclineTradeOffer/v1/',
          data: {
              tradeofferid: tradeOfferID,
              key: window._apikey || apiKey
          }
        });
    } else {
        request = $.ajax({
          url: 'https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strAction,
          data: {sessionid: g_sessionID},
          type: 'POST',
          crossDomain: true,
          xhrFields: {withCredentials: true}
        });
    }
    request.done(function (data) {
        $('[data-id=' + tradeOfferID + ']').remove();
        var num = $('.tradeoffer[data-id]').length;
        if (num) {
            $('#countoffers #title').text(i18next.t('tradeoffers.countoffers', {NUMBERS: ""+num}));
        } else {
            $('#countoffers').text(i18next.t('tradeoffers.nooffers'));
        }
        chrome.browserAction.setBadgeText({text: num ? '' + num : ''});
    }).fail(function (err) {
      console.log(err);
    });
};

var openAll = function () {
    lastleft = 0;
    lasttop = 0;

    $('.tradeoffer[data-id]').each(function () {
        var idoffer = $(this).data('id');
        chrome.windows.create({
          'url': `https://steamcommunity.com/tradeoffer/${idoffer}/`,
          'type': 'popup'
        });
    });
};

var declineAll = function () {
    $('.tradeoffer[data-id]').each(function () {
        var idoffer = $(this).data('id');
        DeclineTradeOffer(idoffer, sessionID);
    });
};

function getTrades(userUrl) {
    if (window._apikey.length) {
        // console.log('We have API key');
        getTradesByAPI();
    } else {
        // console.log('We haven\'t API key');
        getTradesByParsing(userUrl);
    }
}

function userSignedOut() {
    $('#Div_Offers').html('').append(i18next.t('tradeoffers.signedout'));
    chrome.browserAction.setBadgeText({text: 'off'});
}

function getTradesByParsing(userUrl) {
    var offersDivBlock = $('#Div_Offers').html('');
    var tradeURL = 'http:' + userUrl + 'tradeoffers/';
    $.ajax({
        method: "GET",
        url: tradeURL,
        cache: false
    }).done(function (response, textStatus, jqXHR) {
        // Если отправляем запрос по https, то ничего не возвращается в ответе, если пользователь незалогинен, только статус 429.
        // Запрос по http будет перенаправлен на страницу логина, если пользователь незалогинен
        if ($(response).find('.mainLoginPanel').length) {
            userSignedOut();
        } else {
            var res = response;
            sessionID = sessionIDJSExp.exec(res);
            if (sessionID) {
                sessionID = sessionID[1];
            }

            var bodyIdx = [res.indexOf('<body class="flat_page responsive_page">'), res.indexOf('</body>')];
            var resHTML = res.substr(bodyIdx[0] + 40, bodyIdx[1] - bodyIdx[0] - 40);
            var $body = $(resHTML);

            var num = 0;
            var userLink = $body.find('#responsive_page_menu .playerAvatar a').attr('href');
            chrome.storage.sync.set({steam_user_link: userLink});

            $body.find('.tradeoffer').each(function (i, o) {
                var $tradeoffer = $(this);
                if ($tradeoffer.find('.link_overlay').length == 0) {
                    return;
                }
                var partnerImg = $tradeoffer.find('.tradeoffer_partner .playerAvatar img').prop('src');
                var offerID = $tradeoffer.prop('id').substr(13);
                var header = $tradeoffer.find('.tradeoffer_header').text();
                var tradeofferdiv = nofSteam(offerID, partnerImg, header);
                var imgTheirs = $tradeoffer.find('.tradeoffer_items.primary .tradeoffer_item_list .trade_item img');
                var imgYours = $tradeoffer.find('.tradeoffer_items.secondary .tradeoffer_item_list .trade_item img');

                imgTheirs.each(function () {
                    var orgSrc = $(this).prop('src');
                    $(this).prop('src', orgSrc.replace(/96fx96f/g, '48fx48f'));
                    orgSrc = $(this).prop('srcset');
                    $(this).prop('srcset', orgSrc.replace(/96fx96f/g, '48fx48f'));
                });
                imgYours.each(function () {
                    var orgSrc = $(this).prop('src');
                    $(this).prop('src', orgSrc.replace(/73fx73f/g, '32fx32f'));
                    orgSrc = $(this).prop('srcset');
                    $(this).prop('srcset', orgSrc.replace(/73fx73f/g, '32fx32f'));
                });

                tradeofferdiv.addClass('offer-' + offerID);
                tradeofferdiv.find('.offer-theirs').append(imgTheirs);
                tradeofferdiv.find('.offer-yours').append(imgYours);
                offersDivBlock.append(tradeofferdiv);
                num++;

            });

            if (num > 0) {
                offersDivBlock.prepend('<div style="margin-bottom:20px;" id="countoffers"><span id="title">' + i18next.t('tradeoffers.countoffers', {NUMBERS: ""+num}) + '</span><br /> <a href="#" id="lnk_openall">' + i18next.t('tradeoffers.openall') + '</a> <a href="#" id="lnk_declineall">' + i18next.t('tradeoffers.declineall') + '</a> </div>');
                $('#lnk_openall').click(function () {
                    openAll();
                    return false;
                });
                $('#lnk_declineall').click(function () {
                    if (confirm('Are you sure?')) {
                        declineAll();
                    }
                    return false;
                });
                chrome.browserAction.setBadgeText({text: "" + num});
            } else {
                offersDivBlock.prepend('<div style="margin-bottom:20px;">' + i18next.t('tradeoffers.nooffers') + '</div>');
                chrome.browserAction.setBadgeText({text: ""});
            }
        }
    }).error(function (response) {
        var errorMessage = '';
        var msg = '';
        if (response.status === 429 && response.responseText === '') {
            userSignedOut();
        } else if (response.status === 429 && response.responseText) {
            var fatal = $(response.responseText).find('.profile_fatalerror');
            if (fatal.length) {
                msg = fatal.find('.profile_fatalerror_message').detach();
                fatal.find('.profile_fatalerror_links').remove();
                msg.find('button').click(function () {
                  var captcha_entry = msg.find('#captcha_entry').val()
                  $.ajax({
                    method: 'POST',
                    url: tradeURL,
                    data: {
                      captcha_entry: captcha_entry
                    }
                  }).done(function () {
                    console.log('sended');
                  });
                })
                // errorMessage = fatal;
                // fatal.find('[class^=profile_fatalerror]').remove();
                errorMessage = fatal.text().replace(/\s{2,100}/g, ' ').trim() + '<br/>';
                offersDivBlock.append(errorMessage).append(msg);
            } else {
                errorMessage = 'Oops. We are sorry, but something went wrong';
                offersDivBlock.append('Steam: ' + errorMessage + '<br /><a href="' + tradeURL + '" target="_blank">Please, check your trade offers page.</a>');
            }
        } else {
            errorMessage = 'Oops. We are sorry, but something went wrong';
            offersDivBlock.append('Steam: ' + errorMessage + '<br /><a href="' + tradeURL + '" target="_blank">Please, check your trade offers page.</a>');
        }
    });
}

function getTradesByAPI() {
    var offersDivBlock = $('#Div_Offers').html('');
    $.ajax({
        url: 'https://api.steampowered.com/IEconService/GetTradeOffers/v1/',
        data: {
            get_descriptions: 1,
            active_only: 1,
            get_received_offers: 1,
            key: window._apikey || apiKey
        }
    }).done(function (data) {
        var response = data.response;
        var active_offers = [];
        if (response && response.hasOwnProperty('trade_offers_received') && response.trade_offers_received.length) {
            var offers = response.trade_offers_received;
            var descriptions = response.descriptions;
            active_offers = offers.filter(function (offer) {
                return offer.trade_offer_state == g_tradeOfferState.Active;
            });
            active_offers.forEach(function (offer) {
                $.ajax({
                    method: 'GET',
                    url: 'http://steamcommunity.com/profiles/' + getSteamId(offer.accountid_other) + '/',
                    dataType: 'xml',
                    data: {
                        xml: 1
                    }
                }).done(function (response) {
                    var name = $(response).find('profile > steamID')[0];
                    var avatar = $(response).find('profile > avatarIcon')[0];
                    var tradeofferdiv;
                    if (name !== undefined && avatar !== undefined) {
                        var header = i18next.t('tradeoffers.offerfrom', {USERNAME: name.textContent}) + (offer.message.length ? ': ' + offer.message : '');
                        tradeofferdiv = nofSteam(offer.tradeofferid, avatar.textContent, header);
                    } else {
                        tradeofferdiv = nofSteam(offer.tradeofferid, chrome.runtime.getURL("assets/icon128.png"), 'You have offer');
                    }

                    var imgTheirs = [];  // items_to_give
                    if (offer.hasOwnProperty('items_to_give')) {
                        offer.items_to_give.forEach(function (offerItem) {
                            var img = document.createElement('img');
                            descriptions.forEach(function (desc) {
                                if (desc.classid == offerItem.classid && desc.instanceid == offerItem.instanceid) {
                                    img.src = 'http://steamcommunity-a.akamaihd.net/economy/image/' + desc.icon_url + '/48fx48f'
                                }
                            });
                            imgTheirs.push(img);
                        });
                    }

                    var imgYours = [];  // items_to_receive
                    if (offer.hasOwnProperty('items_to_receive')) {
                        offer.items_to_receive.forEach(function (offerItem) {
                            var img = document.createElement('img');
                            descriptions.forEach(function (desc) {
                                if (desc.classid == offerItem.classid && desc.instanceid == offerItem.instanceid) {
                                    img.src = 'http://steamcommunity-a.akamaihd.net/economy/image/' + desc.icon_url + '/32fx32f'
                                }
                            });
                            imgYours.push(img);
                        });
                    }

                    tradeofferdiv.addClass('offer-' + offer.tradeofferid);
                    tradeofferdiv.find('.offer-theirs').append(imgTheirs);
                    tradeofferdiv.find('.offer-yours').append(imgYours);
                    offersDivBlock.append(tradeofferdiv);

                    if (window.offertotalprice) {
                        getTradeCost(offer.tradeofferid);
                    }
                }).fail(function () {
                    console.log('Cant get Steam profile');
                });
            });

            if (active_offers.length) {
                offersDivBlock.prepend('<div style="margin-bottom:20px;" id="countoffers"><span id="title">' + i18next.t('tradeoffers.countoffers', {NUMBERS: ""+active_offers.length}) + '</span><br /> <a href="#" id="lnk_openall">' + i18next.t('tradeoffers.openall') + '</a> <a href="#" id="lnk_declineall">' + i18next.t('tradeoffers.declineall') + '</a> </div>');
                $('#lnk_openall').click(function () {
                    openAll();
                    return false;
                });
                $('#lnk_declineall').click(function () {
                    if (confirm('Are you sure?')) {
                        declineAll();
                    }
                    return false;
                });
            } else {
                offersDivBlock.prepend('<div style="margin-bottom:20px;">' + i18next.t('tradeoffers.nooffers') + '</div>');
            }
        } else {
            offersDivBlock.prepend('<div style="margin-bottom:20px;">' + i18next.t('tradeoffers.nooffers') + '</div>');
        }
        chrome.browserAction.setBadgeText({text: active_offers.length ? '' + active_offers.length : ''});
    }).fail(function (result) {
        offersDivBlock.append('Oops. We are sorry, but something went wrong (Steam Web API).');
    });
}

function getTradeCost(offerId) {
    $.ajax({
        method: 'GET',
        url: 'https://api.steampowered.com/IEconService/GetTradeOffer/v1/',
        data: {
            key: window._apikey,
            get_descriptions: 1,
            tradeofferid: offerId,
        },
        success: function (response) {
            var descriptions = response.response.descriptions;
            var itemsToReceive = collectItems(response.response.offer.items_to_receive || [], descriptions);
            var itemsToGive = collectItems(response.response.offer.items_to_give || [], descriptions);
            var receivePrice = 0, givePrice = 0;

            if (itemsToReceive.length) {
                $('.offer-' + offerId + ' div:first').append('<span class="offer-price">' + i18next.t('tradeoffers.theirprice') + ': <span class="price-theirs-' + offerId + '"></span></span>');
            }
            if (itemsToGive.length) {
                $('.offer-' + offerId + ' div:first').append('<span class="offer-price">' + i18next.t('tradeoffers.yourprice') + ': <span class="price-yours-' + offerId + '"></span></span>');
            }

            for (var i in descriptions) {
                if (descriptions[i].appid === undefined) return true;

                var item = descriptions[i];
                var id = [item.appid, item.classid, item.instanceid].join('_');
                var itemLink = 'https://steamcommunity.com/market/priceoverview/?appid=' + item.appid
                    + '&country=US&currency=1'
                    + '&market_hash_name=' + encodeURIComponent(item.market_hash_name);

                PriceQueue.GetPrice({
                    method: 'GET',
                    url: itemLink,
                    success: function (response) {
                        if (response.success && response.lowest_price) {
                            var price = getNumber(response.lowest_price);
                            // Это hotfix. Может неправильно считаться сумма если в "его" и "твоих" списках на обмен будут одиннаковые предметы
                            // TODO: Надо будет переделать функцию на classid и instanceid
                            if (itemsToReceive.indexOf(response.hashName) !== -1) {
                                receivePrice += parseFloat(price);
                                $('.price-theirs-' + offerId).text(v_currencyformat(receivePrice, 'USD'));
                            }
                            if (itemsToGive.indexOf(response.hashName) !== -1) {
                                givePrice += parseFloat(price);
                                $('.price-yours-' + offerId).text(v_currencyformat(givePrice, 'USD'));
                            }
                        }
                    },
                    error: function () {}
                });
            }
        },
        error: function () {}
    });
}

function collectItems(elements, description) {
    var data = elements.map((elem) => {
        const elemDesc = description.find(desc => desc.classid == elem.classid && desc.instanceid == elem.instanceid);
        return elemDesc.market_hash_name;
    });
    return data;
}
