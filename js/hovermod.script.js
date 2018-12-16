var lowestPriceWithFeeRegExp = /<span class="market_listing_price market_listing_price_with_fee">\s*(((?!Sold).)*?)\s*<\/span>/i;
var lowestPriceWithoutFeeRegExp = /<span class="market_listing_price market_listing_price_without_fee">\s*(((?!Sold).)*?)\s*<\/span>/i;
var insGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Inscribed Gem<\/span>/gi;
var kinGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Kinetic Gem<\/span>/gi;
var priGemExp = /<span style="font-size: 18px; color: rgb\(\d+, \d+, \d+\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Prismatic Gem<\/span>/gi;
var ethGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!<).)*?)<\/span><br><span style="font-size: 12px">Ethereal Gem<\/span>/gi;
var corGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Foulfell Shard<\/span>/gi;
var masGemExp = /<span style="font-size: 18px; color: rgb\(255, 255, 255\)">(((?!:).)*?): \d+<\/span><br><span style="font-size: 12px">Rune of the Duelist Indomitable<\/span>/gi;
var cachePrices = {};
var hItem = null;
var currencyId = 1;
var countryCode = 'US';
var UpdateTotal = null;
var mediumPrice = 0;
var mediumName = '';

var getMediumPrice = function (sItem) {
    var itemLink = window.location.protocol + "//steamcommunity.com/market/priceoverview/?appid=" + sItem.appid + "&country=" + countryCode + "&currency=" + currencyId + "&market_hash_name=" + encodeURIComponent(sItem.market_hash_name);
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

if (typeof (BShouldSuppressFades) == 'undefined') {
    BShouldSuppressFades = function () {
        return false;
    };
}

const getLowestPriceHandler = (item, pref, callback) => {
    var sItem = item;
    if ((sItem.description && !sItem.description.marketable) || !sItem.marketable) return;
    // from Steam's community market website
    if (typeof (sItem.market_hash_name) === 'undefined') {
        sItem.market_hash_name = sItem.market_name || sItem.name;
    }

    var itemLink = window.location.protocol + "//steamcommunity.com/market/priceoverview/?appid=" + sItem.appid + "&country=" + countryCode + "&currency=" + currencyId + "&market_hash_name=" + encodeURIComponent(sItem.market_hash_name);
    if (cachePrices[itemLink] && cachePrices[itemLink].nofeePrice) {
        sItem.nofeePrice = cachePrices[itemLink].nofeePrice;
        sItem.lowestPrice = cachePrices[itemLink].lowestPrice;
        sItem.volume = cachePrices[itemLink].volume;
        sItem.providerName = cachePrices[itemLink].providerName;
    }

    if (window.agp_gem && sItem.type !== "Rare Inscribed Gem" && sItem.appid == 570) {
        for (var i = 0; i < sItem.descriptions.length; i++) {
            var d = sItem.descriptions[i];
            if (d.insgems) break;

            var ematch, gidx = 0;
            d.insgems = [];

            while ((ematch = insGemExp.exec(d.value))) {
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId
                    + '&market_hash_name=Inscribed ' + ematch[1];
                d.insgems.push({name: 'Inscribed ' + ematch[1]});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;
                            //console.log(d);
                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;

                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            while (ematch = kinGemExp.exec(d.value)) {
                //console.log(ematch);
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId
                    + '&market_hash_name=Kinetic: ' + ematch[1];
                d.insgems.push({name: 'Kinetic: ' + ematch[1]});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;
                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            while (ematch = masGemExp.exec(d.value)) {
                //console.log(ematch);
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId +
                    '&market_hash_name=Rune%20of%20the%20Duelist%20Indomitable';
                d.insgems.push({name: 'Rune%20of%20the%20Duelist%20Indomitable'});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;
                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            while (ematch = corGemExp.exec(d.value)) {
                //console.log(ematch);
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId
                    + '&market_hash_name=Foulfell Shard';
                d.insgems.push({name: 'Foulfell Shard'});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;
                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            while (ematch = ethGemExp.exec(d.value)) {
                //console.log(ematch);
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId
                    + '&market_hash_name=Ethereal: ' + ematch[1];
                d.insgems.push({name: 'Ethereal: ' + ematch[1]});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;
                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            while (ematch = priGemExp.exec(d.value)) {
                //console.log(ematch);
                var gemLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=570&country=' + g_strCountryCode
                    + '&currency=' + currencyId
                    + '&market_hash_name=Prismatic: ' + ematch[1];
                d.insgems.push({name: 'Prismatic: ' + ematch[1]});

                PriceQueue.GetPrice({
                    method: "GET",
                    url: gemLink,
                    insert: true,
                    pars: {gemidx: gidx},
                    success: function (response, $this) {
                        var lp = 0, nfp = 0;
                        if (response.success) {
                            lp = response.lowest_price;
                            nfp = response.median_price;

                            d.insgems[$this.gemidx].lowestPrice = lp;
                            d.insgems[$this.gemidx].nofeePrice = nfp;
                            if (sItem === hItem) {
                                var elDescriptors = $(pref + '_item_descriptors');
                                PopulateDescriptions(elDescriptors, sItem.descriptions);
                            }
                        }
                    },
                    error: function () {}
                });
                gidx++;
            }

            if (gidx > 0) {
                //console.log(d);
            }
        }
    }

    // Temporary ignored
    if (typeof g_strLanguage === 'undefined') g_strLanguage = GetCookie('Steam_Language');
    if (window.agp_sticker && sItem.appid == 730 && g_strLanguage === 'english') {
        for (var i = 0; i < sItem.descriptions.length; i++) {
            var d = sItem.descriptions[i];
            if (d.type == 'html' && d.value.startsWith('<br><div id="sticker_info" name="sticker_info" title="Sticker Details"') && !d.stickers) {
                d.orgvalue = d.value;
                d.isstickers = true;
                var stIdx = d.value.indexOf('<br>Sticker:');
                if (stIdx == -1 || d.stickers) break;
                var stickers = d.value.substr(stIdx + 12, d.value.length - (stIdx + 27)).split(',');
                d.stickers = [];
                for (var i2 = 0; i2 < stickers.length; i2++) {
                    d.stickers.push({name: stickers[i2].trim()});
                    if (g_strCountryCode === undefined) {
                        g_strCountryCode = 'US';
                    }
                    var sticker_hash_name = encodeURIComponent(`Sticker | ${stickers[i2].trim()}`);
                    var stickerLink = window.location.protocol + '//steamcommunity.com/market/priceoverview/?appid=730&country=' + g_strCountryCode + '&currency=' + currencyId + '&market_hash_name=' + sticker_hash_name;
                    if (cachePrices[stickerLink]) {
                        d.stickers[i2].prices = cachePrices[stickerLink];
                        if (sItem === g_ActiveInventory.selectedItem) {
                            reloadDes();
                        }
                    } else {
                        PriceQueue.GetPrice({
                            method: "GET",
                            url: stickerLink,
                            pars: {stickeridx: i2},
                            success: function (response, $this) {
                                var lp = 0, nfp = 0;
                                if (response.success) {
                                    //cachePrices[this.url] = new Object();
                                    //cachePrices[this.url].lowestPrice =
                                    lp = response.lowest_price;
                                    //cachePrices[this.url].nofeePrice =
                                    nfp = response.median_price;

                                    d.stickers[$this.stickeridx].prices = {lowestPrice: lp, nofeePrice: nfp};// cachePrices[this.url];

                                    if (sItem === hItem) {
                                        var elDescriptors = $(pref + '_item_descriptors');
                                        PopulateDescriptions(elDescriptors, sItem.descriptions);
                                    }
                                }
                            },
                            error: function () {}
                        });
                    }
                }

            }
        }
    }

    if (sItem.lowestPrice) {
        //var ddHtml = "<a href='#' target='_blank' title='" + sItem.nofeePrice + "'>" + sItem.lowestPrice;
        //if (sItem.volume) {
        //    ddHtml += ' <span style="font-size: 0.9em; font-style: italic">(V: ' + sItem.volume + ')</span>';
        //}

        //ddHtml += "</a>"
        //if (mediumPrice && sItem.market_hash_name !== mediumName) {
        //    var price = parseFloat(getNumber(sItem.lowestPrice)),
        //        mprice = parseFloat(getNumber(mediumPrice)),
        //        eq = (price / mprice).toFixed(2);
        //    ddHtml += ' (' + eq + ' ' + mediumName + ')';
        //}

        //$J('#' + pref + 'iprice').html(ddHtml);
        //$J('#' + pref + 'iprice').find('a').attr('href', itemLink);
        PriceQueue.GenPriceDescription(sItem);
        if (sItem === hItem) {
            var elDescriptors = $(pref + '_item_descriptors');
            PopulateDescriptions(elDescriptors, sItem.descriptions);
        }
        if (UpdateTotal) UpdateTotal(sItem);
        if (callback) callback(sItem);
        return;
    }

    //if (!sItem.marketable) {
    //    $J('#iprice').html("Not Marketable");
    //    return;
    //}

    PriceQueue.GetPrice({
        method: "GET",
        url: itemLink,
        insert: true,
        success: function (response) {
            if (response.success) {
                sItem.lowestPrice = response.lowest_price || 'Can\'t get price';
                sItem.nofeePrice = response.median_price || 'Can\'t get price';
                sItem.volume = response.volume || '';
                sItem.providerName = response.providerName || '';

                PriceQueue.GenPriceDescription(sItem);

                if (sItem === hItem) {
                    var elDescriptors = $(pref + '_item_descriptors');
                    PopulateDescriptions(elDescriptors, sItem.descriptions);
                }
                //var ddHtml = "<a href='#' target='_blank' title='" + sItem.nofeePrice + "'>" + sItem.lowestPrice;
                //if (sItem.volume) {
                //    ddHtml += ' <span style="font-size: 0.9em; font-style: italic">(V: ' + sItem.volume + ')</span>';
                //}

                //ddHtml += "</a>"
                //if (mediumPrice && sItem.market_hash_name !== mediumName) {
                //    var price = parseFloat(getNumber(sItem.lowestPrice)),
                //        mprice = parseFloat(getNumber(mediumPrice)),
                //        eq = (price / mprice).toFixed(2);
                //    ddHtml += ' (' + eq + ' ' + mediumName + ')';
                //}
                //$J('#' + pref + 'iprice').html(ddHtml);
                //$J('#' + pref + 'iprice').find('a').attr('href', itemLink);
            } else {
                sItem.lowestPrice = 'Fail';
                sItem.nofeePrice = 'Fail';
                PriceQueue.GenPriceDescription(sItem);

                //if (sItem === hItem) {
                //    var ddHtml = "<a href='#' target='_blank' title='" + sItem.nofeePrice + "'>" + sItem.lowestPrice + "</a>";
                //    $J('#' + pref + 'iprice').html(ddHtml);
                //    $J('#' + pref + 'iprice').find('a').attr('href', itemLink);
                //}
            }

            // if (UpdateTotal) {
            //     UpdateTotal(sItem);
            // }
            if (callback) {
                callback(sItem);
            }
        },
        error: function (response) {
            if (!response.success) {
                cachePrices[itemLink] = new Object();
                cachePrices[itemLink].lowestPrice = sItem.lowestPrice = 'Fail';
                cachePrices[itemLink].nofeePrice = sItem.nofeePrice = 'Fail';

                if (sItem === hItem) {
                    $J('#' + pref + 'iprice').html("<a href='#' target='_blank' title='" + sItem.nofeePrice + "'>" + sItem.lowestPrice + "</a>");
                    $J('#' + pref + 'iprice').find('a').attr('href', itemLink);
                }
            }
            if (UpdateTotal) UpdateTotal(sItem);
            if (callback) callback(sItem);
        }
    });
};

var clearCachePrices = function () {
    cachePrices = {};
};

var ModifyDescriptionFunction = function () {
    PopulateDescriptions = function (elDescriptions, rgDescriptions) {
        if (elDescriptions) {
            elDescriptions.update('');
        } else {
            return;
        }

        if (!rgDescriptions || !rgDescriptions.length) {
            elDescriptions.hide();
            return;
        }

        elDescriptions.show();
        var setEl = null;
        var setName = null;
        var totalPrice = 0;
        var missingParts = [];
        for (var i = 0; i < rgDescriptions.length; i++) {
            var description = rgDescriptions[i];
            if (!description.value) continue;

            var strParsedDescription = v_trim(description.value.replace(/\[date\](\d*)\[\/date\]/g, function (match, p1) {
                var date = new Date(p1 * 1000);
                return date.toLocaleString();
            }));

            var elDescription = new Element('div', {'class': 'descriptor'});
            if (description.color) {
                elDescription.style.color = '#' + description.color;
            }

            // just use a blank space for an empty string
            if (strParsedDescription.length == 0) {
                elDescription.update('&nbsp;');
            } else if (description.type == 'image') {
                var elImage = new Element('img', {src: v_trim(description.value)});
                elDescription.appendChild(elImage);
            } else if (description.type == 'html') {
                var html = strParsedDescription;
                if (description.app_data && !description.app_data.limited && !description.app_data.is_itemset_name) {
                    var item = {};
                    if (description.app_data.price) {
                        var pp = getNumber(description.app_data.price);
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
                    //console.log(description.insgems);
                    html = description.value;
                }

                elDescription.update(html);

            } else {
                elDescription.update(strParsedDescription.escapeHTML().replace(/\n/g, '<br/>'));
            }

            if (description.app_data && description.app_data.is_itemset_name) {
                setEl = elDescription;
                setName = description.value;
            }

            if (description.label) {
                var elLabel = new Element('span', {'class': 'descriptor_label'});
                elLabel.update(description.label + ': ');
                elDescription.insert({top: elLabel});
            }

            elDescriptions.appendChild(elDescription);
        }
        //console.log(totalPrice);
        if (setEl && totalPrice > 0) {
            //var totalStr = (Math.round(totalPrice * 100) / 100) + '';
            //if (totalStr.lastIndexOf('.') == -1) totalStr += '.00';
            //totalStr = totalStr.replace(/(\d)(\d{3})([,\.])/, '$1,$2$3');
            setEl.update(setName + ' (' + formatNumber(totalPrice) + ')');

            if (missingParts.length > 0 && g_bViewingOwnProfile && g_bMarketAllowed && buysetbuttons && !elDescriptions.id.startsWith('hover')) {
                var buySetBtn = $J('<a href="#" class="buy-set">' + SIHLang.buymissing + '</a>');
                buySetBtn.click(function () {
                    BuySetDialog.Show(missingParts);
                    return false;
                });
                $J(setEl).append('<br />').append(buySetBtn);
            }
        }

    };

    if (PopulateTags) {
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
    }
};

$J(function () {
    currencyId = typeof (g_rgWalletInfo) != 'undefined' && g_rgWalletInfo.wallet_currency ? g_rgWalletInfo.wallet_currency : 1;
    countryCode = typeof (g_rgWalletInfo) != 'undefined' && g_rgWalletInfo.wallet_country ? g_rgWalletInfo.wallet_country : 'US';
    if (typeof (window.currency) != 'undefined' && window.currency != '') {
        currencyId = window.currency;
    }

    if (window.usevector) {
        var _mediumName = GetCookie('mediumname');
        var _mediumAppid = GetCookie('mediumappid');

        if (_mediumName && _mediumAppid) {
            getMediumPrice({market_hash_name: _mediumName, appid: _mediumAppid});
        }
    }

    ModifyDescriptionFunction();

    BuildHover = (prefix, item, owner) => {
        var imageName = item.icon_url_large ? item.icon_url_large : item.icon_url;
        hItem = item;
        var url = (g_bIsTrading) ? ImageURL(imageName, 192, 192) : ImageURL(imageName, 330, 192);
        var strHoverClass = 'item_desc_content';
        if (item.appid) {
            strHoverClass = strHoverClass + ' app' + item.appid + ' context' + item.contextid;
        }

        $(prefix + '_content').className = strHoverClass;
        $(prefix + '_item_icon').src = url;
        $(prefix + '_item_icon').alt = item.name;

        var strName = GetNameForItem(item);
        $(prefix + '_item_name').update(strName.escapeHTML());
        if ($J('#' + prefix + 'iprice').length == 0) {
            $J('#' + prefix + '_item_name').after('<h2 id="' + prefix + 'iprice">');
        }

        //$J('#iprice').html('loading...');
        if (window.agp_hover && item.appid !== 440) {
            getLowestPriceHandler(item, prefix);
        }
        //if (owner && typeof (apiItems) != undefined && item.appid == 570) {
        //    $J('.equiped').remove();
        //    if (item && apiItems && owner && apiItems[owner.strSteamId]) {
        //        $J.each(apiItems[owner.strSteamId], function (i, o) {
        //            if (o.id == item.id) {
        //                if (o.equipped) {
        //                    $J('#' + prefix + '_item_name').after('<div class="equiped">Equiped</div>');
        //                }
        //                $J(elDescriptions).prepend('<div>Equiped</div>');
        //                return false;
        //            }
        //        });
        //    }
        //}

        var el = $J(`div[data-economy-item*="${item.appid}/${item.classid}${item.instanceid ? '/' + item.instanceid : ''}"]`);
        if (el.length == 1) {
            el = el[0];
            el.rgItem = item;
        }

        var elArrowLeft = $(prefix + '_arrow_left');
        var elArrowRight = $(prefix + '_arrow_right');
        if (item.name_color) {
            $(prefix + '_item_name').style.color = '#' + item.name_color;
            $(prefix + '_content').parentNode.style.borderColor = '#' + item.name_color;
            if (elArrowLeft) {
                elArrowLeft.style.borderRightColor = '#' + item.name_color;
            }
            if (elArrowRight) {
                elArrowRight.style.borderLeftColor = '#' + item.name_color;
            }
        } else {
            $(prefix + '_item_name').style.color = '';
            $(prefix + '_content').parentNode.style.borderColor = '';
            if (elArrowLeft) {
                elArrowLeft.style.borderRightColor = '';
            }
            if (elArrowRight) {
                elArrowRight.style.borderLeftColor = '';
            }
        }

        var elFraudWarnings = $(prefix + '_fraud_warnings');
        if (elFraudWarnings) {
            // on the inventory page, we only show fraud warnings for currency (special privacy notice)
            if (item.fraudwarnings || (g_bIsInventoryPage && item.is_currency)) {
                elFraudWarnings.update('');
                if (item.fraudwarnings) {
                    for (var i = 0; i < item.fraudwarnings.length; i++) {
                        var warning = new Element('div', {'class': 'fraud_warning_box'});
                        var warningImage = new Element('img', {
                            'class': 'fraud_warning_image',
                            src: window.location.protocol + '//cdn.steamcommunity.com/public/images/sharedfiles/icons/icon_warning.png'
                        });
                        warning.appendChild(warningImage);
                        var warningText = new Element('span');
                        warningText.update(item.fraudwarnings[i]);
                        warning.appendChild(warningText);
                        elFraudWarnings.appendChild(warning);
                    }
                }
                if (g_bIsInventoryPage && item.is_currency) {
                    var warning = new Element('div');
                    warning.update('This amount is private and shown only to you.');
                    elFraudWarnings.appendChild(warning);
                }
                elFraudWarnings.show();
            } else {
                elFraudWarnings.hide();
            }
        }

        if (item.appid && g_rgAppContextData[item.appid]) {
            var rgAppData = g_rgAppContextData[item.appid];
            $(prefix + '_game_icon').src = rgAppData.icon;
            $(prefix + '_game_icon').alt = rgAppData.name;
            $(prefix + '_game_name').update(rgAppData.name);
            $(prefix + '_item_type').update(item.type);
            $(prefix + '_game_info').show();
        } else {
            $(prefix + '_game_info').hide();
        }

        var elDescriptors = $(prefix + '_item_descriptors');
        PopulateDescriptions(elDescriptors, item.descriptions);

        var elActions = $(prefix + '_item_actions');
        if (elActions) {
            PopulateActions(prefix, elActions, item.actions, item);
        }

        var elOwnerDescriptors = $(prefix + '_item_owner_descriptors');
        if (elOwnerDescriptors) {
            PopulateDescriptions(elOwnerDescriptors, item.owner_descriptions)
        }

        var elOwnerActions = $(prefix + '_item_owner_actions');
        if (elOwnerActions) {
            PopulateActions(prefix, elOwnerActions, item.owner_actions, item);
        }

        var elCurrencyInTradeDescriptor = $(prefix + '_currency_in_trade');
        if (elCurrencyInTradeDescriptor) {
            elCurrencyInTradeDescriptor.update('');
            if (item.is_currency && item.parent_currency && owner == UserYou) {
                // this item is currency in a trade, display how much is being offered
                var rgContext = owner && owner.GetContext(item.appid, item.contextid);
                var oParams = {};
                oParams.amount = v_numberformat(item.amount);
                oParams.contextname = rgContext ? rgContext.name : '';
                oParams.currencystyle = item.name_color ? 'color: #' + item.name_color + ';' : '';
                elCurrencyInTradeDescriptor.update(HoverCurrencyFromTemplate.evaluate(oParams));
            }
        }

        var elTags = $(prefix + '_item_tags');
        var elTagsContent = $(prefix + '_item_tags_content');
        if (elTags && elTagsContent) {
            PopulateTags(elTags, elTagsContent, item.tags);
        }

        var elMarketActions = $(prefix + '_item_market_actions');
        if (elMarketActions) {
            PopulateMarketActions(elMarketActions, item);
        }

        $(prefix).builtFor = item;
        $(prefix).builtForAmount = item.amount;
    };

    AddItemHoverToElement = function (element, rgItem) {
        element = $(element);
        element.observe('mouseover', MouseOverItem.bindAsEventListener(null, UserYou, element, rgItem));
        element.observe('mouseout', MouseOutItem.bindAsEventListener(null, UserYou, element, rgItem));
    };

    if (window.gpdelayscc) {
        PriceQueue._successDelay = window.gpdelayscc;
    }
    if (window.gpdelayerr) {
        PriceQueue._failureDelay = window.gpdelayerr;
    }
});

setTimeout(function () {
    if (window.gpdelayscc) {
        PriceQueue._successDelay = window.gpdelayscc;
    }
    if (window.gpdelayerr) {
        PriceQueue._failureDelay = window.gpdelayerr;
    }
}, 10);
