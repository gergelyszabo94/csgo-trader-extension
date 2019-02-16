chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason === "install"){
        //setting default options
        chrome.storage.sync.set(
            {quickDeclineOffer: true,
                openOfferInTab: true,
                showPlusRepButton: true,
                reputationMessage: "+rep",
                showReoccButton: true,
                reoccuringMessage: "I don't have other accounts. If someone adds you with my name and picture they are scammers."
            }, function() {
        });

        chrome.notifications.create("installed", {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension installed!',
            message: 'You can check the options by clicking here'
        }, function(notificationId) {});

        chrome.notifications.onClicked.addListener(function(notificationId) {
            if(notificationId==="installed"){
                chrome.tabs.create({ url: "/html/options.html" });
            }
        });
    }else if(details.reason === "update"){
        //setting defaults options for new options that haven't been set yet
        chrome.storage.sync.get(['quickDeclineOffer','openOfferInTab', 'showPlusRepButton','reputationMessage', 'reoccuringMessage'], function(result) {
            if(result.quickDeclineOffer===undefined){
                chrome.storage.sync.set({quickDeclineOffer: true}, function() {});
            }
            if(result.openOfferInTab===undefined){
                chrome.storage.sync.set({openOfferInTab: true}, function() {});
            }
            if(result.showPlusRepButton===undefined){
                chrome.storage.sync.set({showPlusRepButton: true}, function() {});
            }
            if(result.reputationMessage===undefined){
                chrome.storage.sync.set({reputationMessage: "+rep"}, function() {});
            }
            if(result.showReoccButton===undefined){
                chrome.storage.sync.set({showReoccButton: true}, function() {});
            }
            if(result.reoccuringMessage===undefined){
                chrome.storage.sync.set({reoccuringMessage: "I don't have other accounts. If someone adds you with my name and picture they are scammers."}, function() {});
            }
        });

        chrome.browserAction.setBadgeText({text: "1"});

        let thisVersion = chrome.runtime.getManifest().version;
        chrome.notifications.create(thisVersion+"changelog", {
            type: 'basic',
            iconUrl: '/images/cstlogo128.png',
            title: 'Extension updated to ' + thisVersion + "!",
            message: 'You can check the changelog by clicking here!'
        }, function(notificationId) {});

        chrome.notifications.onClicked.addListener(function() {
            chrome.browserAction.setBadgeText({text: ""});
            let newURL = "/html/changelog.html";
            chrome.tabs.create({ url: newURL });
        });

    }
});

let steamID = "";

//sets steamid for the future api request and redirect the inventory call to load full inventory
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // steamID =   details.url.split("steamcommunity.com/inventory/")[1].split("/")[0];

        if(details.url.split("steamcommunity.com/inventory/")[1]===undefined){
            if(details.url.split("steamcommunity.com/id/")[1]===undefined){
                steamID = details.url.split("steamcommunity.com/profiles/")[1].split("/")[0];
            }
            else{
                steamID = details.url.split("steamcommunity.com/id/")[1].split("/")[0];
            }
        }
        else{
            steamID =   details.url.split("steamcommunity.com/inventory/")[1].split("/")[0];
        }
        //make this an option, let the user decide what to compromise, sih does it anyways
        // if(/count=5000/.test(details.url)){
        //     return {redirectUrl : details.url};
        // }
        // else{
        //     return {redirectUrl : details.url.split("count=75")[0]+"count=5000"};
        // }
        return {redirectUrl : details.url};
    },
    {urls: ["https://steamcommunity.com/inventory/*", "https://steamcommunity.com/*/inventory/json/730/2/*"]},
    ["blocking"]);


