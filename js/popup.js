chrome.runtime.sendMessage({badgetext: ""}, function(response) {});

let version = chrome.runtime.getManifest().version;
$("#version").text(version);

