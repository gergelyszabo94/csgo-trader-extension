/* global chrome document */
var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);

var sGlobal = document.createElement('script');
sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
(document.head || document.documentElement).appendChild(sGlobal);
sGlobal.onload = function () {
    sGlobal.parentNode.removeChild(sGlobal);
};

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/listings.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

sGen.onload = function () {
    sGen.parentNode.removeChild(sGen);
};

chrome.storage.sync.get({
    sound: 'offersound.ogg',
    resultnumber: 10,
    shownotify: true,
    quickbuybuttons: false,
    showbookmarks: true,
    show_float_value_listings: true,
    show_stickers_listings: true,
    bookmarkscategories: {},
    gpdelayscc: 2500,
    gpdelayerr: 5000,
    agp_hover: true,
    agp_gem: false,
    agp_sticker: false,
    show_orders_currencies: true,
    show_more_orders: true,
    orders_amount: 20,
    lang: ''
}, function (items) {
    chrome.storage.local.get({
        bookmarks: {}
    }, function (subitems) {
        var actualCode = ['window.replaceBuy = ' + items.quickbuybuttons + ';',
        'window.SIHID = \'' + chrome.runtime.id + '\';',
        'window.show_orders_currencies = ' + items.show_orders_currencies + ';',
        'window.show_more_orders = ' + items.show_more_orders + ';',
        'window.orders_amount = ' + items.orders_amount + ';',
        'window.noOfRows = ' + items.resultnumber + ';',
        'window.showbookmarks = ' + items.showbookmarks + ';',
        'window.bookmarkscategories = ' + JSON.stringify(items.bookmarkscategories) + ';',
        'window.bookmarks = ' + JSON.stringify(subitems.bookmarks) + ';',
        'window.bookmarksLink = \'' + chrome.runtime.getURL('/html/bookmarks.html') + '\';',
        'window.gpdelayscc = ' + items.gpdelayscc + ';',
        'window.gpdelayerr = ' + items.gpdelayerr + ';',
        'window.agp_hover = ' + items.agp_hover + ';',
        'window.show_float_value_listings = ' + items.show_float_value_listings + ';',
        'window.show_stickers_listings = ' + items.show_stickers_listings + ';',
        'window.agp_gem = ' + items.agp_gem + ';',
        'window.agp_sticker = ' + items.agp_sticker + ';'
        ].join('\r\n');

        var sData = document.createElement('script');
        sData.textContent = actualCode;
        (document.head || document.documentElement).appendChild(sData);
        sData.parentNode.removeChild(sData);
    });

    var sLang = document.createElement('script');
    if (items.lang == '') {
        sLang.src = chrome.runtime.getURL('js/lang/' + chrome.i18n.getMessage("langcode") + '.js');
    } else {
        sLang.src = chrome.runtime.getURL('js/lang/' + items.lang + '.js');
    }

    (document.head || document.documentElement).appendChild(sLang);
    sLang.onload = function () {
        sLang.parentNode.removeChild(sLang);
    };
});

var sPriceQueue = document.createElement('script');
sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
(document.head || document.documentElement).appendChild(sPriceQueue);
sPriceQueue.onload = function () {
    var sCommon = document.createElement('script');
    sCommon.src = chrome.runtime.getURL('js/hovermod.script.js');
    (document.head || document.documentElement).appendChild(sCommon);
    sCommon.onload = function () {
        var sOffer = document.createElement('script');
        sOffer.src = chrome.runtime.getURL('js/listing.script.js');
        (document.head || document.documentElement).appendChild(sOffer);
        sOffer.onload = function () {
            sOffer.parentNode.removeChild(sOffer);
        };

        sCommon.parentNode.removeChild(sCommon);
    };
    sPriceQueue.parentNode.removeChild(sPriceQueue);
};

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);
