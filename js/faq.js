$(function () {
    chrome.browserAction.setPopup({
        popup: "html/faq.html"
    });
    $('.detail-link').click(function () {
        $(this).next('.detail-content').toggle();
    });
});