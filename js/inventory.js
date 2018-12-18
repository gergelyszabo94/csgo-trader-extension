csDealsButtonText0 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect0" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';
csDealsButtonText1 ='<a class="btn_small btn_grey_white_innerfade" id="csdeals_inspect1" href="http://csgo.gallery/" target="_blank"><span>Inspect on CS.DEALS...</span></a>';
csDealsButtonHtml0 = $.parseHTML(csDealsButtonText0);
csDealsButtonHtml1 = $.parseHTML(csDealsButtonText1);

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    $("#iteminfo1_item_actions").append(csDealsButtonHtml1);
    inspectLink = $("#iteminfo1_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect1").attr("href", "http://csgo.gallery/" + inspectLink);

    $("#iteminfo0_item_actions").append(csDealsButtonHtml0);
    inspectLink = $("#iteminfo0_item_actions .btn_small").first().attr("href");
    $("#csdeals_inspect0").attr("href", "http://csgo.gallery/" + inspectLink);
});

observer.observe(document.getElementById("iteminfo0"), {
    subtree: false,
    attributes: true
});