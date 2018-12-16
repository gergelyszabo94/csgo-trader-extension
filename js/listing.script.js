var imgExp = /\<img[^\>]+src="([^"]+)"([^\>])*\>/g;
var checkFloatURL = 'https://beta.glws.org/#';
const groupsExp = /^steam:\/\/rungame\/730\/\d+\/[+ ]csgo_econ_action_preview ([SM])(\d+)A(\d+)D(\d+)$/;
const floatData = {};
const floatQueue = [];
let SIH_State = [false, false];
let localStickerTitle = 'Sticker';
const SIH_BUY = 0, SIH_SELL = 1;

var CSGO_ORIGINS;
$J.getJSON(`chrome-extension://${window.SIHID}/assets/json/csgo_origin_names.json`, (data) => {
  CSGO_ORIGINS = data;
});

const COOKIE_ENABLED_SIH = 'enableSIH';
let IS_ENABLED_SIH = GetCookie(COOKIE_ENABLED_SIH);
IS_ENABLED_SIH = IS_ENABLED_SIH === null || IS_ENABLED_SIH === 'true';
$J('.market_listing_nav_container').append(`
    <div id="switchPanel">
        <span style="margin-right: 10px;">SIH - Steam Inventory Helper</span>
        <label class="switch">
            <input id="switcher" type="checkbox" ${IS_ENABLED_SIH ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>
    </div>
`);
$J('#switchPanel #switcher').change((e) => {
  const { currentTarget } = e;
  SetCookie(COOKIE_ENABLED_SIH, currentTarget.checked, 365, '/market/listings');
  window.location.reload();
});

var setFloatValue = function (data) {
  const floatDiv = $J(`#listing_${data.listingId}`).find(`#listing_${data.listingId}_float`);
  if (data && data.success) {
    floatDiv.find('.floatbutton').remove();
    floatDiv.find('.spinner').css('display', 'none');
    floatDiv.find('.float_data').css('display', 'block');
    floatDiv.find('.itemfloat .value').html(`${data.iteminfo.floatvalue}`);
    floatDiv.find('.itemseed .value').html(`${data.iteminfo.paintseed || 0}`);
    const itemOrigin = CSGO_ORIGINS.find(item => item.origin === data.iteminfo.origin);
    floatDiv.find('.itemorigin .value').html(itemOrigin.name);

    const additionalInfo = $J(`#listing_${data.listingId}`).find('.additional');
    const additionalItems = ['itemid', 'defindex', 'paintindex', 'paintseed', 'quality', 'rarity', 'inventory'];
    const fields = additionalItems.map(item => `<div class="item">${item}: <span class="value">${data.iteminfo[item]}</span></div>`);
    additionalInfo.html(fields.join(''));
  }
};

var GetFloat = function (listingId, link) {
  return new Promise((resolve, reject) => {
    if (floatData[listingId].success) {
      resolve(Object.assign({}, floatData[listingId], { listingId }));
    } else {
      chrome.runtime.sendMessage(SIHID, { type: 'floatvalue', data: link }, function (respData) {
        if (respData && respData.success) {
          Object.assign(floatData[listingId], respData);
          Object.assign(respData, { listingId });
          resolve(respData);
        } else {
          reject(respData);
        }
      });
    }
  });
};

