// ==UserScript==
// @name        Steam inventory helper (Inventory page)
// @namespace   http://www.vplghost.com
// @version     1.5.6
// @author      VplGhost
// @description Lite version of SIH - Inventory page
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @include     http://steamcommunity.com/id/*/inventory
// @include     http://steamcommunity.com/id/*/inventory/*
// @include     http://steamcommunity.com/profiles/*/inventory
// @include     http://steamcommunity.com/profiles/*/inventory/*
// @include     https://steamcommunity.com/id/*/inventory
// @include     https://steamcommunity.com/id/*/inventory/*
// @include     https://steamcommunity.com/profiles/*/inventory
// @include     https://steamcommunity.com/profiles/*/inventory/*
// @resource    scriptGen gen.js?v=1411141453
// @resource    scriptInvent inventprice.script.min.js?v=1411141453
// @resource    scriptScroll jquery.scrollbar.min.js
// @resource    cssInvent inventscript.css?v=1411141453
// @resource    cssScroll jquery.scrollbar.css
// @updateURL   http://vplghost.com/Download/InventPriceCheck/inventscript.user.js
// @downloadURL http://vplghost.com/Download/InventPriceCheck/inventscript.user.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceURL
// ==/UserScript==

function main(callback) {
    var actualCode = ['window.fastdelta = -0.01;',
        'window.quicksellbuttons = true;',
        'window.buysetbuttons = true;',
        'window.usevector = true;',
        'window.currency = \'\';',
        'document.body.className = \'simple\';'
    ].join('\r\n');

    //document.body.className = 'simple';

    var scriptOpt = document.createElement('script');
    scriptOpt.textContent = actualCode;
    (document.head || document.documentElement).appendChild(scriptOpt);
    scriptOpt.parentNode.removeChild(scriptOpt);

    var sGen = document.createElement('script');
    sGen.setAttribute("src", GM_getResourceURL('scriptGen'));
    //sGen.src = 'http://vplghost.com/Download/InventPriceCheck/_gen.js';
    //(document.head || document.documentElement).appendChild(sGen);
    sGen.onload = function () {
        sGen.parentNode.removeChild(sGen);
    };

    var script = document.createElement("script");

    script.setAttribute("src", GM_getResourceURL('scriptInvent'));
    //script.setAttribute("src", 'http://vplghost.com/Download/InventPriceCheck/inventprice.script.min.js');

    var sScroll = document.createElement('script');
    sScroll.src = GM_getResourceURL('scriptScroll');//'http://vplghost.com/Download/InventPriceCheck/jquery.scrollbar.min.js';
    (document.head || document.documentElement).appendChild(sScroll);
    sScroll.onload = function () {
        sScroll.parentNode.removeChild(sScroll);
    };

    var cssM = document.createElement('link');
    cssM.href = window.location.protocol + '//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css';
    cssM.rel = 'stylesheet';
    cssM.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssM);

    var cssF = document.createElement('link');
    cssF.href = GM_getResourceURL('cssInvent');//'http://vplghost.com/Download/InventPriceCheck/inventscript.css';
    cssF.rel = 'stylesheet';
    cssF.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssF);

    var cssC = document.createElement('link');
    cssC.href = GM_getResourceURL('cssScroll');// 'http://vplghost.com/Download/InventPriceCheck/jquery.scrollbar.css';
    cssC.rel = 'stylesheet';
    cssC.type = 'text/css';
    (document.head || document.documentElement).appendChild(cssC);

    document.body.appendChild(sGen);
    document.body.appendChild(script);
}

main();