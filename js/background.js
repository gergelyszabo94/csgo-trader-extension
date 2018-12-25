chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
        console.log("The color is green.");
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'developer.chrome.com'},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

let steamAPIKey = '083D3F215CEFFEE1911D32AC211B2B85';

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.alias !== ""){
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + steamAPIKey + '&vanityurl=' + request.alias, true);
            xhr.onload = function(e) {
                let steamid = "";
                if(JSON.parse(xhr.responseText).response.success===1){
                    steamid = JSON.parse(xhr.responseText).response.steamid;
                }
                else{
                    steamid = request.alias;
                }
                let xhr2 = new XMLHttpRequest();
                xhr2.open("GET", 'https://steamcommunity.com/profiles/' + steamid + '/inventory/json/730/2', true);
                xhr2.onload = function(e) {
                    var body=  JSON.parse(xhr2.responseText);
                    var items = body.rgDescriptions;
                    var ids = body.rgInventory;

                    let itemsPropertiesToReturn = [];

                    for (let asset in ids) {
                        var assetid = ids[asset].id;
                        var position = ids[asset].pos;

                        for (let item in items) {
                            if(ids[asset].classid===items[item].classid&&ids[asset].instanceid===items[item].instanceid){
                                let name = items[item].name;
                                let marketlink = "https://steamcommunity.com/market/listings/730/" + items[item].market_hash_name;
                                let classid = items[item].classid;
                                let instanceid = items[item].instanceid;
                                let tradability = "Tradable";


                                if (items[item].tradable === 0) {
                                    tradability = items[item].cache_expiration;
                                }

                                if(items[item].marketable === 0){
                                    tradability = "Not Tradable"
                                }

                                itemsPropertiesToReturn.push({
                                    name: name,
                                    marketlink: marketlink,
                                    classid: classid,
                                    instanceid: instanceid,
                                    assetid: assetid,
                                    position: position,
                                    tradability: tradability
                                })
                            }
                        }
                    }

                    function compare(a,b) {
                        return a.position - b.position;
                    }

                    itemsPropertiesToReturn.sort(compare);

                    sendResponse({inventory: itemsPropertiesToReturn});

                };
                xhr2.send();
            };
            xhr.send();
            return true;
        }
    });