var FraudAlert = function () {
  $J('.market_listing_row[id^="listing_"]').each(function () {
    var $row = $J(this);
    $row.css('overflow', 'visible');
    $row.append(`<div class="additional"></div>`);
    var idListing = $J(this).attr('id').substring(8);
    var rgListing = g_rgListingInfo[idListing];
    var asset = null;
    if (rgListing) {
      asset = g_rgListingInfo[idListing].asset;
    } else {
      return;
    }

    var rgItem = g_rgAssets[asset.appid][asset.contextid][asset.id];

    if (rgItem.fraudwarnings && rgItem.fraudwarnings.length > 0) {
      var itemNameBlock = $J(this).find('.market_listing_item_name_block');
      if (!itemNameBlock.find('.sih-fraud').length)
        itemNameBlock.find('.market_listing_item_name').after('<br><span class="sih-fraud">(warning)</span>');
      var fraudStr = '';
      $J.each(rgItem.fraudwarnings, function (idx, v) {
        fraudStr += ', ' + v;
      });
      fraudStr = fraudStr.substr(2);
      itemNameBlock.find('.sih-fraud').text(fraudStr);
    }

    if (rgItem.market_actions && window.show_float_value_listings && $J(this).find('.float_block').length === 0) {
      var elGameName = $J(this).find('.market_listing_game_name');
      var elImageHolder = $J(this).find('.market_listing_item_img_container');
      $J.each(rgItem.market_actions, function () {
        var action = this;
        var actionLink = action.link.replace('%assetid%', asset.id);
        var link = $J(`<a class="sih-market-action" href="${actionLink}"/>`).text(action.name);
        if (asset.appid == 730) {
          // <a class="btn_green_white_innerfade btn_small" href="javascript:GetFloat(${idListing}, '${actionLink}')"><span>Get Float</span></a>
          const buttonDiv = `
              <div id="listing_${idListing}_float" class="float_block" style="display: inline; text-align: left;">
                  <a class="floatbutton" href="javascript:void(0);" data-id="${idListing}" data-link="${actionLink}"><span>${SIHLang.market.getfloat}</span></a>
                  <div class="spinner" style="display: none; width: 16px; height: 16px; background: url(//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif) no-repeat; background-size: 16px;"></div>
                  <div class="float_data">
                      <div class="itemfloat">Float Value: <span class="value"></span></div>
                      <div class="itemseed">Paint Seed: <span class="value"></span></div>
                      <div class="itemorigin">Origin: <span class="value"></span></div>
                  </div>
              </div>`;
          // let groups = groupsExp.exec(decodeURIComponent(actionLink));
          // var href = link.prop('href');
          // if (href.indexOf('%20') > 0) {
          //     var idstr = href.substr(href.indexOf('%20') + 3);
          //     link.prop('href', checkFloatURL + idstr);
          //     link.html(`<span class="icon-eye">${SIHLang.market.viewglws}</span>`);
          //     link.prop('target', '_blank');
          // }
          var inspectLink = $J('<a class="sih-inspect-magnifier" title="Inspect in game">&nbsp;</a>').prop('href', actionLink);
          elImageHolder.append(inspectLink);
          elGameName.after(buttonDiv);
          elGameName.hide();
          if (idListing in floatData) setFloatValue(Object.assign({ listingId: idListing }, floatData[idListing]));
          else floatData[idListing] = { link: actionLink, success: false };
        }

        // if (elGameName.parent().find('.sih-market-action').text() === '') {
        //     elGameName.after(link);
        // }
      });
    }

    //$J(this).find('.playerAvatar img').replaceWith(function () {
    //    return '<a href="http://steamcommunity.com/profiles/' + rgItem.owner + '" target="_blank">' + this.outerHTML + '</a>';
    //});

    if (window.show_stickers_listings) {
      var img = '';

      if (rgItem.appid == 730) {
        for (var i = 0; i < rgItem.descriptions.length; i++) {
          var d = rgItem.descriptions[i];
          if (d.type == 'html' && d.value.startsWith('<br><div id="sticker_info" name="sticker_info"')) {
            var m = null;
            var strickersName = null;
            localStickerTitle = $J(`<div>${d.value}</div>`).find('#sticker_info').prop('title');
            if (d.value.indexOf(`${localStickerTitle}: `) > 0) {
              var stickerstr = d.value.substr(d.value.indexOf(`${localStickerTitle}: `) + 9).replace('</center></div>', '');
              strickersName = stickerstr.split(',');
            }
            var htmlVal = d.value;

            while (m = imgExp.exec(htmlVal)) {
              var stickerName = '';
              if (strickersName && strickersName.length) {
                stickerName = strickersName.shift().trim();
              }
              img += `<img src="${m[1]}" title="${localStickerTitle} | ${stickerName}"/>`;
            }
          }
        }
      }

      if (img) {
        var div = $J('<div class="sih-images" />');
        div.html(img);
        $J(this).find('.sih-images').remove();
        $J(this).find('.market_listing_item_name_block').after(div);
      }
    }

    if (window.replaceBuy) {
      if (rgListing['price'] > 0 && $J(this).find('.item_market_action_button:contains("' + SIHLang.quickbuy + '")').length == 0) {
        var quickBuyBt = $J('<a href="#" class="item_market_action_button item_market_action_button_green">' +
          '<span class="item_market_action_button_edge item_market_action_button_left"></span>' +
          '<span class="item_market_action_button_contents">' + SIHLang.quickbuy + '</span>' +
          '<span class="item_market_action_button_edge item_market_action_button_right"></span>' +
          '<span class="item_market_action_button_preload"></span></a>');
        quickBuyBt.click(function () {
          $J(this).hide();

          $row.find('.market_listing_buy_button').append('<img src="http://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" alt="Working...">');
          var Subtotal = parseInt(rgListing.converted_price, 10);
          var FeeAmount = parseInt(rgListing.converted_fee, 10);
          var Total = Subtotal + FeeAmount;
          var data = {
            sessionid: g_sessionID,
            currency: g_rgWalletInfo['wallet_currency'],
            subtotal: Subtotal,
            fee: FeeAmount,
            total: Total,
            quantity: 1
          };
          $J.ajax({
            url: 'https://steamcommunity.com/market/buylisting/' + idListing,
            type: 'POST',
            data: data,
            crossDomain: true,
            xhrFields: { withCredentials: true }
          }).done(function (data) {
            if ($row.is(':visible')) {
              $row.find('.market_listing_buy_button').html('Success');
            } else {
              alert('Success');
            }
          }).fail(function (jqxhr) {
            $row.find('.market_listing_buy_button img').remove();
            var data = $J.parseJSON(jqxhr.responseText);
            if (data && data.message) {
              $row.find('.market_listing_buy_button').html(data.message);
              //BuyItemDialog.DisplayError(data.message);
            }
          });
          return false;
        });

        AddItemHoverToElement(quickBuyBt[0], rgItem);
        $J(this).find('.market_listing_buy_button').empty();
        $J(this).find('.market_listing_buy_button').append(quickBuyBt);
      }

    }
  });
  //$J('.market_listing_action_buttons').css({ width: '200px' });
};

