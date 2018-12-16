window.CSGO_ORIGINS = null;
$.getJSON(chrome.runtime.getURL('/assets/json/csgo_origin_names.json'), (data) => {
  CSGO_ORIGINS = data;
});

window.PROVIDERS_LIST = null;
$.getJSON(chrome.runtime.getURL('/assets/json/providers.json'), (data) => {
  PROVIDERS_LIST = data.sort((a, b) => {
    return ((a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0);
  });
});

var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
    sGen.parentNode.removeChild(sGen);
};

var sCacher = document.createElement('script');
sCacher.src = chrome.runtime.getURL('bundle/js/RequestCacher.js');
(document.head || document.documentElement).appendChild(sCacher);
sCacher.onload = function () {
    sCacher.parentNode.removeChild(sCacher);
};

var sPriceQueue = document.createElement('script');
sPriceQueue.src = chrome.runtime.getURL('js/PriceQueue.js');
(document.head || document.documentElement).appendChild(sPriceQueue);
sPriceQueue.onload = function () {
    sPriceQueue.parentNode.removeChild(sPriceQueue);
};

var cssPQ = document.createElement('link');
cssPQ.href = chrome.runtime.getURL('css/priceQueue.css');
cssPQ.rel = 'stylesheet';
cssPQ.type = 'text/css';
(document.head || document.documentElement).appendChild(cssPQ);

var sHelper = document.createElement('script');
sHelper.src = chrome.runtime.getURL('js/helper.js');
(document.head || document.documentElement).appendChild(sHelper);
sHelper.onload = function () {
    sHelper.parentNode.removeChild(sHelper);
};

var sGlobal = document.createElement('script');
sGlobal.src = chrome.runtime.getURL('js/steam/global.js');
(document.head || document.documentElement).appendChild(sGlobal);
sGlobal.onload = function () {
    sGlobal.parentNode.removeChild(sGlobal);
};

var sScroll = document.createElement('script');
sScroll.src = chrome.runtime.getURL('js/jquery/jquery.scrollbar.min.js');
(document.head || document.documentElement).appendChild(sScroll);
sScroll.onload = function () {
    sScroll.parentNode.removeChild(sScroll);
};

var cssF = document.createElement('link');
cssF.href = chrome.runtime.getURL('css/inventscript.css');
cssF.rel = 'stylesheet';
cssF.type = 'text/css';
(document.head || document.documentElement).appendChild(cssF);

var cssM = document.createElement('link');
cssM.href = window.location.protocol + '//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css';
cssM.rel = 'stylesheet';
cssM.type = 'text/css';
(document.head || document.documentElement).appendChild(cssM);

var cssC = document.createElement('link');
cssC.href = chrome.runtime.getURL('css/jquery.scrollbar.css');
cssC.rel = 'stylesheet';
cssC.type = 'text/css';
(document.head || document.documentElement).appendChild(cssC);

chrome.storage.sync.get({
    fastdelta: -0.01,
    delaylistings: 200,
    quicksellbuttons: true,
    instantsellbuttons: false,
    buysetbuttons: true,
    selectallbuttons: true,
    inventoryprice: true,
    currency: '',
    lang: '',
    apikey: '',
    gpdelayscc: 2500,
    gpdelayerr: 5000,
    agp_hover: true,
    agp_gem: false,
    agp_sticker: false,
    usevector: false,
    simplyinvent: false,
    hidedefaultprice: false,
    extprice: true,
    extmasslisting: false,
    extbgcolor: '#0000FF',
    exttextcolor: '#FFFFFF',
    userUrl: '//steamcommunity.com/my/',
    show_float_value: true,
    tradableinfo: false
}, function (items) {
    var actualCode = [
      `window.SIHID = '${chrome.runtime.id}';`,
      `window.PROVIDERS_LIST = ${JSON.stringify(PROVIDERS_LIST)}`,
      `window.CSGO_ORIGINS = ${JSON.stringify(CSGO_ORIGINS)}`,
    ];
    // var actualCode = ['window.fastdelta = ' + items.fastdelta + ';',
    //     'window.delaylistings = ' + items.delaylistings + ';',
    //     'window.quicksellbuttons = ' + items.quicksellbuttons + ';',
    //     'window.instantsellbuttons = ' + items.instantsellbuttons + ';',
    //     'window.buysetbuttons = ' + items.buysetbuttons + ';',
    //     'window.selectallbuttons = ' + items.selectallbuttons + ';',
    //     'window.inventoryprice = ' + items.inventoryprice + ';',
    //     'window.usevector = ' + items.usevector + ';',
    //     'window.currency = \'' + items.currency + '\';',
    //     'window._apikey = \'' + items.apikey + '\';',
    //     'window.hidedefaultprice = ' + items.hidedefaultprice + ';',
    //     'window.simplyinvent = ' + items.simplyinvent + ';',
    //     'window.gpdelayscc = ' + items.gpdelayscc + ';',
    //     'window.gpdelayerr = ' + items.gpdelayerr + ';',
    //     'window.agp_gem = ' + items.agp_gem + ';',
    //     'window.agp_sticker = ' + items.agp_sticker + ';',
    //     'window.extprice = ' + items.extprice + ';',
    //     'window.use_provider = ' + items.use_provider + ';',
    //     'window.provider_code = "' + items.provider_code + '";',
    //     'window.extmasslisting = ' + items.extmasslisting + ';',
    //     'window.SIHID = \'' + chrome.runtime.id + '\';',
    //     'window.userUrl = \'' + items.userUrl + '\';',
    //     'window.show_float_value = ' + items.show_float_value + ';',
    //     'window.tradableinfo = ' + items.tradableinfo + ';'
    // ].join('\r\n');
    Object.keys(items).forEach((key) => {
        let prepValue;
        const value = items[key];
        if (typeof value === 'string') prepValue = `window.${key} = '${value}';`;
        else if (Array.isArray(value)) prepValue = `window.${key} = ${value};`;
        else if (typeof value === 'object') prepValue = `window.${key} = ${JSON.stringify(value)};`;
        else prepValue = `window.${key} = ${value};`;

        actualCode.push(prepValue);
    });
    if (items.simplyinvent) {
        $('body').addClass('simple');
    }

    chrome.storage.local.get({
        bookmarks: []
    }, function (subitems) {
        var actualCodeLocal = [
            'window.bookmarkeditems = ' + (JSON.stringify(subitems.bookmarks)) + ';'
        ].join('\r\n');

        var scriptsub = document.createElement('script');
        scriptsub.textContent = actualCodeLocal;
        (document.head || document.documentElement).appendChild(scriptsub);
        scriptsub.parentNode.removeChild(scriptsub);
    });

    // modStyle({ extbgcolor: items.extbgcolor, exttextcolor: items.exttextcolor });
    var script = document.createElement('script');
    script.textContent = actualCode.join('\r\n');
    // script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);

    var sLang = document.createElement('script');
    if (items.lang == '') {
        sLang.src = chrome.runtime.getURL('js/lang/' + chrome.i18n.getMessage("langcode") + '.js');
    } else {
        sLang.src = chrome.runtime.getURL('js/lang/' + items.lang + '.js');
    }

    (document.head || document.documentElement).appendChild(sLang);
    sLang.onload = function () {
        sLang.parentNode.removeChild(sLang);
        //ReloadLang();

        var sCommon = document.createElement('script');
        sCommon.src = chrome.runtime.getURL('js/inventprice.script.js');
        (document.head || document.documentElement).appendChild(sCommon);
        sCommon.onload = function () {
            sCommon.parentNode.removeChild(sCommon);
        };
    };
});
