overrideDecline();
overrideShowTradeOffer();
updateLoggedInUserID();
trackPageView();

// chrome background tab throttling causes steam's own js files to load later than the these injections, so it does not override the functions
// this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
// this is a dirty but working fix for that
let thisManyTimes = 15;
let intervalID = setInterval(() =>{
    if(thisManyTimes > 0){
        overrideShowTradeOffer();
        overrideDecline();
    }
    else clearInterval(intervalID);
    thisManyTimes--;
}, 1000);

// makes the middle of the active trade offers a bit bigger making it the same size as a declined offer so it does not jerk the page when declining
document.querySelectorAll('.tradeoffer_items_rule').forEach(rule => {rule.style.height = '46px'});
