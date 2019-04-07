chrome.storage.sync.get(['tradersBump'], function(result) {
    if(result.tradersBump){
        setTimeout(function () { //ugly way to wait for the trades to load and become "bumpable"
            bump();
        }, 2000);

        let reloadInterval = Math.floor((Math.random() * 10) + 31);

        setTimeout(function () {
            location.reload()
        }, reloadInterval*60*1000);

        function bump(){
            console.log($(".btn.btn-custom.btn-xs"));
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            console.log(time);
            $(".btn.btn-custom.btn-xs").each(function () {
                let link = $(this).attr("href");
                let xhr = new XMLHttpRequest();
                xhr.open("GET", link, true);
                try {
                    xhr.send();
                }
                catch (e) {
                    console.log(e);
                }
            });
        }
    }
});