//loads inventory and extract information
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.inventory === "get") { //basically ensures that the code responds to the right message request, there might be better ways to do it
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://steamcommunity.com/profiles/' + steamID + '/inventory/json/730/2', true);
            xhr.onload = function (e) {
                let body = JSON.parse(xhr.responseText);
                let items = body.rgDescriptions;
                let ids = body.rgInventory;

                let itemsPropertiesToReturn = [];

                for (let asset in ids) {
                    let assetid = ids[asset].id;
                    let position = ids[asset].pos;

                    for (let item in items) {
                        if (ids[asset].classid === items[item].classid && ids[asset].instanceid === items[item].instanceid) {
                            let name = items[item].name;
                            let marketlink = "https://steamcommunity.com/market/listings/730/" + items[item].market_hash_name;
                            let classid = items[item].classid;
                            let instanceid = items[item].instanceid;
                            let exterior = items[item].descriptions[0].value.split('Exterior: ')[1];
                            exterior = exterior === undefined ? "" : exterior;
                            let shortExterior = shortenExterior(exterior);
                            let tradability = "Tradable";
                            let tradabilityShort = "T";
                            let dopplerPhase = "";
                            let icon = items[item].icon_url;

                            if (items[item].tradable === 0) {
                                tradability = items[item].cache_expiration;
                                tradabilityShort = getShortDate(tradability);
                            }
                            if (items[item].marketable === 0) {
                                tradability = "Not Tradable";
                                tradabilityShort = "";
                            }
                            if(/Doppler/.test(name)){
                                dopplerPhase = getDopplerPhase(icon);
                            }
                            itemsPropertiesToReturn.push({
                                name: name,
                                marketlink: marketlink,
                                classid: classid,
                                instanceid: instanceid,
                                assetid: assetid,
                                position: position,
                                tradability: tradability,
                                tradabilityShort: tradabilityShort,
                                dopplerPhase: dopplerPhase,
                                exterior: exterior,
                                shortExterior: shortExterior
                            })
                        }
                    }
                }

                function compare(a, b) {
                    return a.position - b.position;
                }

                itemsPropertiesToReturn.sort(compare);
                sendResponse({inventory: itemsPropertiesToReturn});
            };
            try {
                xhr.send();
            }
            catch (e) {
                console.log(e);
                sendResponse("error");
            }
            return true; //async return to signal that it will return later
        }
        else if (request.badgetext!==undefined){
            chrome.browserAction.setBadgeText({text: request.badgetext});
        }

    });

function getShortDate(tradabibilityDate){
    let now = new Date().getTime();
    let distance = new Date(tradabibilityDate) - now;
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if(days===0){
        if(hours===0){
            if(minutes===0){
                if(seconds===0){
                    return "";
                }
                else{
                    return seconds + "s";
                }
            }
            else{
                return minutes + "m";
            }
        }
        else {
            return hours + "h";
        }
    }
    else{
        return days + "d";
    }
}

