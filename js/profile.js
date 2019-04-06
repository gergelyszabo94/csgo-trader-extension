//ensures that we are on a profile page, it's not possible with simple regex
if($("body").hasClass("profile_page")){
    const profileOwnerSteamID = getProfileOwnerSteamID();

    if(getUserSteamID()===profileOwnerSteamID){ //when on the logged in user's own profile
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

            //flags scam comments that include one of these strings
            chrome.storage.sync.get(['flagScamComments'], function(result) {
                if(result.flagScamComments) {
                    const commentsToReport = [
                        'free skins CS:GO(100$)',
                        'for all of your csgo graffitties',
                        'CS:GO Cases For Keys',
                        'the amount depends on hours in csgo',
                        'promocode',
                        'gives its users FREE',
                        'for all your graffities and cases',
                        'Your SteamID is selected as winner',
                        'CS:GO CASES = 1 CS:GO KEY',
                        'You are winner on weekly giveaway',
                        'Do you want free skins',
                        'Free skins CS:GO',
                        'replenish your inventory with good skins',
                        'gives its users a Karambit Fade',
                        'this guy in my profile gives his skins',
                        'bot to trade your cases for keys',
                        'join tradeit and take part at promo action there',
                        'Do you want free items for',
                        'Do you want some free skins?',
                        'watch this video and enjoy',
                        'tradeit giveaway about',
                        'Do you want to earn money?',
                        'I want to collect as much graffities as possible',
                        'Hi you can take 50 coins with my promo',
                        'tastyskins',
                        'gives to his users',
                        'I\'m a major csgo playe and I\'ll trade my',
                        'join the GIVEAWAY on gabenskins.pro',
                        'Trade Your Cases For Keys',
                        ' join bloodyskins',
                        '🔴🔴🔴🔴🔴🔴⚪⚪⚪🔴', //emoticon swastika
                        'asians are crazy',
                        'asian_guy',
                        'Your Steam ID is randomly selected'
                    ];

                    let spamTExtCheck = new RegExp(commentsToReport.join("|"), "i");

                    $(".commentthread_comment.responsive_body_text").each(function () {
                        $commentthread = $(this);
                        if (spamTExtCheck.test($commentthread.find(".commentthread_comment_text").text()) && !$commentthread.hasClass("hidden_post")) {
                            $commentthread.find("img")[1].click();
                        }
                    });
                }
            });
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

    chrome.storage.sync.get(['showRealStatus'], function(result) {
        if(result.showRealStatus){
            $statusDiv = $(".profile_in_game.persona");
            if($statusDiv.hasClass("online")){
                $textDiv = $statusDiv.children(".profile_in_game_header");
                chrome.runtime.sendMessage({GetPlayerSummaries: profileOwnerSteamID}, function(response) {
                    if(response.apiKeyValid){
                        switch(response.personastate){
                            case 1: break;
                            case 2: $textDiv.text("Currently Busy"); break;
                            case 3: $textDiv.text("Currently Away"); break; //It looks like the other ones might not really exist anymore
                            case 4: $textDiv.text("Currently Snooze"); break;
                            case 5: $textDiv.text("Currently Looking to Trade"); break;
                            case 6: $textDiv.text("Currently Looking to Play"); break;
                        }
                    }
                });
            }
        }
    });
}