var addAllFloatButton = function () {
  if (location.pathname.startsWith('/market/listings/730') && window.show_float_value_listings && !$J('#allfloatbutton').length) {
    const allFloatButton = `
            <div style="padding: 10px; margin-top: 10px;">
                <a class="btn_green_white_innerfade btn_small" id="allfloatbutton" href="javascript:void(0);">
                    <span>${SIHLang.market.getallfloat}</span>
                </a>
                <a class="btn_green_white_innerfade btn_small" id="sortlistings" href="javascript:void(0);">
                    <span>${SIHLang.market.sortfloat}<span class="market_sort_arrow"></span></span>
                </a>
            </div>
        `;
    $J('.pagecontent #searchResultsTable #searchResultsRows').before(allFloatButton);
  }
};

const processFloatQueue = function () {
  if (!floatQueue.length) { return setTimeout(processFloatQueue, 300); }

  const lastItem = floatQueue.shift();
  const floatDiv = $J(`#listing_${lastItem.listingId}`).find(`#listing_${lastItem.listingId}_float`);

  if (!floatDiv) {
    processFloatQueue();
    return;
  }

  GetFloat(lastItem.listingId, lastItem.inspectLink)
    .then((data) => {
      setFloatValue(data);
      if ($J('.market_sort_arrow').is(':contains("▼")')) sortListingsByFloat(-1);
      else if ($J('.market_sort_arrow').is(':contains("▲")')) sortListingsByFloat(1);
      processFloatQueue();
    })
    .catch((err) => {
      floatDiv.find('.floatbutton').show();
      floatDiv.find('.spinner').hide();

      processFloatQueue();
    });
};

const sortListingsByFloat = function (order) {
  const $rowsBlock = $J('#searchResultsRows');
  const $listings = $rowsBlock.find('.market_listing_row[id^="listing_"]:has(.float_data:visible)');
  $listings.sort(function (a, b) {
    const aValue = $J(a).find('.itemfloat .value').text() || order;
    const bValue = $J(b).find('.itemfloat .value').text() || order;

    if (aValue > bValue) {
      return 1 * order;
    }
    if (aValue < bValue) {
      return -1 * order;
    }
    return 0;
  });

  $listings.detach().appendTo($rowsBlock);
};

