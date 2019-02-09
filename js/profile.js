//ensures that we are on a profile page, it's not possible with simple regex
if($("body").hasClass("profile_page")){
    chrome.storage.sync.get(['reputationMessage'], function(result) {
        let repText =result.reputationMessage;
        let repButton = `<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="repper" style="padding: 5px;">+rep<span></div>`;

        $commentthreadentrybox = $(".commentthread_entry_quotebox");
        $commentthreadentrybox.css({"width": "83%", "display":"inline-block"});
        $commentthreadentrybox.after(repButton);

        $("#repper").click(function () {
            $(".commentthread_textarea").val(repText);
            setTimeout(function(){
                $(".btn_green_white_innerfade")[1].click();
            }, 500);
        });
    });
    overrideShowTradeOffer();
}