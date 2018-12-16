$(function () {
    $('.version').html(chrome.runtime.getManifest().version);
    $('#lnk_view').click(function (e) {
        e.preventDefault();
        chrome.storage.local.set({
            latestver: chrome.runtime.getManifest().version
        }, function () {
        });
        chrome.browserAction.setPopup({
            popup: "html/tradeoffers.html"
        });
        chrome.browserAction.setBadgeText({text: ""});
        window.open('http://steamcommunity.com/groups/SteamInventoryHelper#announcements', '_blank');
    });
    $('#lnk_skip').click(function (e) {
        e.preventDefault();
        chrome.storage.local.set({
            latestver: chrome.runtime.getManifest().version
        }, function () {
        });
        chrome.browserAction.setBadgeText({text: ""});
        location.href = "tradeoffers.html";
    });
});
