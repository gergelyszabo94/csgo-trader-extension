var SIHLang = {};
var BaseSIHLang = {
    noreload: "No inventory reloading when sell item",
    quickbuy: "Quick buy",
    reloadinvent: "Reload inventory (alt + R)",
    selectitem: "Select items",
    selectall: "Select all",
    turngems: "Turn into gems",
    sendgifts: "Send gifts",
    cancel: "Cancel",
    total: "Total price",
    loading: "Loading...",
    inventvalue: "Inventory value",
    steamprice: "Steam Price",
    sold24h: "sold in the last 24 hours",
    numowned: "Number owned",
    sell1item: "Sell 1 item",
    sellnitem: "Sell $1 items",
    quicksell: "Quick sell this at $1",
    instantsell: "Instant sell this at $1",
    buymissing: "Buy missing items",
    autoaccept: "Accept all items automatically",
    autoadjust: "Autoadjust prices by market",
    historynoselect: "Select item",
    sponsors: "SIH's Sponsors",
    functions: "Functions",
    externalprices: "External prices",
    showpriceproviders: "Show price providers",
    hidepriceproviders: "Hide price providers",
    info: {
        viewcm: "View in Community Market",
        startingAt: "Starting at",
        nosales: "There are no listings currently available for this item.",
        last24: "%1$s sold in the last 24 hours",
        volume: "Volume",
        sell: "Sell",
        noproviders: "Unfortunately we don't have any price providers for this game. Please send us the message with a link to provider to whom you trust and whom you would like to see in the prices in our application. We will surely add their prices if its possible."
    },
    market: {
        selectoverpriced: "Select all overpriced",
        removeselected: "Remove selected",
        remove: "Remove",
        reloadlistings: "Reload listings (alt + R)",
        hidelistings: "Hide listings",
        showlistings: "Show listings",
        total: "Total",
        minimum: "Min.price",
        addbookmarks: "Add to bookmarks",
        mybookmarks: "My bookmarks",
        remove: "Remove from",
        general: "General",
        all: "All",
        addcategory: "Add category",
        getallfloat: "Get All Float",
        sortfloat: "Sort By Float",
        viewglws: "View on glws",
        getfloat: "Get Float"
    },
    queue: {
        items: "Items",
        withfee: "Total",
        withoutfee: "Without comission",
        manualsell: "Manual selling",
        autosell: "Auto-selling",
        removeitem: "Remove from queue",
        removelower: "Remove lower",
        removehigher: "Remove higher",
        removeintrade: "Remove in-trade",
        removeequipped: "Remove equipped",
        takelower: "Take lower",
        takehigher: "Take higher",
        emptyprice: "Remove no price"
    },
    sort: {
        sortitem: "Sort items",
        price: "By Price",
        name: "By Name",
        float: "By Float"
    },
    tradingcards: {
        buyall: "Buy all",
        reload: "Reload list",
        dialogtitle: "Buy missing cards",
        showpopup: "Show buy cards dialog"
    },
    profile: {
        communityban: "Community banned",
        tradeban: "Trade banned",
        vacban: "VAC banned",
        none: "None",
        banned: "Banned"
    },
    tradeoffers: {
        removeall: "Remove all",
        takeall: "Take all",
        totalprice: "Get total",
        notrash: "No trash",
        skipintrade: "Skip in-trade items",
        noduplicate: "No duplicate",
        noofitems: "Number of items",
        recount: "Recount",
        youritems: "Your items",
        theiritem: "Their items"
    },
    nontradable: {
        counter: "items not tradable yet",
        startdate: "First ones at",
        lastdate: "Last ones at",
        totalprice: "Total price"
    }
};

function ReloadLang() {
    SIHLang = jQuery.extend(true, {}, BaseSIHLang, SIHLang);
    jQuery('[data-lang]').each(function (e, i) {
        var code = jQuery(this).data('lang').split('.');
        var msg = SIHLang[code[0]];
        for (var i = 1; i < code.length; i++) {
            msg = msg[code[i]];
        }

        if (msg != null && msg)
            jQuery(this).html(msg);
    });
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

function getNumber(priceStr) {
    // var pp = /([\d\.,]+)/.exec(price.replace(/\&#.+?;/g, '').replace(' p&#1091;&#1073;.', '').replace(/\s/, '').replace(/[^\d,\.]/g, '').replace(/[^\d]$/g, ''));
    // pp = pp ? pp[1].replace(/,(\d\d)$/g, '.$1').replace(/\.(\d\d\d)/g, '$1').replace(/,(\d\d\d)/g, '$1') : 0;
    const pp = priceStr
        .replace(',', '.')
        .replace(/[^\d.]/g, '')
        .trim();
    return pp;
}
