$(function () {
    setLocaleString();
});
function setLocaleString() {
    $('[data-msgname]').each(function (e, i) {
        var msg = chrome.i18n.getMessage($(this).data('msgname'));
        if (msg)
            $(this).html(msg);
    });
}