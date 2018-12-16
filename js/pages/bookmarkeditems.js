var g_rgWalletInfo = {
    wallet_fee: 1,
    wallet_fee_base: 0,
    wallet_fee_minimum: 1,
    wallet_fee_percent: 0.05,
    wallet_publisher_fee_percent_default: 0.10,
    wallet_currency: 1
};

chrome.storage.sync.get({
    bookmarkscategories: {},
    lang: '',
    currency: ''
}, function (items) {
    var currency = 1;
    if (items.currency != '') {
        g_rgWalletInfo.wallet_currency = currency = items.currency;
    }


    const $selectBlock = $(`
        <label for="cb_bookmarkscategories" data-i18n="bookmarks.selectcat">Select category</label>
        <select id="cb_bookmarkscategories">
            <option value="all" data-i18n="controls:market.all">All</option>
            <option value="" data-i18n="controls:market.general">General</option>
            ${Object.entries(items.bookmarkscategories).map(([idx, catName]) => `<option value="${idx}">${catName}</option>`).join()}
        </select>
        <a href="${chrome.runtime.getURL('/html/bookmarks.html')}" target="_blank" data-i18n="bookmarks.manage">Manage categories</a>
    `);
    $selectBlock.change((e) => {
        const category = e.target.value;
        $('#div_Cnt .bookmark-row').each((idx, elem) => {
            if (category == 'all') $(elem).show();
            else if ($(elem).data('cat') == category) $(elem).show();
            else $(elem).hide();
        })
    });
    $('#div_Categories').append($selectBlock);

    chrome.storage.local.get({
        bookmarks: null
    }, function (subitems) {
        if (subitems.bookmarks) {
            $.each(subitems.bookmarks, function (idx, item) {
                if (!item || !item.hashmarket || !item.img) return;

                var $row = $('<div class="bookmark-row" data-cat="' + (item.cat || '') + '" data-hash="' + item.hashmarket + '" />');
                $row.append('<div class="name">' +
                    '<img src="' + item.img.replace('360fx360f', '38fx38f') + '" style="border-color: ' + item.color + ';" class="market_listing_item_img" alt="">' +
                    '<span style="color: ' + item.color + ';"><a href="http://steamcommunity.com/market/listings/' + item.hashmarket + '" title="' + item.name + '" target="_blank">' + item.name + '</a></span><br>' +
                    '<span>' + item.gamename + '</span></div>');
                $row.append('<div class="volume"><span class="bookmark-volume">Loading...</span><br /><span class="bookmark-median-price"></span></div>');
                $row.append('<div class="price"><span class="bookmark-lowest-price">Loading...</span><br /><span class="bookmark-seller-price"></span></div>');
                $row.append('<div class="remove"><span data-hash="' + item.hashmarket + '" class="remove-bookmark" title="Remove">x</span></div>');
                $('#div_Cnt').append($row);

                var itemLink = 'http://steamcommunity.com/market/priceoverview/?appid=' + item.appid
                    + '&country=US&currency=' + currency
                    + '&market_hash_name=' + item.hashmarket.substring(item.hashmarket.indexOf('/') + 1);

                PriceQueue.GetPrice({
                    method: 'GET',
                    url: itemLink,
                    innerDiv: $row,
                    success: function (response) {
                        if (response.success) {
                            $row.find('.bookmark-lowest-price').html(response.lowest_price);
                            $row.find('.bookmark-median-price').html(response.median_price);

                            var inputValue = GetPriceValueAsInt(response.lowest_price);
                            var nAmount = inputValue;
                            var priceWithoutFee = null;
                            if (inputValue > 0 && nAmount == parseInt(nAmount)) {
                                var feeInfo = CalculateFeeAmount(nAmount, g_rgWalletInfo['wallet_publisher_fee_percent_default']);
                                nAmount = nAmount - feeInfo.fees;
                                priceWithoutFee = v_currencyformat(nAmount, GetCurrencyCode(g_rgWalletInfo['wallet_currency']));
                            }

                            $row.find('.bookmark-seller-price').html('(' + priceWithoutFee + ')');
                            var volume = (response.volume) ? response.volume : '';
                            $row.find('.bookmark-volume').html(volume);
                        }
                    },
                    error: function () { }
                });
            });
        }
    });
});

$('#div_Cnt').on('click', '.remove-bookmark', function () {
    var hashmarket = $(this).data('hash');
    $(this).parents('.bookmark-row').hide(200);

    chrome.storage.local.get({
        bookmarks: null
    }, function (items) {
        var bookmarks = items.bookmarks || {};
        if (bookmarks[hashmarket]) {
            delete bookmarks[hashmarket];
        }

        chrome.storage.local.set({
            bookmarks: bookmarks
        });
    });
});

function openWindow(url) {
    chrome.windows.create({ 'url': url, 'type': 'normal' }, function (window) {
    });
}

function GetPriceValueAsInt(strAmount) {
    var nAmount;
    if (!strAmount) {
        return 0;
    }

    // strip the currency symbol, set commas to periods, set .-- to .00
    strAmount = strAmount.replace(GetCurrencySymbol(GetCurrencyCode(g_rgWalletInfo['wallet_currency'])), '').replace(',', '.').replace('.--', '.00');

    var flAmount = parseFloat(strAmount) * 100;
    nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount + 0.000001); // round down

    nAmount = Math.max(nAmount, 0);
    return nAmount;
}

$(function () {
    chrome.browserAction.setPopup({
        popup: "html/bookmarkeditems.html"
    });
});
