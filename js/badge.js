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

var cssM = document.createElement('link');
cssM.href = window.location.protocol + '//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css';
cssM.rel = 'stylesheet';
cssM.type = 'text/css';
(document.head || document.documentElement).appendChild(cssM);

chrome.storage.sync.get({
    lang: ''
}, function (items) {

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

var sOffer = document.createElement('script');
sOffer.src = chrome.runtime.getURL('js/badge.script.js');
(document.head || document.documentElement).appendChild(sOffer);
sOffer.onload = function () {
    sOffer.parentNode.removeChild(sOffer);
};

var sModal = document.createElement('script');
sModal.src = `${window.location.protocol}//steamcommunity-a.akamaihd.net/public/javascript/modalv2.js?v=xM3yIvzXuMtB&amp;l=english`;
(document.head || document.documentElement).appendChild(sModal);
sModal.onload = function () {
    sModal.parentNode.removeChild(sModal);
};