const showBookmarks = (bookmarks, bookmarkscategories) => {
  var itemlink = $J('.market_listing_nav > a:last-child');
  var m = /\/\/steamcommunity.com\/market\/listings\/(\d+)\/(.+)/.exec(itemlink.attr('href'));
  if (!m) {
    return;
  }
  var name = itemlink.text();
  var hashname = m[2];
  var appid = m[1];
  var img = $J('.market_listing_largeimage > img').prop('src');
  var color = $J('#largeiteminfo_item_name').css('color');
  var hashmarket = appid + '/' + hashname;
  var gamename = $J('.market_listing_nav > a:nth(0)').text();

  const bookmarkBlock = $J(`<div class="dropdown">
        <a class="dropbtn btn_green_white_innerfade btn_medium" href="javascript:void(0)">
          <span class="icon icon-plus-circled"></span>
          <span id="btn-title">${SIHLang.market.addbookmarks}</span>
        </a>
        <div class="dropdown-content">
          <a href="javascript:void(0)">${SIHLang.market.general}</a>
          ${Object.entries(bookmarkscategories).map(([id, cat]) => `<a href="javascript:void(0)" data-id="${id}">${cat}</a>`).join('')}
          <a href="${window.bookmarksLink}" id="newlist" target="_blank">+ ${SIHLang.market.addcategory}</a>
        </div>
      </div>`);
  bookmarkBlock.insertAfter($J('#largeiteminfo').next());
  setTimeout(function () {
    if (bookmarks && bookmarks[hashmarket]) {
      var html = `${SIHLang.market.remove} `;
      if (bookmarks[hashmarket].cat && bookmarkscategories && bookmarkscategories[bookmarks[hashmarket].cat]) {
        html += bookmarkscategories[bookmarks[hashmarket].cat];
      } else {
        html += SIHLang.market.general;
      }

      bookmarkBlock.find('.dropbtn .icon').removeClass('icon-minus-circled');
      bookmarkBlock.find('.dropbtn .icon').addClass('icon-minus-circled');
      bookmarkBlock.find('.dropbtn #btn-title').html(html);
      bookmarkBlock.find('.dropbtn').data('added', true);
    }
  }, 50);

  bookmarkBlock.find('.dropbtn').bind('click', function (e) {
    e.preventDefault();
    $this = $J(e.currentTarget);
    if ($this.data('added')) {
      chrome.runtime.sendMessage(SIHID, { type: 'RemoveBookmark', data: { hashmarket } });
      $this.data('added', false);
      $this.find('.icon').removeClass('icon-minus-circled');
      $this.find('.icon').addClass('icon-plus-circled');
      $this.find('#btn-title').html(`${SIHLang.market.addbookmarks}`);
    } else {
      const item = {
        hashmarket: hashmarket,
        name: name,
        appid: appid,
        img: img,
        color: color,
        gamename: gamename
      };

      chrome.runtime.sendMessage(SIHID, { type: 'UpdateBookmarks', data: { [hashmarket]: item } });
      $this.data('added', true);
      $this.find('.icon').removeClass('icon-plus-circled');
      $this.find('.icon').addClass('icon-minus-circled');
      $this.find('#btn-title').html(`${SIHLang.market.remove} ${SIHLang.market.general}`);
    }
    return false;
  });

  bookmarkBlock.find('.dropdown-content a[id!="newlist"]').bind('click', function (e) {
    $this = $J(e.currentTarget);
    e.preventDefault();
    var idcat = $this.data('id');
    var item = {
      hashmarket: hashmarket,
      name: name,
      appid: appid,
      img: img,
      color: color,
      gamename: gamename
    };

    var html = `${SIHLang.market.remove} `;
    if (idcat) {
      html += bookmarkscategories[idcat];
      item.cat = idcat;
    } else {
      html += SIHLang.market.general;
    }

    chrome.runtime.sendMessage(SIHID, { type: 'UpdateBookmarks', data: { [hashmarket]: item } });

    bookmarkBlock.find('.dropbtn').data('added', true);
    bookmarkBlock.find('.dropbtn .icon').removeClass('icon-minus-circled');
    bookmarkBlock.find('.dropbtn .icon').addClass('icon-minus-circled');
    bookmarkBlock.find('.dropbtn #btn-title').html(html);

    return false;
  });
};

const addDescriptionLinks = () => {
  $J('.descriptor').each((idx, it) => {
    const text = $J(it).text();
    if (text.indexOf(' | ') !== -1) {
      $J(it).html(`${text} - <a href="http://steamcommunity.com/market/search?q=${text}">Link</a>`)
    }
  });
};

function SIH_toggleState(type) {
  // 0 = buy table, 1 = sell table
  // Called by the respective buttons

  const tableId = (type === SIH_BUY) ? 'market_commodity_buyreqeusts_table' : 'market_commodity_forsale_table';
  const btnId = (type === SIH_BUY) ? 'show_more_buy' : 'show_more_sell';

  $J(`#${tableId}`).slideUp('fast', () => {
    const state = SIH_State[type];

    SIH_State[type] = !state;

    if (state) {
      $J(`#${btnId}`).children().eq(0).html('Show More Orders <span class="popup_menu_pulldown_indicator" id="arrow_sell_button">');
    }
    else {
      $J(`#${btnId}`).children().eq(0).html('Show Less Orders <span class="popup_menu_pulldown_indicator" id="arrow_sell_button" style="-webkit-transform: rotate(-180deg); -ms-transform: rotate(-180deg); transform: rotate(-180deg);">');
    }

    window.SIH_AnimateTables = true;
    Market_LoadOrderSpread(ItemActivityTicker.m_llItemNameID);
  });
}

