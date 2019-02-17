//ensures that we are on a profile page, it's not possible with simple regex
if($("body").hasClass("profile_page")){

    if(getUserSteamID()===getProfileOwnerSteamID()){ //when on the logged in user's own profile
        chrome.storage.sync.get(['reoccuringMessage', 'showReoccButton'], function(result) {
            if(result.showReoccButton){
                let reooccText = result.reoccuringMessage;
                let reooccButton = `<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="reocc" style="padding: 5px;">Reocc<span></div>`;

                $commentthreadentrybox = $(".commentthread_entry_quotebox");
                $commentthreadentrybox.css({"width": "83%", "display":"inline-block"});
                $commentthreadentrybox.after(reooccButton);

                $("#reocc").click(function () {
                    $(".commentthread_comment.responsive_body_text").each(function(){
                        $commentthread = $(this);
                        if($commentthread.find(".commentthread_comment_text").text().replace(/\s/g,'')===result.reoccuringMessage.replace(/\s/g,'')){
                            $commentthread.find("img")[1].click();
                        }
                    });
                    $(".commentthread_textarea").val(reooccText);
                    setTimeout(function(){
                        $(".btn_green_white_innerfade.btn_small")[1].click();
                    }, 2000);
                });
            }
        });
    }
    else{ //when on someone else's profile
        chrome.storage.sync.get(['reputationMessage', 'showPlusRepButton'], function(result) {
            if(result.showPlusRepButton){
                let repText =result.reputationMessage;
                let repButton = `<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="repper" style="padding: 5px;">+rep<span></div>`;

                $commentthreadentrybox = $(".commentthread_entry_quotebox");
                $commentthreadentrybox.css({"width": "83%", "display":"inline-block"});
                $commentthreadentrybox.after(repButton);

                $("#repper").click(function () {
                    $(".commentthread_textarea").val(repText);
                    setTimeout(function(){
                        $(".btn_green_white_innerfade.btn_small")[1].click();
                    }, 500);
                });
            }
        });
    }

    chrome.storage.sync.get(['nsfwFilter'], function(result) {
        if(result.nsfwFilter){
            //makes the profile background the same as the default one
            $(".no_header.profile_page").css({"background-image": "url(https://steamcommunity-a.akamaihd.net/public/images/profile/profile_bg.jpg)", "background-repeat": "repeat-x", "background-color": "#262627"});
            $(".no_header.profile_page").removeClass("has_profile_background ");
            $(".profile_content").removeClass("has_profile_background ");
            $("body").removeClass("has_profile_background ");
            $(".profile_background_holder_content").remove();

            //hides artwork and screenshot showcases
            $(".screenshot_showcase").hide();

            //changes avatar to the default one
            $(".playerAvatarAutoSizeInner").find("img").attr("src", "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg");
        }
    });
    overrideShowTradeOffer();
}

//scam comments to report:
/*Join in! Free skins CS:GO(100$) for you. Watch this video and enjoy!
https://www.youtube.com/watch?v=-1lr6qNjcQ8*/

/*Hi, I can give my Tiger Tooth M9 bayonet for all of your csgo graffitties (Im collecting them) so if it's ok send me trade offer please. Trade link in my profile bio*/

/*Do you want free skins CS:GO(100$)? Then watch this video and enjoy!
https://www.youtube.com/watch?v=STJUNvCnCRE*/

/*Trade Your CS:GO Cases For Keys! 4 Cases = 1 key!*/

/*Hello bro, join csmoney and take part at promo action there! Take your 50$ or more on balance(the amount depends on hours in csgo) to our users with promocode! Promo limited , do not miss your chance to take free skins! Link to csmoney at my profile*/

// name: csmoney promo bot
// BOT#1 GIVEAWAY

/*The legendary {LINK REMOVED} gives its users FREE a Bayonet doppler! Deposit is not needed! Simply enter a promotional code PROMOFREEDOPPLER and pick up your knife. Do not miss your luck*/

/*Hello, I want to trade all your inventory (without cases and trash) for my Stattrak AK-47 Vulcan. Its around 300$ so I think it's a good offer for you. Send me trade offer please if you agree, AK and trade link are in the profile description. I don't add friends for safety so just send offer in my main profile*/

/*Hi, I will to trade my AK-47 | Redline for all your graffities and cases so if you dont need them send me trade offer please. Trade link and m4a1-s are in my main profile - http://steamcommunity.com/profiles/76561197989034852 . pls dont add to friends, just send offer*/

/*Dear winner
Your SteamID is selected as winner of Weekly giveaway.
Get your ★ Butterfly Knife | Doppler Phase 2 on http://csfast.pro
Use GIVEAWAY CODE:
2OFx0aGkYm*/
