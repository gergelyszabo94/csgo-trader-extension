// ensures that we are on a profile page, it's not possible with simple regex
if (document.querySelector('body').classList.contains('profile_page')){
    logExtensionPresence();
    updateLoggedInUserID();
    trackEvent({
        type: 'pageview',
        action: 'ProfileView'
    });
    const profileOwnerSteamID = getProfileOwnerSteamID();
    const loggedInUserID =  getUserSteamID();

    let isProfilePrivate = false;
    let profileActionPopup = document.getElementById('profile_action_dropdown');
    if (profileActionPopup === null && profileOwnerSteamID !== loggedInUserID) isProfilePrivate = true;

    addReplytoCommentsFunctionality();
    addCommentsMutationObserver();

    // changes background and adds a banner if steamrep banned scammer detected
    chrome.storage.local.get('markScammers', result => {if(result.markScammers) warnOfScammer(profileOwnerSteamID, 'profile')});

    // resizes the elements where the rep or reoccuring buttons will be inserted
    let commentThreadEntryBox = document.querySelector('.commentthread_entry_quotebox');
    if (commentThreadEntryBox !== null) commentThreadEntryBox.setAttribute('style', 'width: 83%; display: inline-block;');

    if (loggedInUserID === profileOwnerSteamID){ //when on the logged in user's own profile
        chrome.storage.local.get(['reoccuringMessage', 'showReoccButton'], (result) => {
            if(result.showReoccButton){
                let reooccButton = `<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="reocc" style="padding: 5px;">Reocc<span></div>`;

                commentThreadEntryBox.insertAdjacentHTML('afterend', reooccButton);

                document.getElementById('reocc').addEventListener('click', () => {
                    // analytics
                    trackEvent({
                        type: 'event',
                        action: 'ReoccuringCommentPosted'
                    });

                   document.querySelectorAll('.commentthread_comment.responsive_body_text').forEach(commentThread => {
                       // regex: replaces whitespaces and steam text formatting tags
                       let toReplace = '';
                       steamTextFormatingTags.forEach(tag => {
                          toReplace += tag.replace('[','\\[').replace(']', '\\]') + '|';
                       });
                       toReplace += '\\s';
                       let toReplaceRegex = new RegExp(toReplace, 'g');

                       if (commentThread.querySelector('.commentthread_comment_text').innerText.replace(toReplaceRegex,'') === result.reoccuringMessage.replace(toReplaceRegex,'')){
                           commentThread.querySelectorAll('img')[1].click();
                       }
                    });
                   document.querySelector('.commentthread_textarea').value = result.reoccuringMessage;
                   setTimeout(() => {document.querySelectorAll('.btn_green_white_innerfade.btn_small')[1].click()}, 2000);

                });
            }
        });
    }
    else{ // when on someone else's profile
        if (!isProfilePrivate) {
            // adds "copy profile permalink" and "show offer history" to the context menu
            const copyPermalink = `<a class="popup_menu_item" href="#" id="copy_profile_perma_link"><img style="width: 16px; height: 16px" src="${chrome.runtime.getURL("images/paperclip.png")}">&nbsp; Copy Profile Permalink</a>`;
            const showOfferSummary = `<a class="popup_menu_item" href="#" id="show_offer_history"><img style="width: 16px; height: 16px" src="https://steamcommunity-a.akamaihd.net/public/images/profile/icon_tradeoffers.png">&nbsp; Show Offer History</a>`;
            profileActionPopup.querySelector('.popup_body.popup_menu.shadow_content').insertAdjacentHTML('beforeend', copyPermalink + showOfferSummary);

            // this is a workaround to only being able to copy text to the clipboard that is selected in a textbox
            const textareaToCopy = `<textarea id="text_area_to_copy_permalink" class="hidden-copy-textarea" readonly="">https://steamcommunity.com/profiles/${profileOwnerSteamID}</textarea>`;

            document.getElementById('copy_profile_perma_link').addEventListener('click', () => {
                // analytics
                trackEvent({
                    type: 'event',
                    action: 'ProfilePermalinkCopied'
                });
                document.querySelector('body').insertAdjacentHTML('beforeend', textareaToCopy);
                let textAreaElement = document.getElementById('text_area_to_copy_permalink');
                textAreaElement.select();
                document.execCommand('copy');
                textAreaElement.parentNode.removeChild(textAreaElement);

                // for the context menu to go away
                document.querySelector('.playerAvatarAutoSizeInner').click();
            });

            document.getElementById('show_offer_history').addEventListener('click', () => {
                // analytics
                trackEvent({
                    type: 'event',
                    action: 'ProfileOfferHistoryChecked'
                });
                // prints trade offer history summary
                chrome.storage.local.get(`offerHistory_${profileOwnerSteamID}`, (result) => {
                    let offerHistory = result[`offerHistory_${profileOwnerSteamID}`];
                    if (offerHistory === undefined) {
                        offerHistory = {
                            offers_received: 0,
                            offers_sent: 0,
                            last_received: 0,
                            last_sent: 0
                        }
                    }
                    let offerSummaryElement = `
                        <div class="trade_partner_info_block" style="color: lightgray"> 
                            <div>Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? dateToISODisplay(offerHistory.last_received) : '-'}</div>
                            <div>Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? dateToISODisplay(offerHistory.last_sent) : '-'}</div>
                        </div>`;

                    let profileStatusElement = document.querySelector('.responsive_status_info');

                    if (profileStatusElement !== null) profileStatusElement.insertAdjacentHTML('beforeend', offerSummaryElement);
                    else document.querySelector('.profile_header_badgeinfo').insertAdjacentHTML('beforeend', offerSummaryElement);

                    // for the context menu to go away
                    document.querySelector('.playerAvatarAutoSizeInner').click();
                });
            });

            // handles rep button related stuff
            chrome.storage.local.get(['reputationMessage', 'showPlusRepButton'], (result) => {
                if(result.showPlusRepButton){
                    let repButton = `<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="repper" style="padding: 5px;">+rep<span></div>`;

                    if (commentThreadEntryBox !== null) {
                        commentThreadEntryBox.insertAdjacentHTML('afterend', repButton);
                        document.getElementById('repper').addEventListener('click', () => {
                            // analytics
                            trackEvent({
                                type: 'event',
                                action: 'ReputionMessagePosted'
                            });
                            document.querySelector('.commentthread_textarea').value = result.reputationMessage;
                            setTimeout(() => {document.querySelectorAll('.btn_green_white_innerfade.btn_small')[1].click()}, 500);

                        });
                    }
                }
            });
            reportComments();
        }
    }

    chrome.storage.local.get('nsfwFilter', (result) => {
        if(result.nsfwFilter){
            // makes the profile background the same as the default one
            document.querySelector('.no_header.profile_page').setAttribute('style', 'background-image: url(https://steamcommunity-a.akamaihd.net/public/images/profile/profile_bg.jpg); background-repeat: repeat-x; background-color: #262627;');
            document.querySelectorAll('.profile_content, body, .no_header.profile_page').forEach(element => {element.classList.remove('has_profile_background')});

            // removes artwork and screenshot showcases
            document.querySelectorAll('.profile_background_holder_content, .screenshot_showcase').forEach(element => {element.parentNode.removeChild(element)});

            // changes avatar to the default one
            document.querySelector('.playerAvatarAutoSizeInner').querySelector('img').setAttribute('src', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg');
        }
    });
    overrideShowTradeOffer();

    // shows actual steam chat status if set in options
    chrome.storage.local.get('showRealStatus', (result) => {
        if(result.showRealStatus && !isProfilePrivate) {
            let statusDiv = document.querySelector('.profile_in_game.persona');
            if (statusDiv !== null) { // when there is right info column (sometimes profiles are not private but set to not have that by the user)
                if (statusDiv.classList.contains('online')) {
                    let textDiv = statusDiv.querySelector('.profile_in_game_header');

                    chrome.runtime.sendMessage({GetPlayerSummaries: profileOwnerSteamID}, (response) => {
                        if(response.apiKeyValid){
                            switch(response.personastate){
                                case 1: break;
                                case 2: textDiv.innerText = ('Currently Busy'); break;
                                case 3: textDiv.innerText = ('Currently Away'); break;
                                case 4: textDiv.innerText = ('Currently Snooze'); break;
                                case 5: textDiv.innerText = ('Currently Looking to Trade'); break;
                                case 6: textDiv.innerText = ('Currently Looking to Play'); break;
                            }
                        }
                    });
                }
            }
        }
    });

    // reloads the page on extension update/reload/uninstall
    chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});
}