function BeforeScript() {
  // Overwrites Valve's function here: http://steamcommunity-a.akamaihd.net/public/javascript/market.js
  Market_LoadOrderSpread = function (item_nameid) {
    if (!item_nameid) {
      item_nameid = window.itemid;
    }
    else {
      window.itemid = item_nameid;
    }

    const currency = parseInt($J("#currency_buyorder").val() || (typeof g_rgWalletInfo !== 'undefined' && g_rgWalletInfo['wallet_currency']) || 1);
    const strCode = Object.keys(g_rgCurrencyData).find((code) => g_rgCurrencyData[code].eCurrencyCode === currency);

    $J.ajax({
      url: window.location.protocol + '//steamcommunity.com/market/itemordershistogram',
      type: 'GET',
      data: {
        country: g_strCountryCode,
        language: g_strLanguage,
        currency: currency,
        item_nameid: item_nameid,
        two_factor: BIsTwoFactorEnabled() ? 1 : 0
      }
    }).error(function () {
    }).success(function (data) {
      if (data.success == 1) {
        $J('#market_commodity_forsale').html(data.sell_order_summary);
        $J('#market_commodity_buyrequests').html(data.buy_order_summary);

        // Better Buy Orders

        // configure the initial table HTML
        let buyOrderTable = '<table class="market_commodity_orders_table"><tr>' + $J(data.buy_order_table).children("tbody").eq(0).children("tr").eq(0).html() + '</tr>';
        let sellOrderTable = '<table class="market_commodity_orders_table"><tr>' + $J(data.buy_order_table).children("tbody").eq(0).children("tr").eq(0).html() + '</tr>';

        // Make an deep copy object that stores the quantity at each amount
        const buyOrderQuantity = $J.extend(true, [], data.buy_order_graph);
        const buyOrdersCount = buyOrderQuantity.length > window.orders_amount ? window.orders_amount : buyOrderQuantity.length;

        for (let i = 0; i < buyOrderQuantity.length; i++) {
          let sum = 0;

          for (let x = 0; x < i; x++) {
            sum += buyOrderQuantity[x][1];
          }
          buyOrderQuantity[i][1] -= sum;
        }

        const sellOrderQuantity = $J.extend(true, [], data.sell_order_graph);
        const sellOrdersCount = sellOrderQuantity.length > window.orders_amount ? window.orders_amount : sellOrderQuantity.length;

        for (let i = 0; i < sellOrderQuantity.length; i++) {
          let sum = 0;
          for (let x = 0; x < i; x++) {
            sum += sellOrderQuantity[x][1];
          }
          sellOrderQuantity[i][1] -= sum;
        }

        // Append table rows for quantity
        for (let i = 0; i < buyOrdersCount; i++) {
          // append to the buy order html, account for many currencies, languages
          buyOrderTable += `
            <tr>
                <td align="right">${v_currencyformat(buyOrderQuantity[i][0] * 100, strCode)}</td>
                <td align="right">${buyOrderQuantity[i][1]}</td>
            </tr>`;
        }

        for (let i = 0; i < sellOrdersCount; i++) {
          sellOrderTable += `
            <tr>
                <td align="right">${v_currencyformat(sellOrderQuantity[i][0] * 100, strCode)}</td>
                <td align="right">${sellOrderQuantity[i][1]}</td>
            </tr>`;
        }

        // Remove the buttons if there aren't actually more than 6 buy orders of different value
        if (buyOrderQuantity.length <= 6) {
          $J("#show_more_buy").hide();
        }
        else if (buyOrderQuantity.length > 6) {
          $J("#show_more_buy").show();
        }

        if (sellOrderQuantity.length <= 6) {
          $J("#show_more_sell").hide();
        }
        else if (sellOrderQuantity.length > 6) {
          $J("#show_more_sell").show();
        }

        // Get the total amount of shown by orders
        const totalShownBuyOrders = (data.buy_order_graph.length > 0) ?
          data.buy_order_graph[buyOrdersCount - 1][1] : 0;
        const totalShownSellOrders = (data.sell_order_graph.length > 0) ?
          data.sell_order_graph[sellOrdersCount - 1][1] : 0;

        if ((data.buy_order_summary).search(totalShownBuyOrders) === -1 && data.buy_order_graph.length > 0) {
          // Not all of the possible listings are shown, put the "or more" tag and calculate the remaining orders
          // Get the total amount of buy listings
          const r = /<span class="market_commodity_orders_header_promote">(\d+)<\/span>/;
          const totalBuyOrders = parseInt(data.buy_order_summary.match(r)[1]);

          // Figure out the "or less" text for the language chosen
          const rlang = /.*\d\w{0,3}\S? (.*)/;

          const lastRowText = $J(data.buy_order_table).children("tbody").eq(0).children().last().children().eq(0).text();
          const orLessText = lastRowText.match(rlang)[1];

          buyOrderTable += `
              <tr>
                  <td align="right">
                      ${v_currencyformat(buyOrderQuantity[buyOrdersCount - 1][0] * 100 - 1, strCode)} ${orLessText}
                  </td>
                  <td align="right">
                      ${totalBuyOrders - totalShownBuyOrders}
                  </td>
              </tr>
          `;
        }

        if ((data.sell_order_summary).search(totalShownSellOrders) == -1 && data.sell_order_graph.length > 0) {
          // Not all of the possible listings are shown, put the "or more" tag and calculate the remaining orders
          // Get total amount of buy listings
          const r = /<span class="market_commodity_orders_header_promote">(\d+)<\/span>/;
          const totalSellOrders = parseInt(data.sell_order_summary.match(r)[1]);

          // Figure out the "or more" text for the language chosen
          const rlang = /.*\d\w{0,3}\S? (.*)/;

          const lastRowText = $J(data.sell_order_table).children("tbody").eq(0).children().last().children().eq(0).text();
          const orMoreText = lastRowText.match(rlang)[1];

          sellOrderTable += `
                      <tr>
                          <td align="right">
                              ${v_currencyformat(sellOrderQuantity[sellOrdersCount - 1][0] * 100 + 1, strCode)} ${orMoreText}
                          </td>
                          <td align="right">
                              ${totalSellOrders - totalShownSellOrders}
                          </td>
                      </tr>
                  `;
        }

        sellOrderTable += '</table>';
        buyOrderTable += '</table>';


        // Overwrite the old tables if chosen
        if (data.buy_order_graph.length > 0 && SIH_State[SIH_BUY]) {
          $J('#market_commodity_buyreqeusts_table').html(buyOrderTable);
        }
        else {
          $J('#market_commodity_buyreqeusts_table').html(data.buy_order_table);
        }
        const widthBuyOrderRow = $J('#market_commodity_buyreqeusts_table tr:first').width();
        if (widthBuyOrderRow) {
          $J('#market_buyorder_info_details_tablecontainer').width(widthBuyOrderRow + 2);
        }

        if (data.sell_order_graph.length > 0 && SIH_State[SIH_SELL]) {
          $J('#market_commodity_forsale_table').html(sellOrderTable);
        }
        else {
          $J('#market_commodity_forsale_table').html(data.sell_order_table);
        }
        const widthSellOrderRow = $J('#market_commodity_forsale_table tr:first').width();
        if (widthSellOrderRow) {
          $J('#market_buyorder_info_details_tablecontainer').width(widthSellOrderRow + 2);
        }

        // Check if we need to animate a table into existence
        if (window.SIH_AnimateTables) {
          if ($J("#market_commodity_buyreqeusts_table").is(":hidden")) {
            $J("#market_commodity_buyreqeusts_table").hide().slideDown();
          }
          else {
            $J("#market_commodity_forsale_table").hide().slideDown();
          }

          window.SIH_AnimateTables = false;
        }


        // The rest of this function is just a copy and paste of some of the original code in this function by Valve
        // set in the purchase dialog the default price to buy things (which should almost always be the price of the cheapest listed item)
        if (data.lowest_sell_order && data.lowest_sell_order > 0)
          CreateBuyOrderDialog.m_nBestBuyPrice = data.lowest_sell_order;
        else if (data.highest_buy_order && data.highest_buy_order > 0)
          CreateBuyOrderDialog.m_nBestBuyPrice = data.highest_buy_order;

        // update the jplot graph
        // we do this infrequently, since it's really expensive, and makes the page feel sluggish
        var $elOrdersHistogram = $J('#orders_histogram');
        if (Market_OrderSpreadPlotLastRefresh
          && Market_OrderSpreadPlotLastRefresh + (60 * 60 * 1000) < $J.now()
          && $elOrdersHistogram.length) {
          $elOrdersHistogram.html('');
          Market_OrderSpreadPlot = null;
        }

        if (Market_OrderSpreadPlot == null && $elOrdersHistogram.length) {
          Market_OrderSpreadPlotLastRefresh = $J.now();

          $elOrdersHistogram.show();
          var line1 = data.sell_order_graph;
          var line2 = data.buy_order_graph;
          var numXAxisTicks = null;
          if ($J(window).width() < 400) {
            numXAxisTicks = 3;
          }
          else if ($J(window).width() < 600) {
            numXAxisTicks = 4;
          }

          var numYAxisTicks = 11;
          var strFormatPrefix = data.price_prefix;
          var strFormatSuffix = data.price_suffix;
          var lines = [line1, line2];

          Market_OrderSpreadPlot = $J.jqplot('orders_histogram', lines, {
            renderer: $J.jqplot.BarRenderer,
            rendererOptions: { fillToZero: true },
            title: { text: 'Buy and Sell Orders (cumulative)', textAlign: 'left' },
            gridPadding: { left: 45, right: 45, top: 45 },
            axesDefaults: { showTickMarks: false },
            axes: {
              xaxis: {
                tickOptions: { formatString: strFormatPrefix + '%0.2f' + strFormatSuffix, labelPosition: 'start', showMark: false },
                numberTicks: numXAxisTicks,
                min: data.graph_min_x,
                max: data.graph_max_x
              },
              yaxis: {
                pad: 1,
                tickOptions: { formatString: '%d' },
                numberTicks: numYAxisTicks,
                min: 0,
                max: data.graph_max_y
              }
            },
            grid: {
              gridLineColor: '#1b2939',
              borderColor: '#1b2939',
              background: '#101822'
            },
            cursor: {
              show: true,
              zoom: true,
              showTooltip: false
            },
            highlighter: {
              show: true,
              lineWidthAdjust: 2.5,
              sizeAdjust: 5,
              showTooltip: true,
              tooltipLocation: 'n',
              tooltipOffset: 20,
              fadeTooltip: true,
              yvalues: 2,
              formatString: "<span style=\"display: none\">%s%s</span>%s"
            },
            series: [{ lineWidth: 3, fill: true, fillAndStroke: true, fillAlpha: 0.3, markerOptions: { show: false, style: 'circle' } }, { lineWidth: 3, fill: true, fillAndStroke: true, fillAlpha: 0.3, color: '#6b8fc3', markerOptions: { show: false, style: 'circle' } }],
            seriesColors: ["#688F3E"]
          });
        }
      }

    });
  }

  ItemActivityTicker.Load = function () {
    const currency = $J("#currency_buyorder").val() || (typeof g_rgWalletInfo !== 'undefined' && g_rgWalletInfo['wallet_currency']) || 1;

    // overwrite currency selection
    $J.ajax({
      url: window.location.protocol + '//steamcommunity.com/market/itemordersactivity',
      type: 'GET',
      data: {
        country: g_strCountryCode,
        language: g_strLanguage,
        currency: currency,
        item_nameid: this.m_llItemNameID || itemid,
        two_factor: BIsTwoFactorEnabled() ? 1 : 0
      }
    }).fail(function (jqxhr) {
      setTimeout(function () { ItemActivityTicker.Load(); }, 10000);
    }).done(function (data) {
      setTimeout(function () { ItemActivityTicker.Load(); }, 10000);
      if (data.success == 1) {
        if (data.timestamp > ItemActivityTicker.m_nTimeLastLoaded) {
          ItemActivityTicker.m_nTimeLastLoaded = data.timestamp;
          ItemActivityTicker.Update(data.activity);
        }
      }
    });
  }
}

