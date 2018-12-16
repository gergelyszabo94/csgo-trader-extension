var g_OnWebPanelShownHandlers = Array();
function SteamOnWebPanelShown() {
    for (var i = 0; i < g_OnWebPanelShownHandlers.length; i++) {
        g_OnWebPanelShownHandlers[i]();
    }
}
function RegisterSteamOnWebPanelShownHandler(f) {
    g_OnWebPanelShownHandlers.push(f);
}

var g_OnWebPanelHiddenHandlers = Array();
function SteamOnWebPanelHidden() {
    for (var i = 0; i < g_OnWebPanelHiddenHandlers.length; i++) {
        g_OnWebPanelHiddenHandlers[i]();
    }
}

function RegisterSteamOnWebPanelHiddenHandler(f) {
    g_OnWebPanelHiddenHandlers.push(f);
}

function RefreshNotificationArea() {
    // the new way - updates both the old envelope and responsive menu
    UpdateNotificationCounts();
}

function vIE() {
    return (navigator.appName == 'Microsoft Internet Explorer') ? parseFloat((new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})")).exec(navigator.userAgent)[1]) : -1;
}

function checkAbuseSub(elForm) {
    if (!$J(elForm).find('input[name=abuseType]:checked').length) {
        alert('Please select a reason for reporting abuse');
        return false;
    }

    CModal.DismissActiveModal();

    var params = $J(elForm).serializeArray();
    params.push({ name: 'json', value: 1 });

    $J.post('http://steamcommunity.com/actions/ReportAbuse/', params).done(function () {
        ShowAlertDialog('Thank You!', 'Thank you for reporting offensive content and helping to keep the Steam Community clean and friendly.');
    }).fail(function () {
        ShowAlertDialog('Report Violation', 'There was a problem saving your report.  Please try again later.');
    });
    return false;
}

var g_whiteListedDomains = [
    "steampowered.com",
    "steamgames.com",
    "steamcommunity.com",
    "valvesoftware.com",
    "youtube.com",
    "youtu.be",
    "live.com",
    "msn.com",
    "myspace.com",
    "facebook.com",
    "hi5.com",
    "wikipedia.org",
    "orkut.com",
    "blogger.com",
    "friendster.com",
    "fotolog.net",
    "google.fr",
    "baidu.com",
    "microsoft.com",
    "shacknews.com",
    "bbc.co.uk",
    "cnn.com",
    "foxsports.com",
    "pcmag.com",
    "nytimes.com",
    "flickr.com",
    "amazon.com",
    "veoh.com",
    "pcgamer.com",
    "metacritic.com",
    "fileplanet.com",
    "gamespot.com",
    "gametap.com",
    "ign.com",
    "kotaku.com",
    "xfire.com",
    "pcgames.gwn.com",
    "gamezone.com",
    "gamesradar.com",
    "digg.com",
    "engadget.com",
    "gizmodo.com",
    "gamesforwindows.com",
    "xbox.com",
    "cnet.com",
    "l4d.com",
    "teamfortress.com",
    "tf2.com",
    "half-life2.com",
    "aperturescience.com",
    "dayofdefeat.com",
    "dota2.com",
    "playdota.com",
    "kickstarter.com",
    "gamingheads.com",
    "reddit.com",
    "counter-strike.net",
    "imgur.com"
];

function getHostname(str) {
    var re = new RegExp('^(steam://openurl(_external)?/)?(f|ht)tps?://([^@]*@)?([^/#?]+)', 'im');
    return str.match(re)[5].toString();
}

function AlertNonSteamSite(elem) {
    var url = elem.href;
    var hostname = getHostname(url);
    if (hostname) {
        hostname = hostname.toLowerCase();
        for (var i = 0; i < g_whiteListedDomains.length; ++i) {
            var index = hostname.lastIndexOf(g_whiteListedDomains[i]);
            if (index != -1 && index == (hostname.length - g_whiteListedDomains[i].length)
                && (index == 0 || hostname.charAt(index - 1) == '.')) {
                return true;
            }
        }
        return confirm('Note: the URL you have clicked on is not an official Steam web site.\n\n'
            + url.replace(new RegExp('^steam://openurl(_external)?/'), '') + '\n\n'
            + 'If this web site asks for your user name or password, do not enter that information. You could lose your Steam account and all your games!\n'
            + 'Are you sure you want to visit this page? Click OK to continue at your own risk.\n');
    }

    ShowAlertDialog('', 'The URL is badly formed.');
    return false;
}

var lastFilters = new Object();
function FilterListFast(target, str) {
    var lastFilter = lastFilters[target];
    if (!lastFilter)
        lastFilter = '';

    str = str.toLowerCase();
    if (str == lastFilter)
        return false;

    var expanding = false;
    var contracting = false;
    if (str.length > lastFilter.length && str.startsWith(lastFilter))
        expanding = true;
    if (!str || str.length < lastFilter.length && lastFilter.startsWith(str))
        contracting = true;

    var strParts = str.split(/\W/);

    var elemTarget = $(target);
    var elemParent = elemTarget.parentNode;
    elemParent.removeChild(elemTarget);

    var rgChildren = elemTarget.childNodes;
    for (var i = 0; i < rgChildren.length; i++) {
        var child = rgChildren[i];
        if (child.nodeType != child.ELEMENT_NODE)
            continue;
        if (expanding && child.style.display == 'none' || contracting && child.style.display != 'none')
            continue;
        if (!child.lcText)
            child.lcText = (child.innerText || child.textContent).toLowerCase();

        var text = child.lcText;
        var show = true;
        for (var iPart = 0; show && iPart < strParts.length; iPart++)
            if (!text.include(strParts[iPart]))
                show = false;

        if (show)
            child.style.display = '';
        else
            child.style.display = 'none';
    }
    lastFilters[target] = str;
    elemParent.appendChild(elemTarget);
    return true;
}


// goes into fullscreen, returning false if the browser doesn't support it
function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) {
        // Native full screen.
        requestMethod.call(element);
        return true;
    }

    return false;
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
}

