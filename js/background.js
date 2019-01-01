let steamID = "";

//sets steamid for the future api request and redirect the inventory call to load full inventory
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        steamID =   details.url.split("steamcommunity.com/inventory/")[1].split("/730")[0];

        //make this an option, let the user decide what to compromise, sih does it anyways
        // if(/count=5000/.test(details.url)){
        //     return {redirectUrl : details.url};
        // }
        // else{
        //     return {redirectUrl : details.url.split("count=75")[0]+"count=5000"};
        // }
        return {redirectUrl : details.url};
    },
    {urls: ["*://steamcommunity.com/inventory/*"]},
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
                            let tradability = "Tradable";

                            if (items[item].tradable === 0) {
                                tradability = items[item].cache_expiration;
                            }
                            if (items[item].marketable === 0) {
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
    });