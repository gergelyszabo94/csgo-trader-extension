overrideDecline();
overrideShowTradeOffer();

//chrome background tab throttling causes steam's own js files to load later than the these injections, so it does not override the functions
//this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
//this is a dirty but working fix for that
setTimeout(function () {
    overrideShowTradeOffer();
    overrideDecline();
}, 10000);