function getDopplerPhase(icon){
    switch(icon){
            //guts
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4A18l4jeHVu9703Azs-hA_MTuncNWWIVU-aF7Z_1a7k-bo0cW_v8_OyXVqvyAqsy3D30vgdDGy9vw":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4D18l4jeHVu96tilbtqEFrZT_3IYXBcgA4Z1_V_1e5wunu1pC6upucm3Zqu3EgtH7D30vgYyt-jDc":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4C18l4jeHVu9Wt2Qbjrko6N2ulIIKXJAZqNFnU-lbsk-3t0Za77siYwXUwviMm5HrD30vgjkYaISA":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4F18l4jeHVu4j22Q3hrUo_Zj2hdYeSegM9NFyCqADtyLvq0cW8v5rLwHViv3IgtynD30vgrLbjMOA":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP08-3hJCDnuXxDLbQhGld7cxrj-3--YXygED6_BVlZDv3IYLGJAE2aQvX_wW5xLzrhsDqvp7Pynpkv3Ui7XnUzhHmhAYMMLIU9_4nhg":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP086jlpm0mvbmMbfUn3FU7Pp9g-7J4cKm2QHiqkY6ZGD1LIfEJlA6MFqG8lG7lLy70ce7vcufzCBis3EksSregVXp1kbC88_z":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP0966lYOAh_L1Ibfum2pD6sl0g_PE8bP5gVO8v11tZzqhLYGRIw86aQ2G81i3k-bog8XptcjIynFi7CB3sH6Jzh2_1BlFcKUx0ncN5NuB":
            return "BP";

            //daggers
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUufp9g-7J4cKg3AXgrxJkZzqgcdTEcg5sY1mEqQXsk-3q15G76pnKmnFmsikg5CqMgVXp1pw20OEp":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUuvpzteXI8oThxgHl_RdqMD_2cYeTIQ84ZQuE-VTsye3m1JTutM_Pn3Rh63Qn43vdlxapwUYb4JkLank":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUu_p9g-7J4cLzjgW2-ktvZT_6dYfAdQI8YluE-wDtxe2505Do6Z_Oz3Rg7CJx5nqLgVXp1nwmojSb":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUvPp9g-7J4cKg0AyxqUM4NWn0JIWWIAY6NVnQrAftxr3mhJHqvZmbySRgs3Mq7XmOgVXp1nQeST2E":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOllZCbn_7mNoTcl3lT5MB4kOzFyo7KhF2zowdyY2n7JoeddAZrZl2B_Fe2x--90MfuuZjLn3Ayv3N2ti2JnRGy0hAeaPsv26KMy01uWQ":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOkgYKSqPr1Ibndk2JL7cFOhuDG_Zi7jAW3-RduYW_zJ9CTIQJoaQ7UqVm4l-_m1p6-6JqdznA27yMitnrZmgv3308wVSkT7w":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eO0mIGInOfxMqndqWZQ-sd9j-Db8IjKimu4ohQ0J3egJYCRJwNtaAnZqFbswunp0ZS_7Z_MyXpi7iknsXeJyxa3ghhJbOw5m7XAHiOIIXZS":
            return "BP";

            //falchions
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7j--YXygED6_kZvZDryJoDHegU4YA2DqQC9wO_mgJe-vM6bwHBlviJ05HjblxC2iQYMMLJU9KLVJA":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7v--YXygED6_0M4YGr2dY6VJ1NoaArR-gK4yOu6jJ-8u8yYmydk7nErt3iJmBWz0gYMMLKkrq5FpQ":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7r--YXygED6-0RtYTr7I4LDcwJvMlnXrwK4xe_sgsK66JWcnXJj7nUj5HffnRHmggYMMLJlW7phRA":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij73--YXygED6rkQ6amD3J9eUJw5raA7T_1TvyLrtgcK-vJjOwSNivSUi4n3eykO-iAYMMLJ7lIc8Bg":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3f6cYSWJAY8MAvV-1G9lO66gZW16pvIySFquichtHuIlkGy0xxPb7M9m7XAHmOSF-ns":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5RZrYjr6JY-cJgA5Zw2CrlPqxeu8hZK77c7NznA2uiFw4SyOmRfkiRpSLrs48wN4FN8":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OtDAcgM4Mw6GrwS3kOjn15Hv7ZnBmiFjvCcr5y2OmhC_h0wdPbZth_WACQLJOWkAmeM":
            return "BP";

        //bowies
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQWLpxo7Oy3tJI6ddwM-aQ7S_VW-w-a8gcDuvZrKz3Rl63F05X7UyRGziRFJa-xvgeveFwsmoJhDFQ":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQaLpxo7Oy3tI9eRd1I7aA6G8ge_lOi-1pW6vsnLzyNjviRw4Hnfl0eyghFPa7FsgOveFwvj2l7OdQ":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3tJtOVe1dsY1nUqAO_kua5hZXtuMybmHtivHZz5ivdl0DkhB4aaONp0eveFwvzsJ5Rmg":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQCLpxo7Oy3tddTAelc7aV6D-gC6lebtgpO8vp2YznBnv3Ug5CyLmBHh00wea-Vv0eveFwtL59uOfw":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbuhWpB-M14mOz--I3nilixogk5NwavfdHNNhhrM12E8we8k-7pgsTtu53Pm3Jl7HQksC3eyh22g0tEaOFr1KTIG13IGeUXS7HreSzp":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbuhH5T8fp8i_vD-Yn8klGwlB81NDG3OtDDewY6aF6G_la_wejpgcTpvMmcwHBqu3Qi4XjdnRO21ExFOLZng6GACQLJb0FpVsg":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbulGdQ685hj-jT-bP4iUa2pxY1KTynS9rMJV56fwzW_1bryevohMLv6siYmnNn6XQr7CndzEa2h0tKardshqGZTV2bUq1XXP7VSLu9WCk":
            return "BP";

            //flips
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUufp9g-7J4cKj3FK2qEpvYmH7ddSRdVVvMFDTqVfsk7q6h8C_tZnJzHRh7CFw53zagVXp1vI5Ejry":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUuvp9g-7J4cKn21Lg-UtsZzunJNCcdgQ9Zg7T-QS6wLu5h5e4vZXAzno16CQr4HnegVXp1j8d9SMm":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUu_p9g-7J4cL23g3sr0Y4ZTihdteccwJqaViE-Fi8lby9hpbq6c_KzHMyvSYqs3zegVXp1mfvJpRH":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUvPp9g-7J4cKm2VKy-0JvMWihItfAewRtN16F_gK3xu7vgsLo7ZjLzCBkvSYqsyuJgVXp1k9_xjt3":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOllZCbn_7mNoTcl3lT5MB4kOzFyoD8j1yg5UBuazj3cYKQJwA5ZwnVrla_yLi5hcPp6szPwHZqvnVx5n_Vyhzjgh1SLrs4EHv5ZcQ":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOkgYKSqPr1Ibndk2JL7cFOhuDG_Zi7jgLtqkVpZjrwJNKSdVVrMl7U_gLvw72-0Ze5u56bnXJgsyBws3bblgv33087zklSXg":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eO0mIGInOfxMqndqWZQ-sd9j-Db8IjKhF2zowdyZz_yLIfGdAFvYguD-Fa9kOrp15G9vpifz3A26ycjt3qMzBDig05Lafsv26IspbmNiQ":
            return "BP";

            //huntsmans
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7j--YXygED6-0Q-Z2umLYGddVc5ZlnU-QXowr2-08O9tZ_JyyAys3Jz4ivUnxK3hwYMMLKe5XXxtg":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7v--YXygED68xFta2z0cYOWIVJqMF7T-Fi2xbvojcLtv5zAwXNnsnYr4naPzhKygQYMMLKHPHTzSA":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7r--YXygED6qUVkNW_3IYCXdAc4ZwvZ8wTql-3vgcTq7cnOnXM1siUj537UnBblgQYMMLKO8np86Q":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij73--YXygED6-xBrYzv7dtSVcgM6YgnZ_1S_k7q6jMS8vJrPnCY1uCBztyqLmUey1wYMMLLSJ9t1zA":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3enddfGcFI4Y1_T-ljvkObp0ZLqvZrAzXthsnYh5CqPzEO00hxKae1rm7XAHud_L0L0":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5UZqMTj7ctOUIAY5YVHY-QO_k7vthpC5tcjAznti6yMn7HmLy0Th1RpSLrs4PnCsPQE":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OoWQJgFtaF-D_lK-kr3t15Tuv8jAmnJn6Ccj4yzenBPh1U1FPOM606eACQLJCUKwlNc":
            return "BP";

            //bayonets
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUx1Rd4cJ5nqeT8Ymi3wzt-UNrZ2mmItWRcgRvM16BqVK4l7jq0J-4vZ3IwHQ16HUq-z-DyALmsiWI":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUxFRd4cJ5nqeW946n0FfgrRFqYWulIdSVdAI5NAqC-Fa2kOvv0Z-9vJ7KmidquCQr-z-DyAl0eh_q":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUxVRd4cJ5nqeXpdzx0FHgqhFqZmn6IY_DI1U8aFuB_FLql-nt1pe7tMybzHFmvCUj-z-DyAETkzcY":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUwlRd4cJ5nqeR9Iqt2gyw_xZlN2z3LNXDcgc9Y1CBqVLrkLvsjcDu7picmHJguiZ2-z-DyMqcL4Vk":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJR7cymnImZksj5MqnTmm5Y8sB1teXI8oThxlHtrkNoMWyhItDDcFJoaFjW_Vm7yL2-18W6uc6ayHcwuCQntH-Om0SpwUYb_FLG0qs":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJQ-d6vq42KhfX4NrLLk29u5Mx2gv2P9o6njA3mrxVrNm2iItXAdAY7ZFuEq1e2wri-gsTousjBn3Nqs3Fw5GGdwUIbpPL9uQ":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJA4N21n5COluX4DLbQhGld7cxrj-3--YXygED6rxVtMWmgJ4fDJ1U_aA6EqFC5w7vujMO9uJrIzCdg6HMgs3mMlxe-0wYMMLLYtmuUHw":
            return "BP";

            //m9s
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEpLP5gVO8v11tMmD6IobEdFRsMFmB8lPvlL-9hZbuvJ_JziBn7HYltnvfnES21xhKcKUx0sfosVEP":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEp7P5gVO8v11uaz_7d9SRcQM-ZlCG-lS3x-_s0Je56JrMmCFnu3Yitnjby0Cx0B4acKUx0j6jkldx":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEprP5gVO8v11lZj-gIYbDclRqMA7Zq1S7lOm-0Za6753KmHoxvnQh5y7ZyhWxiRwecKUx0iL1oy6z":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEobP5gVO8v11kZTr6cdDAIVA5ZA2GqVW3x7281sftvZ_AzXZmv3Mm5H2LlxWw1RhIcKUx0uHVWO7n":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjnMqvBnmJD7fp8i_vD-Yn8klGwlB81NDG3OtSUJgY7YVvS-VfolLq7hsO5tZ_OnXo3uyhz7SyPnhGx0xoeb-dugKOACQLJ28w8Lgw":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjmJrnIqWZQ-sd9j-Db8IjKhF2zowdyYzjyLIGSIAA8YguCqVK9lOa-1JW5vprBz3EyviB07SveyhfkhklNP_sv26JLM0iiyQ":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-Kmsj2P7rSnXtU6dd9teTA5475jV2urhcDPzCkfMKLIwRvYwrWqVS8wezpjcS_78_Mn3Bruykj7HbfzhPm00xLOLc-jPXNHELeWfLcbrqw2A":
            return "BP";

            //butterlies
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyQyoD8j1yg5RVtMmCmctOWJlI-YwyD_VG8w-nohsPt78zKz3Zhsygq4HnczEHk0k5SLrs4Un2yL0k":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyTyo7KhF2zowdyYmqicYedI1NoYAvR-FK5yevmg5S6us_MnSFjuSYm4ivaykDigBtIa_sv26I7TRzdOw":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeySyoD8j1yg5Uo_MGD7cYaXdw5oN1HS_Fnrx-m91MTt6JjJnXtmsicr7SrZyxK2gUxSLrs40_zJGdY":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyVyoD8j1yg5UM-YDz2I4OScwJsZl7Vr1O9x-u9g8K6uJnOzHM16ScktnmJmR23hhhSLrs4sbhU0c4":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqOT1I6vZn3lU18hwmOvN8IXvjVCLqSwwOj6rYJiRdg42NAuE-lW5kri5hpbuvM7AzHtmsnMh4imPzUa3gB4aaOw9hfCeVxzAUJ5TOTzr":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqOXhMaLum2pD6sl0g_PE8bP5gVO8v11kYjjzJ9KcIFI5YliDqAXoxbrsgpC9up_BmCM17nYh4SndzRLl1xwdcKUx0pRZROip":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPX4Mrjahm5Q-slOh-jT94DwgU6xryw-DDWqc97RbA9vN1GD8gO2ybq7hsK9tZ_By3ZqsiJw7X3elxzj1xpPb7c506GZSVmAR_selHmOwYo":
            return "BP";

            //karambits
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7j--YXygED6-kU_Y2HyLYaXeldoZFHYqFa5w-btg8W-7s7PzndkuyJz5CvYzkO0hgYMMLK4xIyRWw":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7v--YXygED6-BZpNTqicoWXcQ43aV6Br1DqxL--jZO_7svAzXs3uCQg4XyLmhXhhQYMMLKBF8xkUA":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7r--YXygED6-EtrNmihLYaXIQ83Nw6C-1C6k-zvgMO7up7NmHs2uykl43fYnUG3hQYMMLINmYZu2g":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij73--YXygED680pqMjr0IdeUd1drYFnR_QK2x73qg5G-uczMyntmvHYjsSrezhbh0wYMMLJgYOl_1g":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3egI4ORcQNqYw3W8la5w-frgJK77ZXKwCQysyVwtnbayxKzhxlIarRum7XAHvqFh2jA":
            return "SH";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5UNkaz_xIdfEd1A5aQ3U-lPskunphJHptZvPwSM26CUht3_UmUe3gEpSLrs4ZlidBgY":
            return "RB";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OtWTJAdsNVCG-Vjvwrvsh8Dv6szBznVivSMnt3eOlx22hhhNbu1o0PaACQLJyiL9rI8":
            return "BP";

            //gamma guts
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyQyoD8j1yg5RI9YzymItKRcQY2YFyC-Fe7x-3p05K8uMybwXdmvyN34n6LnBGygUxSLrs4hchk9Mk":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyTyoD8j1yg5RZrazv1J9fGJgRvNF_W_Afolefs0Z6_uJSaznM36yInt3rbnRW-iB9SLrs4UCqX9kU":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeySyoD8j1yg5Rc5Ymz1I9DDJgdtZgnZq1e4xrjrhZe6uc7MmyFr7HUqsCrZlhG3hUxSLrs4Ij6o7R8":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyVyoD8j1yg5UU9Ymr7JoOUIQI5N12G_la_x-rs1pe0v5-bzHFh7HMg5yrVzRfi0E5SLrs49eTjEI8":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09m7kZKKm_PLPrrDlGdU4d90jtbN_Iv9nBqxqRU5MG32ddeQIwdsaVqE_wTtkO66g5Hv7p6fzHprvidx4XiLzBezn1gSOQvdpryG":
            return "EM";

            //gamma flips
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEpLP5gVO8v11rMT_6JtWUcwE2ZVmF_1S9wurv18W5752dyXBlvHNw4XrVzRy1gxxFcKUx0qdLIRFw":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEp7P5gVO8v11lN2v2Io_DIwI3YQyC_FHqyezvhMS8v5_OyiRguCMgtHzczBWy000YcKUx0nna_20E":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEprP5gVO8v11vZD_6cIeWdwI_Mw7Y-QK6lbztjJ7u7sjJznQ2uyUq4S7bnhzl1xxLcKUx0mona-Mb":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEobP5gVO8v106MWH0IYTDdgU2ZQuE_lS8xb3vhsW1uM-YzHY3vyF25HzfnhOw0xFNcKUx0ilo-Uy6":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOzmYWZlvvwDLbQhGld7cxrj-3--YXygED6-UBlZWGiIICVdQBoZFHR-Fftk7y8hsTotZjAmiFhuil2ti6ImkCwhQYMMLJIJJ_2Qw":
            return "EM";

            //gamma bayonet
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ029bN_Iv9nBrk-RE-NTygJYOdcwdsMlnW_Vi6xufuhZHt6p2an3cwvCYn5yrZn0O2n1gSOaR__zxS":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ02NbN_Iv9nBq3rRBsNzv1LdXBIwI5YgqFqVi3kL3shJW578nAynU3vHZ34imOmRCzn1gSOeA4WWgj":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ02dbN_Iv9nBrmrkFqYD_xcI_GcQ5rYg6DrAO6xL_mgJ_uvZ2YnXtq6CJ34nqPmkS2n1gSOSUsT3Uj":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ03tbN_Iv9nBq2_kJkZWr6cISWcw9sNAvZqFHrwOu70Mfq7ZvKmHBnuXUmsHrcn0Swn1gSOXxc-0BQ":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJH4dmklYyPqPr1Ibndk2JL7cFOhuDG_Zi72VDh8kduZW37JIeWJ1Q9Yl2G8gToxrrmhpfvtZ6YynI1siRw7HbVmwv330-du9HHOA":
            return "EM";

            //gamma m9s
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-iwwOj6rYJiRew4-MgrSqAO-yLvujMe4tMzJzSM2uylz5SrbnBC0hRpKO-1u1qbLVxzAUNEUr2p2":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-SwwOj6rYJiRcg8-Z13Trlm5w--60ZS96szJzidn6ygi5yvamUPk0kxJb7E6hqaZVxzAUK6TGQbC":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-CwwOj6rYJiWdFQ7N1DS_Fa3lOvv15a578-ayCRr7nRw5SuMnUS00BwYOrNvgfSYVxzAUKnD8K-k":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex_ywwOj6rYJicIQ9qYArT8wO8yLzq1pK0tJ6dnyFhviUm5yyJykSzh0oePOI7h_yZVxzAUMOxo1og":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjxPr7Dl2dV18hwmOvN8IXvjVCLpxo7Oy3tIdLEdgdqNAmBqFa_kO3mh8K9uJqbyiMy7HIn5H3VzUPl1B0dO7M7hOveFwvYitsMFw":
            return "EM";

            //gamma karambits
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQWLpxo7Oy3tI4CcIVA8MArW_VfrkOy-gsK7v5_LmnBmsnYn4i2MzB3j0klMbuZsg-veFwtNHI-dng":
            return "P1";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQaLpxo7Oy3tcYKVcQRsZF_Q-FTow-zs0Jft7czNmiNluyV35nrbyR2_1UlPaOFp1uveFwtI0RP3qg":
            return "P2";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3td9LDIQZtYVCE_FS8x-fqjZ_vv5mbnHZq7nN25yrdzR221BlFbew7jeveFwu1r0V1Rw":
            return "P3";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQCLpxo7Oy3tddKScVVvYVzQq1a2lb2615Hu6p7OmHNluCdzsSvazkSyghBEOLNuh-veFwtgyyI7Iw":
            return "P4";
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kvrxIbrdklRc6ddzhuzI74nxt1i9rBsofT-ld9LDJgVsY1nX-QLtlejqg5bu7Zydm3Q1uSVzsXmOmUe3ghFKauBxxavJdWR7Gog":
            return "EM";
        default: return "UN";
    }
}

function shortenExterior(exterior){
    switch(exterior){
        case "Factory New": return "FN";
        case "Minimal Wear": return "MW";
        case "Field-Tested": return "FT";
        case "Well-Worn": return "WW";
        case "Battle-Scarred": return "BS";
        default: return "";
    }
}