function SIH_GetCurrencySelector() {
  const select = $J('<select id="currency_buyorder" style="margin: 5px 0 5px 10px;">');

  for (const code of Object.keys(g_rgCurrencyData)) {
    const currency = g_rgCurrencyData[code];
    select.append(`<option value="${currency.eCurrencyCode}" selected>${code}</option>`);
  }

  return select;
}

function SIH_GetOrderButton(type) {
  const id = (type === SIH_BUY) ? 'show_more_buy' : 'show_more_sell';

  return `
      <center>
          <div class="btn_grey_black btn_medium" id="${id}" style="margin-bottom: 10px;" onclick="SIH_toggleState(${type})">
              <span>Show More Orders <span class="popup_menu_pulldown_indicator" id="arrow_buy_button"></span></span>
          </div>
      </center>
  `;
}

function MainScript() {
  if (window.show_orders_currencies) {
    if ($J(".market_commodity_order_block").length > 0) {
      // Injects the hot-swap currency selector for commodity items
      $J("#largeiteminfo_item_actions").show();
      $J(".market_commodity_order_block").children().eq(1).after(SIH_GetCurrencySelector());
    }
    else if ($J("#market_buyorder_info_details_tablecontainer").length > 0) {
      // append the currency selector for weapon pages (with listings)
      $J("#market_buyorder_info_details_tablecontainer").prepend(SIH_GetCurrencySelector());
    }

    // set the proper value for the currency selector
    $J("#currency_buyorder").val((typeof g_rgWalletInfo !== 'undefined' && g_rgWalletInfo['wallet_currency']) || 1);

    // bind event handler to currency selector
    $J('#currency_buyorder').on('change', function () {
      if ((ItemActivityTicker.m_llItemNameID && $J(".market_commodity_order_block").length > 0)) {
        Market_LoadOrderSpread(ItemActivityTicker.m_llItemNameID);
        // update item activity
        ItemActivityTicker.Load();
      }
      else if ($J("#market_buyorder_info_details_tablecontainer").length > 0 && itemid) {
        Market_LoadOrderSpread(itemid);
      }
    });
  }

  // Start up the request if it is a commodity page
  if (ItemActivityTicker.m_llItemNameID) {
    Market_LoadOrderSpread(ItemActivityTicker.m_llItemNameID);
  }

  if (window.show_more_orders) {
    if (ItemActivityTicker.m_llItemNameID) {
      // Commodity Page
      $J(".market_commodity_orders_interior").eq(1).append(SIH_GetOrderButton(SIH_BUY));
      $J(".market_commodity_orders_interior").eq(0).append(SIH_GetOrderButton(SIH_SELL));
    }
    else {
      // Item Page
      $J("#market_buyorder_info_details_tablecontainer").append(SIH_GetOrderButton(SIH_BUY));
    }
  }
}


