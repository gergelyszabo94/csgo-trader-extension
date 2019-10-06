gaTrackPageView();

// sets extension version
let version = chrome.runtime.getManifest().version;
document.getElementById('version').innerText = version;