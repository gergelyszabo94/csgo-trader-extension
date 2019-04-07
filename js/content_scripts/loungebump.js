chrome.storage.sync.get(['loungeBump'], function(result) {
    if(result.loungeBump){
        setTimeout(function () { //ugly way to wait for the trades to load and become "bumpable"
            bump();
        }, 5000);

        let reloadInterval = Math.floor((Math.random() * 10) + 31);

        setTimeout(function () {
            location.reload()
        }, reloadInterval*60*1000);

        function bump(){
            $(".btn-bump___1-VFc").click();
        }
    }
});