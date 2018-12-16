var sGen = document.createElement('script');
sGen.src = chrome.runtime.getURL('js/lang/_gen.js');
(document.head || document.documentElement).appendChild(sGen);
sGen.onload = function () {
    sGen.parentNode.removeChild(sGen);
};

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

var script = document.createElement('script');
script.textContent = `window.SIHID = '${chrome.runtime.id}'`;
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var sOffer = document.createElement('script');
sOffer.src = chrome.runtime.getURL('js/gifts.script.js');
(document.head || document.documentElement).appendChild(sOffer);
sOffer.onload = function () {
    sOffer.parentNode.removeChild(sOffer);
};
