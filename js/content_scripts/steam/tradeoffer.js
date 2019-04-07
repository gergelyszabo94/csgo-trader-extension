// const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

overrideHandleTradeActionMenu();
warnOfScammer(getTradePartnerSteamID(), "offer");

// MutationObserver = window.MutationObserver;
//
// let observer = new MutationObserver(function(mutations, observer) {
//     mutations.forEach((mutation)=> {
//         // console.log(mutation);
//         if(mutation.target.classList.contains('popup_block_new')){
//             console.log(mutation.target);
//         }
//             if(mutation.target.classList.contains('inventory_ctn')||(mutation.type="childList"&&mutation.target.classList.contains('slot_actionmenu_button'))){
//             console.log("2" + mutation.target);
//
//         }
//     });
// });
//
// let inventoriesElement = document.getElementById("inventories");
//
// if(inventoriesElement!==undefined&&inventoriesElement!==""&&inventoriesElement!==null){
//     observer.observe(inventoriesElement, {
//         childList: true,
//         subtree: true,
//         attributes: true
//     });
// }

//this script gets injected, it allows communication between the page context and the content script initiated on the page
//when the function is called it dispatches a an event that we listen to from the content script
let scriptToInject = `
    <script id="sendMessageToContentScript">
    function sendMessageToContentScript(message){
        let event = new CustomEvent("message", { "detail": message });
        document.dispatchEvent(event);
    }
</script>`;
$("body").append(scriptToInject);

document.addEventListener("message", function(e) {
    addFloatIndicator(e.detail);
});



function addFloatIndicator(inspectLink) {
    chrome.runtime.sendMessage({getFloatInfo: inspectLink}, function(response) {
        let float ="Waiting for csgofloat.com";
        try{
            float = response.floatInfo.floatvalue;
        }
        catch{

        }
        let itemToAddFloatTo = findElementByAssetID(inspectLink.split("A")[1].split("D")[0]);
        itemToAddFloatTo.append(`<span class='floatIndicator'>Float: ${float.toFixed(4)}</span>`);
    });
}

function findElementByAssetID(assetid){
    let elementid = "item730_2_" + assetid;
    return $("#" + elementid);
}

// $(".item.app730.context2")