if (IS_ENABLED_SIH) {
  $J(function () {
    // document.addEventListener("DOMContentLoaded", BeforeScript);
    BeforeScript();
    if (document.readyState == 'complete') {
      MainScript();
    }
    else {
      window.addEventListener("load", MainScript);
    }

    if (typeof (g_oSearchResults) != 'undefined' && g_oSearchResults.OnAJAXComplete) {
      g_oSearchResults.OnAJAXComplete = function () {
        g_oSearchResults.m_bLoading = false;
        FraudAlert();
        addAllFloatButton();
      };

      if (window.noOfRows && window.noOfRows != 10) {
        g_oSearchResults.m_cPageSize = window.noOfRows;
        g_oSearchResults.GoToPage(0, true);
      } else {
        FraudAlert();
        addAllFloatButton();
      }

      var btReload = $J(`<a href="#" class="btn_grey_white_innerfade btn_small" accesskey="r"><span>${SIHLang.market.reloadlistings}</span></a>`);
      btReload.click(function () {
        g_oSearchResults.m_cMaxPages = g_oSearchResults.m_iCurrentPage + 1;
        g_oSearchResults.GoToPage(g_oSearchResults.m_iCurrentPage, true);
        return false;
      });
      if ($J('.market_listing_filter_clear_button_container').length == 0) {
        $J('#market_listing_filter_form').append('<div class="market_listing_filter_clear_button_container">');
      }
      $J('.market_listing_filter_clear_button_container').prepend(btReload);
      $J('#listings').on('click', '.sih-images img', function () {
        let hashStickerName = $J(this).prop('title');
        var link = g_strLanguage === 'english'
          ? 'http://steamcommunity.com/market/listings/730/' + encodeURIComponent(hashStickerName)
          : 'http://steamcommunity.com/market/search?q=' + encodeURIComponent(hashStickerName);
        window.open(link, '_blank');
      });

      $J('body').on('click', '.floatbutton', function () {
        const listingId = $J(this).data('id');
        $J(this).hide();
        $J(this).siblings('.spinner').show();
        floatQueue.push({ listingId, inspectLink: floatData[listingId].link });
      });

      $J('body').on('click', '#allfloatbutton', function () {
        $J('.market_listing_row[id^="listing_"]:has(.floatbutton)').each(function () {
          var listingId = $J(this).attr('id').substring(8);
          const floatDiv = $J(`#listing_${listingId}`).find(`#listing_${listingId}_float`);
          floatDiv.find('.floatbutton').hide();
          floatDiv.find('.spinner').show();
          floatQueue.push({ listingId, inspectLink: floatData[listingId].link });
        });
      });

      $J('body').on('click', '#sortlistings', function () {
        var order = 1;
        $this = $J(this);
        if ($this.find('.market_sort_arrow').is(':contains("▲")')) {
          order = -1;
          $this.find('.market_sort_arrow').text('▼');
        } else {
          $this.find('.market_sort_arrow').text('▲');
        }
        sortListingsByFloat(order);
      });

      // выбираем целевой элемент
      var target = document.getElementById('market_buynow_dialog');

      // создаём экземпляр MutationObserver
      var observer = new MutationObserver(function (mutations) {
        const isVisible = $J('#market_buynow_dialog').is(':visible');
        if (isVisible) {
          $J('#market_buynow_dialog .market_listing_game_name').show();
          $J('#market_buynow_dialog .sih-market-action').hide();
          if ($J('#market_buynow_dialog .float_block').find('.floatbutton').length) {
            $J('#market_buynow_dialog .float_block').hide();
          }
        }
      });

      // конфигурация нашего observer:
      var config = { attributes: true };

      // передаём в качестве аргументов целевой элемент и его конфигурацию
      observer.observe(target, config);

      processFloatQueue();
    }

    addDescriptionLinks();

    if (window.showbookmarks) showBookmarks(window.bookmarks, window.bookmarkscategories);

    const PUBG_APPID = 578080;
    if (g_rgAppContextData.hasOwnProperty(PUBG_APPID)) {
      const data = { appid: PUBG_APPID, market: 'bpoints' };
      chrome.runtime.sendMessage(SIHID, { type: 'GET_EXTERNAL_PRICES', data }, (e) => {
        if (e.success) {
          const name = $J('.hover_item_name').text();
          const points = e.prices[name];
          if (points !== undefined) $J(`<div class="bpoints" data-price="${points}">`).insertAfter('.item_desc_game_info');
        }
      });
    }
  });
}