function RecordAJAXPageView(url) {
    if (typeof ga != "undefined" && ga) {
        var rgURLs = ['http://steamcommunity.com', 'http://steamcommunity.com'];
        for (var i = 0; i < rgURLs.length; ++i) {
            var baseURL = rgURLs[i];
            var idx = url.indexOf(baseURL);
            if (idx != -1) {
                url = url.substring(idx + baseURL.length);
            }
            ga('send', 'pageview', url);
            return;
        }
    }
}

// doesn't properly handle cookies with ; in them (needs to look for escape char)
function GetCookie(strCookieName) {
    var rgMatches = document.cookie.match('(^|; )' + strCookieName + '=([^;]*)');
    if (rgMatches && rgMatches[2])
        return rgMatches[2];
    else
        return null;
}

function SetCookie(strCookieName, strValue, expiryInDays, path) {
    if (!expiryInDays)
        expiryInDays = 0;
    if (!path)
        path = '/';

    var dateExpires = new Date();
    dateExpires.setTime(dateExpires.getTime() + 1000 * 60 * 60 * 24 * expiryInDays);
    document.cookie = strCookieName + '=' + strValue + '; expires=' + dateExpires.toGMTString() + ';path=' + path;
}

// included data: strCode, eCurrencyCode, strSymbol, bSymbolIsPrefix, bWholeUnitsOnly
g_rgCurrencyData = { "USD": { "strCode": "USD", "eCurrencyCode": 1, "strSymbol": "$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "GBP": { "strCode": "GBP", "eCurrencyCode": 2, "strSymbol": "\u00a3", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "EUR": { "strCode": "EUR", "eCurrencyCode": 3, "strSymbol": "\u20ac", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": "" }, "CHF": { "strCode": "CHF", "eCurrencyCode": 4, "strSymbol": "CHF", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": " " }, "RUB": { "strCode": "RUB", "eCurrencyCode": 5, "strSymbol": "p\u0443\u0431.", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": "", "strSymbolAndNumberSeparator": " " }, "BRL": { "strCode": "BRL", "eCurrencyCode": 7, "strSymbol": "R$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "JPY": { "strCode": "JPY", "eCurrencyCode": 8, "strSymbol": "\u00a5", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "NOK": { "strCode": "NOK", "eCurrencyCode": 9, "strSymbol": "kr", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "IDR": { "strCode": "IDR", "eCurrencyCode": 10, "strSymbol": "Rp", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": " " }, "MYR": { "strCode": "MYR", "eCurrencyCode": 11, "strSymbol": "RM", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "PHP": { "strCode": "PHP", "eCurrencyCode": 12, "strSymbol": "P", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "SGD": { "strCode": "SGD", "eCurrencyCode": 13, "strSymbol": "S$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "THB": { "strCode": "THB", "eCurrencyCode": 14, "strSymbol": "\u0e3f", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "VND": { "strCode": "VND", "eCurrencyCode": 15, "strSymbol": "\u20ab", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": "" }, "KRW": { "strCode": "KRW", "eCurrencyCode": 16, "strSymbol": "\u20a9", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "TRY": { "strCode": "TRY", "eCurrencyCode": 17, "strSymbol": "TL", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "UAH": { "strCode": "UAH", "eCurrencyCode": 18, "strSymbol": "\u20b4", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": "" }, "MXN": { "strCode": "MXN", "eCurrencyCode": 19, "strSymbol": "Mex$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "CAD": { "strCode": "CAD", "eCurrencyCode": 20, "strSymbol": "CDN$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "AUD": { "strCode": "AUD", "eCurrencyCode": 21, "strSymbol": "A$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "NZD": { "strCode": "NZD", "eCurrencyCode": 22, "strSymbol": "NZ$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "PLN": { "strCode": "PLN", "eCurrencyCode": 6, "strSymbol": "z\u0142", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": "" }, "CNY": { "strCode": "CNY", "eCurrencyCode": 23, "strSymbol": "\u00a5", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "INR": { "strCode": "INR", "eCurrencyCode": 24, "strSymbol": "\u20b9", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "CLP": { "strCode": "CLP", "eCurrencyCode": 25, "strSymbol": "CLP$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "PEN": { "strCode": "PEN", "eCurrencyCode": 26, "strSymbol": "S\/.", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "COP": { "strCode": "COP", "eCurrencyCode": 27, "strSymbol": "COL$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "ZAR": { "strCode": "ZAR", "eCurrencyCode": 28, "strSymbol": "R", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": " " }, "HKD": { "strCode": "HKD", "eCurrencyCode": 29, "strSymbol": "HK$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "TWD": { "strCode": "TWD", "eCurrencyCode": 30, "strSymbol": "NT$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "SAR": { "strCode": "SAR", "eCurrencyCode": 31, "strSymbol": "SR", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "AED": { "strCode": "AED", "eCurrencyCode": 32, "strSymbol": "AED", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "ARS": { "strCode": "ARS", "eCurrencyCode": 34, "strSymbol": "ARS$", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": " " }, "ILS": { "strCode": "ILS", "eCurrencyCode": 35, "strSymbol": "\u20aa", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "BYN": { "strCode": "BYN", "eCurrencyCode": 36, "strSymbol": "Br", "bSymbolIsPrefix": true, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" }, "KZT": { "strCode": "KZT", "eCurrencyCode": 37, "strSymbol": "\u20b8", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": " ", "strSymbolAndNumberSeparator": "" }, "KWD": { "strCode": "KWD", "eCurrencyCode": 38, "strSymbol": "KD", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "QAR": { "strCode": "QAR", "eCurrencyCode": 39, "strSymbol": "QR", "bSymbolIsPrefix": false, "bWholeUnitsOnly": false, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": " " }, "CRC": { "strCode": "CRC", "eCurrencyCode": 40, "strSymbol": "\u20a1", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": "" }, "UYU": { "strCode": "UYU", "eCurrencyCode": 41, "strSymbol": "$U", "bSymbolIsPrefix": true, "bWholeUnitsOnly": true, "strDecimalSymbol": ",", "strThousandsSeparator": ".", "strSymbolAndNumberSeparator": "" }, "RMB": { "strCode": "RMB", "eCurrencyCode": 9000, "strSymbol": "\u5200\u5e01", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": "", "strSymbolAndNumberSeparator": " " }, "NXP": { "strCode": "NXP", "eCurrencyCode": 9001, "strSymbol": "\uc6d0", "bSymbolIsPrefix": false, "bWholeUnitsOnly": true, "strDecimalSymbol": ".", "strThousandsSeparator": ",", "strSymbolAndNumberSeparator": "" } };


// takes an integer
function v_currencyformat(valueInCents, currencyCode, countryCode) {
  var currencyFormat = `${parseInt(valueInCents = Math.abs(+valueInCents / 100 || 0).toFixed(2), 10)}`;

  if (g_rgCurrencyData[currencyCode]) {
    var currencyData = g_rgCurrencyData[currencyCode];

    const j = (currencyFormat.length > 3 ? currencyFormat.length % 3 : 0);
    const thousand_formatted = `${j ? currencyFormat.substr(0, j) + currencyData.strThousandsSeparator : ''}${currencyFormat.substr(j).replace(/(\d{3})(?=\d)/g, `$1${currencyData.strThousandsSeparator}`)}`;
    const decimal_formatted = `${currencyData.strDecimalSymbol}${Math.abs(valueInCents - currencyFormat).toFixed(2).slice(2)}`;
    const formatted = `${thousand_formatted}${currencyData.bWholeUnitsOnly ? decimal_formatted.replace(`${currencyData.strDecimalSymbol}00`, '') : decimal_formatted}`;


    var currencyReturn = currencyData.bSymbolIsPrefix
      ? `${currencyData.strSymbol}${currencyData.strSymbolAndNumberSeparator}${formatted}`
      : `${formatted}${currencyData.strSymbolAndNumberSeparator}${currencyData.strSymbol}`;

    if (currencyCode == 'USD' && typeof (countryCode) != 'undefined' && countryCode != 'US') {
      return currencyReturn + ' USD';
    }
    else if (currencyCode == 'EUR') {
      return currencyReturn.replace(',00', ',--');
    }
    else {
      return currencyReturn;
    }
  }
  else {
    return currencyFormat + ' ' + currencyCode;
  }
}


function IsCurrencySymbolBeforeValue(currencyCode) {
    return g_rgCurrencyData[currencyCode] && g_rgCurrencyData[currencyCode].bSymbolIsPrefix;
}

function IsCurrencyWholeUnits(currencyCode) {
    return g_rgCurrencyData[currencyCode] && g_rgCurrencyData[currencyCode].bWholeUnitsOnly && currencyCode != 'RUB';
}

// Return the symbol to use for a currency
function GetCurrencySymbol(currencyCode) {
    return g_rgCurrencyData[currencyCode] ? g_rgCurrencyData[currencyCode].strSymbol : currencyCode + ' ';
}

function GetCurrencyCode(currencyId) {
    for (var code in g_rgCurrencyData) {
        if (g_rgCurrencyData[code].eCurrencyCode == currencyId)
            return code;
    }
    return 'Unknown';
}

function GetCurrencySymbolFromString(stringWithSymbol) {
    const re = /(?:AED|ARS\$|A\$|R\$|Br|CDN\$|CHF|CLP\$|¥|COL\$|₡|€|£|HK\$|Rp|₪|₹|¥|₩|KD|₸|Mex\$|RM|kr|원|NZ\$|S\/\.|P|zł|QR|刀币|pуб\.|SR|S\$|฿|TL|NT\$|₴|\$|\$U|₫|R)/;
    const matched = stringWithSymbol.match(re);
    return matched ? matched[0] : '';
}

function GetCurrencyCodeBySymbol(currencySign) {
    const currencyCode = Object.keys(g_rgCurrencyData).find(code => g_rgCurrencyData[code].strSymbol === currencySign);
    return currencyCode || '';
}

function formatNumber(totalPrice) {
    if (v_currencyformat && GetCurrencyCode && (typeof (currencyId) != 'undefined' || typeof (g_rgWalletInfo) != 'undefined')) {
        if (typeof (currencyId) != 'undefined') {
            return v_currencyformat(totalPrice * 100, GetCurrencyCode(parseInt(currencyId)));
        } else {
            return v_currencyformat(totalPrice * 100, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
        }
    }

    var totalStr = totalPrice.toFixed(2) + '';
    if (totalStr.lastIndexOf('.') == -1) totalStr += '.00';
    //totalStr = totalStr.replace(/(\d)(\d{3})([,\.])/, '$1,$2$3');
    return totalStr;
}

function getPriceAsInt(priceStr) {
    // var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, '').replace(/[^\d,\.]/g, '').replace(/[^\d]$/g, ''));
    // pp = pp ? pp[1].replace(/,(\d\d)$/g, '.$1').replace(/\.(\d\d\d)/g, '$1').replace(/,(\d\d\d)/g, '$1') : 0;
    if (!priceStr) return 0;

    const strSymbol = GetCurrencySymbolFromString(priceStr)
    const ccode = GetCurrencyCodeBySymbol(strSymbol) || GetCurrencyCode(currencyId);
    let pp = priceStr
        .replace(/,/g, '.')
        .replace(strSymbol, '')
        .replace(ccode, '')
        .replace('.--', '.00')
        .replace(/ /g, '');

    // Remove all but the last period so that entries like "1,147.6" work
    if (pp.indexOf('.') != -1) {
        const splitAmount = pp.split('.');
        const strLastSegment = splitAmount[splitAmount.length - 1];

        if (!isNaN(strLastSegment) && strLastSegment.length == 3 && splitAmount[splitAmount.length - 2] != '0') {
            pp = splitAmount.join('');
        } else {
            pp = splitAmount.slice(0, -1).join('') + '.' + strLastSegment;
        }
    }

    const flAmount = parseFloat(pp) * 100;
    let nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount + 0.000001); // round down

    nAmount = Math.max(nAmount, 0);
    return nAmount;
}

function getSteamId(accountId) {
    return new dcodeIO.Long(parseInt(accountId, 10), 0x1100001).toString();
}

function getAccountId(steamId) {
    return dcodeIO.Long.fromString(steamId).toInt().toString();
}

const VALID_LANGUAGES = [
    'bg', 'cs', 'de', 'en', 'es', 'fr', 'it', 'ka', 'lv', 'no', 'pl', 'pt',
    'ro', 'ru', 'sv', 'tr', 'vi', 'uk', 'zh', 'zh-CN', 'zh-TW'
];

function detectUserLanguage() {
    let navLang;

    if (window.navigator.languages && window.navigator.languages.length > 0) {
        navLang = window.navigator.languages[0];
    }
    if (!navLang) {
        navLang = window.navigator.language || window.navigator.userLanguage || '';
    }

    // const matched = navLang.toLowerCase().match(/^(.{2})/);
    // return (matched && VALID_LANGUAGES.includes(matched[1])) ? matched[1] : 'en';
    return (VALID_LANGUAGES.includes(navLang)) ? navLang : 'en';
}

/**
 * Gets the country code of store region.
 */
const getStoreRegionCountryCode = () => {
    let cc = 'us';
    const cookies = document.cookie;
    let matched = cookies.match(/fakeCC=([a-z]{2})/i);
    if (matched != null && matched.length === 2) {
        cc = matched[1];
    } else {
        matched = cookies.match(/steamCC(?:_\d+){4}=([a-z]{2})/i);
        if (matched != null && matched.length === 2) {
            cc = matched[1];
        } else {
            matched = cookies.match(/steamCountry=([a-z]{2})/i);
            if (matched != null && matched.length === 2) {
                cc = matched[1];
            }
        }
    }
    return cc;
};

// https://developer.valvesoftware.com/wiki/Steam_Web_API/IEconService#ETradeOfferState
g_tradeOfferState = {
    'Invalid': 1,  // Invalid
    'Active': 2,  // This trade offer has been sent, neither party has acted on it yet.
    'Accepted': 3,  // The trade offer was accepted by the recipient and items were exchanged.
    'Countered': 4,  // The recipient made a counter offer
    'Expired': 5,  // The trade offer was not accepted before the expiration date
    'Canceled': 6,  // The sender cancelled the offer
    'Declined': 7,  // The recipient declined the offer
    'InvalidItems': 8,  // Some of the items in the offer are no longer available (indicated by the missing flag in the output)
    'CreatedNeedsConfirmation': 9,  // The offer hasn't been sent yet and is awaiting email/mobile confirmation. The offer is only visible to the sender.
    'CanceledBySecondFactor': 10,  // Either party canceled the offer via email/mobile. The offer is visible to both parties, even if the sender canceled it before it was sent.
    'InEscrow': 11  // The trade has been placed on hold. The items involved in the trade have all been removed from both parties' inventories and will be automatically delivered in the future.
};

function GetAvatarURLFromHash(hash, size) {
    var strURL = 'http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/' + hash.substring(0, 2) + '/' + hash;

    if (size == 'full')
        strURL += '_full.jpg';
    else if (size == 'medium')
        strURL += '_medium.jpg';
    else
        strURL += '.jpg';

    return strURL;
}

// need to hold on to this so it doesn't get lost when we remove() the dialog element
var g_AbuseModalContents = null;
function ShowAbuseDialog() {
    if (!g_AbuseModalContents)
        g_AbuseModalContents = $J('#reportAbuseModalContents');

    if (g_AbuseModalContents) {
        var Modal = ShowDialog('Report Violation', g_AbuseModalContents);
    }
}

function StandardCommunityBan(steamid, elemLink) {
    $J.get('http://steamcommunity.com/actions/communitybandialog', { 'sessionID': g_sessionID, 'steamID': steamid })
        .done(function (data) {
            var $Content = $J(data);
            var Modal = ShowConfirmDialog("Community Ban & Content Removal", $Content, 'Submit'
            ).done(function () {

                var $Form = $Content.find('form#community_ban_form');

                $J.post("http://steamcommunity.com/actions/StandardCommunityBan", $Form.serialize())
                    .done(function (data) {
                        if (!$J.isEmptyObject(elemLink)) {
                            $J(elemLink).replaceWith('<span style="color: red;">Banned</span>');
                        }
                        else {
                            location.reload();
                        }

                    }).fail(function (jqxhr) {
                        // jquery doesn't parse json on fail
                        var data = V_ParseJSON(jqxhr.responseText);
                        ShowAlertDialog('Community Ban & Delete Comments', 'Failed with error message: ' + data.success);
                    });
            });

        }).fail(function (data) {
            ShowAlertDialog('Community Ban & Delete Comments', 'You do not have permissions to view this or you are not logged in.');
        });

}

function CEmoticonPopup($EmoticonButton, $Textarea) {
    this.m_$EmoticonButton = $EmoticonButton;
    this.m_$TextArea = $Textarea;

    if (CEmoticonPopup.sm_deferEmoticonsLoaded == null)
        CEmoticonPopup.sm_deferEmoticonsLoaded = new jQuery.Deferred();

    this.m_bVisible = false;
    this.m_$Popup = null;

    var _this = this;
    this.m_$EmoticonButton.one('mouseenter', function () { _this.LoadEmoticons(); });
    this.m_$EmoticonButton.click(function () { _this.LoadEmoticons(); CEmoticonPopup.sm_deferEmoticonsLoaded.done(function () { _this.OnButtonClick(); }) });
    this.m_fnOnDocumentClick = function () { _this.DismissPopup(); };
}

CEmoticonPopup.sm_rgEmoticons = [];
CEmoticonPopup.sm_bEmoticonsLoaded = false;
CEmoticonPopup.sm_deferEmoticonsLoaded = null;

CEmoticonPopup.prototype.LoadEmoticons = function () {
    if (CEmoticonPopup.sm_bEmoticonsLoaded)
        return;

    CEmoticonPopup.sm_bEmoticonsLoaded = true;
    CEmoticonPopup.sm_rgEmoticons = [];
    $J.get('http://steamcommunity.com/actions/EmoticonList')
        .done(function (data) {
            if (data)
                CEmoticonPopup.sm_rgEmoticons = data;
        }).always(function () { CEmoticonPopup.sm_deferEmoticonsLoaded.resolve() });
};

CEmoticonPopup.prototype.OnButtonClick = function () {
    if (this.m_bVisible) {
        this.DismissPopup();
    }
    else {
        if (!this.m_$Popup)
            this.BuildPopup();
        else
            PositionEmoticonHover(this.m_$Popup, this.m_$EmoticonButton);

        this.m_$EmoticonButton.addClass('focus');
        this.m_$Popup.stop();
        this.m_$Popup.fadeIn('fast');
        this.m_bVisible = true;

        if (window.UseSmallScreenMode && window.UseSmallScreenMode()) {
            // scroll such that the emoticon button is just above the popup window we're showing at the bottom of the screen
            // 	the 10 pixels represents the popup being positioned 5px from the bottom of the screen, and 5px between the popup and button
            $J(window).scrollTop(this.m_$EmoticonButton.offset().top - $J(window).height() + this.m_$Popup.height() + this.m_$EmoticonButton.height() + 10);
        }

        var _this = this;
        window.setTimeout(function () { $J(document).one('click.EmoticonPopup', _this.m_fnOnDocumentClick) }, 0);
    }
};

CEmoticonPopup.prototype.DismissPopup = function () {
    this.m_$Popup.fadeOut('fast');
    this.m_$EmoticonButton.removeClass('focus');
    this.m_bVisible = false;

    $J(document).off('click.EmoticonPopup');
};

CEmoticonPopup.prototype.BuildPopup = function () {
    this.m_$Popup = $J('<div/>', { 'class': 'emoticon_popup_ctn' });

    var $PopupInner = $J('<div/>', { 'class': 'emoticon_popup' });
    this.m_$Popup.append($PopupInner);
    var $Content = $J('<div/>', { 'class': 'emoticon_popup_content' });
    $PopupInner.append($Content);

    for (var i = 0; i < CEmoticonPopup.sm_rgEmoticons.length; i++) {
        var strEmoticonName = CEmoticonPopup.sm_rgEmoticons[i].replace(/:/g, '');
        var strEmoticonURL = 'http://steamcommunity-a.akamaihd.net/economy/emoticon/' + strEmoticonName;

        var $Emoticon = $J('<div/>', { 'class': 'emoticon_option', 'data-emoticon': strEmoticonName });
        var $Img = $J('<img/>', { 'src': strEmoticonURL, 'class': 'emoticon' });
        $Emoticon.append($Img);

        $Emoticon.click(this.GetEmoticonClickClosure(strEmoticonName));

        $Content.append($Emoticon);
    }

    $J(document.body).append(this.m_$Popup);
    PositionEmoticonHover(this.m_$Popup, this.m_$EmoticonButton);
};

CEmoticonPopup.prototype.GetEmoticonClickClosure = function (strEmoticonName) {
    var _this = this;
    var strTextToInsert = ':' + strEmoticonName + ':';
    return function () {
        var elTextArea = _this.m_$TextArea[0];
        if (elTextArea) {
            var nSelectionStart = elTextArea.selectionStart;
            elTextArea.value = elTextArea.value.substr(0, nSelectionStart) + strTextToInsert + elTextArea.value.substr(nSelectionStart);
            elTextArea.selectionStart = nSelectionStart + strTextToInsert.length;
        }

        _this.m_$TextArea.focus();

        _this.DismissPopup();

        if (window.DismissEmoticonHover)
            window.setTimeout(DismissEmoticonHover, 1);
    };
};

function PositionEmoticonHover($Hover, $Target) {
    // we position fixed in CSS for responsive mode
    if (window.UseSmallScreenMode && window.UseSmallScreenMode()) {
        $Hover.css('left', '').css('top', '');
        return;
    }

    $Hover.css('visibility', 'hidden');
    $Hover.show();

    var offset = $Target.offset();
    $Hover.css('left', offset.left + 'px');
    $Hover.css('top', offset.top + 'px');

    var $HoverBox = $Hover.children('.emoticon_popup');
    var $HoverArrowLeft = $Hover.children('.miniprofile_arrow_left');
    var $HoverArrowRight = $Hover.children('.miniprofile_arrow_right');

    var nWindowScrollTop = $J(window).scrollTop();
    var nWindowScrollLeft = $J(window).scrollLeft();
    var nViewportWidth = $J(window).width();
    var nViewportHeight = $J(window).height();

    var $HoverArrow = $HoverArrowRight;
    var nBoxRightViewport = (offset.left - nWindowScrollLeft) + $Target.outerWidth() + $HoverBox.width();
    var nSpaceRight = nViewportWidth - nBoxRightViewport;
    var nSpaceLeft = offset.left - $Hover.width();
    if (nSpaceLeft > 0 || nSpaceLeft > nSpaceRight) {
        $Hover.css('left', (offset.left - $Hover.width() - 12) + 'px');
        $HoverArrowLeft.hide();
        $HoverArrowRight.show();
    }
    else {
        $Hover.css('left', (offset.left + $Target.outerWidth()) + 'px');
        $HoverArrow = $HoverArrowLeft;
        $HoverArrowLeft.show();
        $HoverArrowRight.hide();
    }

    var nTopAdjustment = 0;

    if ($Target.height() < 48)
        nTopAdjustment = Math.floor($Target.height() / 2) - 12;
    var nDesiredHoverTop = offset.top - 0 + nTopAdjustment;
    $Hover.css('top', nDesiredHoverTop + 'px');

    // see if the hover is cut off by the bottom of the window, and bump it up if neccessary
    var nTargetTopViewport = (offset.top - nWindowScrollTop) + nTopAdjustment;
    if (nTargetTopViewport + $HoverBox.height() + 35 > nViewportHeight) {
        var nViewportAdjustment = ($HoverBox.height() + 35) - (nViewportHeight - nTargetTopViewport);

        var nViewportAdjustedHoverTop = offset.top - nViewportAdjustment;
        $Hover.css('top', nViewportAdjustedHoverTop + 'px');

        // arrow is normally offset 30pixels.  we move it down the same distance we moved the hover up, so it is "fixed" to where it was initially
        $HoverArrow.css('top', (30 + nDesiredHoverTop - nViewportAdjustedHoverTop) + 'px');
    }
    else {
        $HoverArrow.css('top', '');
    }

    $Hover.hide();
    $Hover.css('visibility', '');
}


function InitEconomyHovers(strEconomyCSSURL, strEconomyCommonJSURL, strEconomyJSURL) {
    var $Hover = $J('<div/>', { 'class': 'economyitem_hover' });
    var $HoverContent = $J('<div/>', { 'class': 'economyitem_hover_content' });
    $Hover.append($HoverContent);
    $Hover.hide();

    var fnOneTimeEconomySetup = function () {
        $J(document.body).append($Hover);

        if (typeof UserYou == 'undefined') {
            var css = document.createElement("link");
            css.setAttribute("rel", "stylesheet");
            css.setAttribute("type", "text/css");
            css.setAttribute("href", strEconomyCSSURL);
            var js1 = document.createElement("script");
            js1.setAttribute("type", "text/javascript");
            js1.setAttribute("src", strEconomyCommonJSURL);
            var js2 = document.createElement("script");
            js2.setAttribute("type", "text/javascript");
            js2.setAttribute("src", strEconomyJSURL);
            var head = $J('head')[0];
            head.appendChild(css);
            head.appendChild(js1);
            head.appendChild(js2);
        }
    };

    var fnDataFactory = function (key) {
        var rgItemKey = key.split('/');
        if (rgItemKey.length >= 3 && rgItemKey.length <= 5) {
            if (fnOneTimeEconomySetup) {
                fnOneTimeEconomySetup();
                fnOneTimeEconomySetup = null;
            }

            // pop amount off the end first if it's present
            var nAmount;
            var strLastEntry = rgItemKey[rgItemKey.length - 1];
            if (strLastEntry && strLastEntry.length > 2 && strLastEntry.substr(0, 2) == 'a:') {
                nAmount = strLastEntry.substr(2);
                rgItemKey.pop();
            }

            var strURL = null;
            var appid = rgItemKey[0];
            if (appid == 'classinfo') {
                // class info style
                appid = rgItemKey[1];
                var classid = rgItemKey[2];
                var instanceid = (rgItemKey.length > 3 ? rgItemKey[3] : 0);
                strURL = 'economy/itemclasshover/' + appid + '/' + classid + '/' + instanceid;
                strURL += '?content_only=1&l=english';
            }
            else {
                // real asset
                var contextid = rgItemKey[1];
                var assetid = rgItemKey[2];
                var strURL = 'economy/itemhover/' + appid + '/' + contextid + '/' + assetid;
                strURL += '?content_only=1&omit_owner=1&l=english';
                if (rgItemKey.length == 4 && rgItemKey[3]) {
                    var strOwner = rgItemKey[3];
                    if (strOwner.indexOf('id:') == 0)
                        strURL += '&o_url=' + strOwner.substr(3);
                    else
                        strURL += '&o=' + strOwner;
                }
            }
            if (nAmount && nAmount > 1)
                strURL += '&amount=' + nAmount;
            return new CDelayedAJAXData(strURL, 100);
        }
        else
            return null;
    };

    var rgCallbacks = BindAJAXHovers($Hover, $HoverContent, {
        fnDataFactory: fnDataFactory,
        strDataName: 'economy-item',
        strURLMatch: 'itemhover'
    });
}

function ShowTradeOffer(tradeOfferID, rgParams) {
    var strParams = '';
    if (rgParams)
        strParams = '?' + $J.param(rgParams);

    var strKey = (tradeOfferID == 'new' ? 'NewTradeOffer' + rgParams['partner'] : 'TradeOffer' + tradeOfferID);

    var winHeight = 1120;
    if (Steam.BIsUserInSteamClient() && Steam.GetClientPackageVersion() < 1407800248) {
        // workaround for client break when the popup window is too tall for the screen.  Try and pick a height that will fit here.
        var nClientChromePX = 92;
        if (window.screen.availHeight && window.screen.availHeight - nClientChromePX < winHeight)
            winHeight = window.screen.availHeight - nClientChromePX;
    }

    var winOffer = window.open('https://steamcommunity.com/tradeoffer/' + tradeOfferID + '/' + strParams, strKey, 'height=' + winHeight + ',width=1028,resize=yes,scrollbars=yes');

    winOffer.focus();
}

function Logout() {
    PostToURLWithSession('https://steamcommunity.com/login/logout/');
}

function ChangeLanguage(strTargetLanguage, bStayOnPage) {
    var Modal = ShowBlockingWaitDialog('Change language', '');
    $J.post('http://steamcommunity.com/actions/SetLanguage/', { language: strTargetLanguage, sessionid: g_sessionID })
        .done(function () {
            if (bStayOnPage)
                Modal.Dismiss();
            else {
                if (g_steamID)
                    window.location = 'http://store.steampowered.com/account/languagepreferences/';
                else if (window.location.href.match(/[?&]l=/))
                    window.location = window.location.href.replace(/([?&])l=[^&]*&?/, '$1');
                else
                    window.location.reload();
            }
        }).fail(function () {
            Modal.Dismiss();
            ShowAlertDialog('Change language', 'There was a problem communicating with the Steam servers.  Please try again later.');
        });
}

function abuseSSDescripCheck() {
    var chkd_inap = $('abuseType1').checked;
    var chkd_cprt = $('abuseType5').checked;
    if (chkd_inap) {
        $('abuseDescriptionLabel').setStyle({ color: '#777777', fontStyle: 'italic' });
        $('abuseDescriptionArea').disable();
        $('abuseDescriptionArea').clear();
    }
    else if (chkd_cprt) {
        $('abuseDescriptionLabel').setStyle({ color: '#898989', fontStyle: 'normal' });
        $('abuseDescriptionArea').enable();
        $('abuseDescriptionArea').focus();
    }
}

function UpdateParameterInCurrentURL(strParamName, strParamValue, rgRemoveParameters) {
    var path = window.location.pathname;
    var query = window.location.search;
    var params = {};
    if (query && query.length > 2)
        params = $J.deparam(query.substr(1));

    if (strParamValue === null)
        delete params[strParamName];
    else
        params[strParamName] = strParamValue;

    // comment thread specific
    if (rgRemoveParameters)
        for (var i = 0; i < rgRemoveParameters.length; i++)
            delete params[rgRemoveParameters[i]];

    query = $J.param(params);

    return path + (query ? '?' + query : '');
}

var g_rgCommentThreads = {};
function InitializeCommentThread(type, name, rgCommentData, url, nQuoteBoxHeight) {
    // see if we have a custom comment thread class for this type
    var commentclass = CCommentThread;
    if (window['CCommentThread' + type])
        commentclass = window['CCommentThread' + type];

    g_rgCommentThreads[name] = new commentclass(type, name, rgCommentData, url, nQuoteBoxHeight);
}

function BindCommentThreadSubscribeButtons(type, owner, gidfeature, gidfeature2, btnSubscribe, btnUnsubscribe) {
    var CommentThread = FindCommentThread(type, owner, gidfeature, gidfeature2);
    if (CommentThread)
        CommentThread.BindSubscribeButtons(btnSubscribe, btnUnsubscribe);
}

function FindCommentThread(type, owner, gidFeature, gidFeature2) {
    for (var key in g_rgCommentThreads) {
        if (g_rgCommentThreads[key].BMatches(type, owner, gidFeature, gidFeature2))
            return g_rgCommentThreads[key];
    }
    return null;
}

function TargetIsChild(event, selector) {
    var evt = event || window.event;
    var reltarget = evt.relatedTarget || evt.toElement;
    if (!reltarget || !$(reltarget).up(selector))
        return false;
    return true;
}

function addEvent(el, ev, fn, useCapture) {
    if (el.addEventListener) {
        el.addEventListener(ev, fn, useCapture);
    }
    else if (el.attachEvent) {
        var ret = el.attachEvent("on" + ev, fn);
        return ret;
    }
    else {
        el["on" + ev] = fn;
    }
}

function createQuery2(postUrl, returnFn, postData) {
    var uid = Math.round(Math.random() * 100000);
    var rUid = "requester" + uid;
    eval(rUid + " = new xHttpQuery_Post();");
    eval(rUid + ".postUrl = postUrl;");
    eval(rUid + ".returnFn = returnFn;");
    eval(rUid + ".postData = postData;");
    eval(rUid + ".selfRef = \"" + rUid + "\";");
    eval(rUid + ".doRequest();");
}

var updateInProgress = false;
function xHttpQuery_Post() {
    this.postUrl = '';
    this.selfRef = '';
    this.postData = '';
    this.dataEncoded = false;
    this.returnFn = false;
    this.doRequest = function () {
        if (updateInProgress == true) {
            setTimeout(this.selfRef + ".doRequest()", 200);
            return;
        }
        if (this.dataEncoded == false) {
            var pairs = [];
            var regexp = /%20/g;
            for (var name in this.postData) {
                var value = this.postData[name].toString();
                var pair = encodeURIComponent(name).replace(regexp, '+') + '=' + encodeURIComponent(value).replace(regexp, '+');
                pairs.push(pair);
            }
            this.postData = pairs.join('&');
            this.dataEncoded = true;
        }
        updateInProgress = true;
        // req is intentionally a global.  The contract for this function is that the callers look at the "req" global in their callback to see results.
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (req) {
            req.open("POST", this.postUrl, true);
            req.onreadystatechange = this.returnFn;
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            req.setRequestHeader("Content-Length", this.postData.length);
            req.send(this.postData);
        }
    }
}

function winDim(wh, vs) {
    if (window.innerWidth) // most browsers - ff, safari, etc
    {
        return (wh == 'w' ? (vs == 'v' ? window.innerWidth : window.pageXOffset) : (vs == 'v' ? window.innerHeight : window.pageYOffset));
    }
    else if (document.documentElement && document.documentElement.clientWidth) // ie strict
    {
        return (wh == 'w' ? (vs == 'v' ? document.documentElement.clientWidth : document.documentElement.scrollLeft) : (vs == 'v' ? document.documentElement.clientHeight : document.documentElement.scrollTop));
    }
    else // ie normal
    {
        return (wh == 'w' ? (vs == 'v' ? document.body.clientWidth : document.body.scrollLeft) : (vs == 'v' ? document.body.clientHeight : document.body.scrollTop));
    }
}

function getGoodElement(el, nn, cn, next) {
    if (next == 1) {
        el = el.parentNode;
    }
    while (el.nodeName && el.nodeName.toLowerCase() != nn && el.nodeName.toLowerCase() != "body") {
        el = el.parentNode;
    }
    var thisClass = ' ' + el.className + ' ';
    if (el.nodeName && el.nodeName.toLowerCase() != "body" && thisClass.indexOf(' ' + cn + ' ') == -1) {
        return getGoodElement(el, nn, cn, 1);
    }
    else if (thisClass.indexOf(' ' + cn + ' ') != -1) {
        return el;
    }
    return false;
}
function addGameActions() {
    if (!document.getElementsByTagName) {
        return;
    }
    var pageDivs = document.getElementsByTagName("div");
    for (var x = 0; x < pageDivs.length; x++) {
        var tempClassName = " " + pageDivs[x].className + " ";
        var tempParentClassName = " " + pageDivs[x].parentNode.className + " ";
        if (tempClassName.indexOf(" gameContainer ") != -1 || tempParentClassName.indexOf(" gameContainer ") != -1) {
            addEvent(pageDivs[x], "mouseover", listItem_hilite, false);
            addEvent(pageDivs[x], "mouseout", listItem_lolite, false);
            addEvent(pageDivs[x], "click", listItem_toggle, false);
        }
    }
}

function getPopPos(e, pw, ph, offset) {
    var w = winDim('w', 'v');
    var h = winDim('h', 'v');
    var sl = winDim('w', 's');
    var st = winDim('h', 's');
    // mouse x/y within viewport
    var vmX = e.clientX;
    var vmY = e.clientY;
    // mouse x/y within document
    var smX = vmX + sl;
    var smY = vmY + st;
    var l = (pw > vmX) ? (smX + offset) : (smX - pw - offset);
    var t = (ph > vmY) ? (smY + offset) : (smY - ph - offset);
    var popTL = new Array(t, l);
    return popTL;
}

var keepTooltip = false;
function tooltipCreate(tipEl, e) {
    var ttEl = document.getElementById('tooltip');
    if (ttEl) {
        ttEl.parentNode.removeChild(ttEl);
    }
    ttEl = document.createElement('div');
    ttEl.id = 'tooltip';
    ttEl.style.position = 'absolute';
    ttEl.appendChild(tipEl);
    document.getElementsByTagName('body')[0].appendChild(ttEl);
    var tipTL = getPopPos(e, ttEl.clientWidth, ttEl.clientHeight, 6);
    ttEl.style.top = tipTL[0] + 'px';
    ttEl.style.left = tipTL[1] + 'px';
}

function tooltipDestroy(go) {
    if (go != 1) {
        setTimeout("tooltipDestroy(1)", 10);
    }
    else {
        var ttEl = document.getElementById('tooltip');
        if (ttEl) {
            ttEl.parentNode.removeChild(ttEl);
        }
    }
}

function getElement(elementId) {
    var elem;
    if (document.getElementById) // standard compliant method
        elem = document.getElementById(elementId);
    else if (document.all) // old msie versions
        elem = document.all[elementId];
    else
        elem = false;

    return elem;
}

function setImage(elementId, strImage) {
    var imageElem = getElement(elementId);
    if (!imageElem)
        return;

    imageElem.src = strImage;
}

function iSwapFullURL(imgID, newImg) {
    var newImgPath = newImg;
    setImage(imgID, newImgPath);
}

function iSwap(imgID, newImg) {
    var newImgPath = "http://steamcommunity-a.akamaihd.net/public/images/" + newImg;
    setImage(imgID, newImgPath);
}


function ListenToIFrameMessage(callbackFunc) {
    // Respond to a posted message from our sub-frame
    var eventMethodAlias = (window.addEventListener) ? "addEventListener" : "attachEvent";
    var eventMethod = window[eventMethodAlias];
    var messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";

    eventMethod(messageEvent, callbackFunc, false);
}

var gSharePopup = null;
var gShareRequestURL = null;
function ShowSharePublishedFilePopup(publishedFileID, appID) {
    gShareRequestURL = "http://steamcommunity.com/sharedfiles/shareonsteam/?id=" + publishedFileID + '&appid=' + appID;

    var shareURL = "http://steamcommunity.com/sharedfiles/filedetails/?id=" + publishedFileID;
    var baseSocialShareURL = "http://steamcommunity.com/sharedfiles/share/?id=" + publishedFileID;
    ShowSharePopup(shareURL, baseSocialShareURL);
}

function ShowShareNewsPostPopup(gid, appid) {
    gShareRequestURL = "http://steamcommunity.com/news/shareonsteam/" + gid + "?appid=" + appid;

    var baseSocialShareURL = "http://steamcommunity.com/news/sharepost/" + gid;
    var shareURL = "http://steamcommunity.com/news/post/" + gid;
    ShowSharePopup(shareURL, baseSocialShareURL);
}

function ShowShareClanAnnouncementPopup(groupId, gid) {
    gShareRequestURL = "http://steamcommunity.com/gid/" + groupId + "/announcements/shareonsteam/" + gid;

    var baseSocialShareURL = "http://steamcommunity.com/gid/" + groupId + "/announcements/share/" + gid;
    var shareURL = "http://steamcommunity.com/gid/" + groupId + "/announcements/detail/" + gid;
    ShowSharePopup(shareURL, baseSocialShareURL);
}

function ShowSharePopup(url, baseSocialShareURL) {
    var appendQueryParam = baseSocialShareURL.indexOf("?") != -1 ? '&' : '?';

    $("SharePopupLink_Facebook").href = baseSocialShareURL + appendQueryParam + "site=facebook&t=" + Math.random();
    $("SharePopupLink_Twitter").href = baseSocialShareURL + appendQueryParam + "site=twitter";
    $("SharePopupLink_Reddit").href = baseSocialShareURL + appendQueryParam + "site=reddit";
    $("SharePopupLink_Digg").href = baseSocialShareURL + appendQueryParam + "site=digg";

    $("SharePopupInput").value = url;

    gSharePopup = ShowDialog('Share', $('SharePopup'));
    gSharePopup.SetRemoveContentOnDismissal(false);
    $('SharePopup').show();
}

var gShareOnSteamDialog = null;
function ShareOnSteam() {
    gSharePopup.Dismiss();
    gSharePopup = null;

    $('ShareOnSteamDialogContents').hide();
    new Ajax.Updater("ShareOnSteamDialogContents", gShareRequestURL, { evalScripts: true, onLoaded: function () { ShowWithFade($('ShareOnSteamDialogContents')); } });
    $('ShareOnSteamDialog').show();

    var deferred = new jQuery.Deferred();
    var fnCancel = function () { CloseShareOnSteamDialog(); deferred.resolve(); };

    gShareOnSteamDialog = _BuildDialog('Share', $('ShareOnSteamDialog'), [], fnCancel, null);
    deferred.always(function () { gShareOnSteamDialog.Dismiss(); });
    gShareOnSteamDialog.Show();

    // attach the deferred's events to the modal
    deferred.promise(gShareOnSteamDialog);

    gShareOnSteamDialog.SetRemoveContentOnDismissal(false);
}


function CloseShareOnSteamDialog() {
    gShareOnSteamDialog.Dismiss();
}

function ShareContentToUserStatus(text, urlToShare, appID, posturl) {
    text += '\n\n' + urlToShare;
    new Ajax.Request(posturl, {
        insertion: Insertion.Bottom,
        method: 'post',
        parameters: { sessionid: g_sessionID, status_text: text, appid: appID },
        onSuccess: function (transport) {
            CloseShareOnSteamDialog();
            ShowAlertDialog('Share', 'The status update has been posted to your Friends Activity.');
        },
        onFailure: function (transport) {
            ShowAlertDialog('Share', 'There was a problem sharing the status update.  Please try again later.');
        }
    });
}
