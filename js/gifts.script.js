var giftsID = [];
var cacheResult = null;
var isGmail = false;

var SplitGmail = function (email) {
    email = email.toLowerCase().trim();
    var idx = email.lastIndexOf('@gmail.com');
    if (idx == -1) return [email];
    if (email.substring(idx) != '@gmail.com') return [email];
    return [email.substring(0, idx), email.substring(idx)]
};

function SendGifts() {
    if (g_bSendGiftCallRunning) {
        return;
    }

    var gidGift = null;
    $J('[data-giftid]').each(function () {
        var data = $J(this).data();
        if (!data.done) {
            gidGift = data.giftid;
            $J(this).data('done', true);
            $J(this).find('.loading').show();
            return false;
        }
    });

    if (gidGift) {
        console.log('Sending: ' + gidGift);
    } else {
        console.log('Done');
        OnSendGiftSuccess(cacheResult);
        return false;
    }
    var giftee_account_id = 0;
    var giftee_email = '';
    var giftee_name = '';
    var gift_message = '';
    var gift_sentiment = '';
    var gift_signature = '';
    var bIsGift = true;
    try {
        if ($('send_via_email').checked) {
            giftee_email = $('email_input').value;
            var res = SplitGmail(giftee_email);
            if (res.length == 2) {
                giftee_email = res[0] + '+' + gidGift + res[1];
                isGmail = true;
            } else {
                isGmail = false;
            }
        } else {
            giftee_account_id = currently_selected_friend_id;
        }
        giftee_name = $('gift_recipient_name').value;
        gift_message = $('gift_message_text').value;
        gift_sentiment = $('gift_sentiment').value;
        gift_signature = $('gift_signature').value;

        g_bSendGiftCallRunning = true;

        new Ajax.Request('https://store.steampowered.com/checkout/sendgiftsubmit/',
            {
                method: 'post',
                parameters: {
                    // gift info
                    'GifteeAccountID': giftee_account_id,
                    'GifteeEmail': giftee_email,
                    'GifteeName': giftee_name,
                    'GiftMessage': gift_message,
                    'GiftSentiment': gift_sentiment,
                    'GiftSignature': gift_signature,
                    'GiftGID': gidGift,
                    'SessionID': g_sessionID
                },
                onSuccess: function (transport) {
                    g_bSendGiftCallRunning = false;
                    if (transport.responseJSON && transport.responseJSON.success) {
                        var result = transport.responseJSON.success;
                        // Success...
                        if (result == 1 || result == 22) {
                            $J('[data-giftid=' + gidGift + '] .loading').html('Done');
                            if (!$('send_via_email').checked || isGmail) {
                                SendGifts();
                            }
                            cacheResult = result;
                        } else {
                            OnSendGiftFailure(result);
                        }
                    } else {
                        OnSendGiftFailure(2);
                    }
                },
                onFailure: function () {
                    g_bSendGiftCallRunning = false;
                    OnSendGiftFailure(3);
                }
            });
    }
    catch (e) {
        ReportCheckoutJSError('Failed gathering form data and calling DoSendGift', e);
    }
}
var InitGifts = function () {
    var href = window.location.href;
    var stIdx = href.indexOf('' + g_gidGift);
    var arr = href.substring(stIdx).split('/');
    $J('.friend_block.disabled input[type=radio]').prop('disabled', false);
    $J('.friend_block.disabled').removeClass('disabled');
    if (arr.length > 2) {
        var params = {
            type: 'GetInventoryItems',
            steamid: arr[arr.length - 1],
            appid: 753,
            contextid: 1
        };

        chrome.runtime.sendMessage(SIHID, params, function (res) {
            if (res && res.success) {
                var rgInventory = res.rgInventory;
                for (var i = 0; i < arr.length - 1; i++) {
                    var item = rgInventory[arr[i]];
                    if (item) {
                        giftsID.push({
                            id: item.id,
                            des: res.rgDescriptions[item.classid + '_' + item.instanceid]
                        });
                    }
                }
                if (giftsID.length) {
                    var giftsDiv = $J($J('.checkout_tab')[0]);
                    giftsDiv.empty();
                    for (var i = 0; i < giftsID.length; i++) {
                        var l_gift = giftsID[i];
                        var elGift = '<div class="sendgift_review_item checkout_review_cart_item even" data-giftid="' + l_gift.id + '">' +
                            '<div class="checkout_review_item_img">' +
                            '<img src="//steamcommunity-a.akamaihd.net/economy/image/' + l_gift.des.icon_url_large + '/120x45" width="120" height="45" border="0">' +
                            '</div>' +
                            '<div class="checkout_review_item_desc">' +
                            '<div class="checkout_review_item_platform loading" style="display: none"><span class="platform_img" style="width: 32px; height: 32px; background: url(//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif)"></span></div>' +
                            l_gift.des.name +
                            '<br><span class="checkout_review_item_desc_ext" id="sendgift_willbesentto" style="display: none;">' +
                            'Sending to: <span id="sendto_steamaccount">Steam account &nbsp;<span class="sendto_accountname" id="sendto_steamaccount_value"></span></span><span id="sendto_email">Email address &nbsp;<span class="sendto_accountname" id="sendto_email_value"></span></span>							</span>' +
                            '</div></div>';
                        giftsDiv.append(elGift);
                    }
                    SendGift = SendGifts;
                }
            }
        });
    }
};

$J(function () {
    InitGifts();
});
