$(function () {
    restore_options();
    $('.custom-buttons').on('click', 'span.custom-button a', function () {
        $(this).parent('span.custom-button').remove();
        save_options();
        return false;
    });

    $('#btAdd').click(function () {
        var appid = $('#cbGame').val();
        var btname = $('#txtName').val();
        var expStr = $('#txtExp').val();
        var exp = JSON.parse(expStr);
        if (exp === null || !exp) {
            alert('Invalid expression');
            return;
        }
        var span = $('<span class="custom-button">');
        span.html('<span class="name">' + btname + '</span>');
        span.append('<a href="javascript:void(0)" title="remove">X</a>');
        span.attr('title', expStr);
        span.data('exp', exp);
        $('div.custom-buttons[data-appid="' + appid + '"] .existing').append(span);
        save_options();
    });
});

function save_options() {
    var obj = {"440": {}, "570": {}, "730": {}};
    $('.custom-button').each(function () {
        var appid = $(this).parents('.custom-buttons').data('appid');
        if (typeof (obj[appid]) == 'undefined') obj[appid] = {};
        var btname = $(this).find('.name').text();
        var exp = $(this).data('exp');
        obj[appid][btname] = exp;
    });
    console.log(obj);

    chrome.storage.sync.set({
        custombuttons: obj
    }, function () {

    });
}

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        custombuttons: null
    }, function (items) {
        console.log(items);
        if (items.custombuttons == null) {
            items.custombuttons = {
                "440": {
                    "Keys": {"Type": "TF_T"},
                    "Craft items": {"Type": "Craft Item"}
                },
                "570": {
                    "Keys": {"Quality": "unique", "Rarity": "Rarity_Common", "Type": "key"}
                },
                "730": {
                    "Keys": {"Type": "CSGO_Tool_WeaponCase_KeyTag"}
                },
                "753": {
                    "Trading cards": {"item_class": "item_class_2"}
                }
            };
        }
        $.each(items.custombuttons, function (appid, o) {
            $.each(o, function (btname, exp) {
                var span = $('<span class="custom-button">');
                span.html('<span class="name">' + btname + '</span>');
                span.append('<a href="javascript:void(0)" title="remove">X</a>');
                var expStr = JSON.stringify(exp);
                span.attr('title', expStr);
                span.data('exp', exp);
                $('div.custom-buttons[data-appid="' + appid + '"] .existing').append(span);
            });
        });
    });
}
