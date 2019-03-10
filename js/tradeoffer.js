// function executeInPageContext(codeString) {
//     let script = document.createElement('script');
//     script.id = 'tmpScript';
//     script.appendChild(document.createTextNode(codeString));
//     (document.body || document.head || document.documentElement).appendChild(script);
// }
//
// setTimeout(function () {
//     executeInPageContext(`
//         let = yourInventory=UserYou.getInventory(730,2);
//         let = theirInventory=UserThem.getInventory(730,2);
//         console.log(UserYou.GetAllLoadedInventories());
//         setTimeout(function () {
//             console.log(yourInventory.m_rgAssets);
//             console.log(yourInventory.m_rgDescriptions);
//             console.log(theirInventory.m_rgAssets);
//             console.log(theirInventory.m_rgDescriptions);
//             console.log(UserYou.GetAllLoadedInventories());
//         }, 5000);`);
// }, 5000);

// let items = [];
// function requestInventory(){
//     chrome.runtime.sendMessage({inventory: "get"}, function(response) {
//         if(!(response===undefined||response.inventory===undefined||response.inventory===""||response.inventory==="error")){
//             items = response.inventory;
//             //addElements();
//             //addSmallIndicators();
//         }
//         else{
//             console.log("Wasn't able to get the inventory, it's most likely steam not working properly or you loading inventory pages at the same time");
//             console.log("Retrying in 30 seconds");
//             setTimeout(function () {
//                 requestInventory();
//             }, 30000);
//
//         }
//     });
// }
// requestInventory();
//
// console.log(items);
//
// setTimeout(function () {
//     console.log(items);
// },10000);


const inBrowserInspectButton = '<a class="popup_menu_item" id="inbrowser_inspect_button" href="http://csgo.gallery/" target="_blank">Inspect in Browser...</a>';
const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

$("#trade_action_popup_itemactions").after(inBrowserInspectButton);

MutationObserver = window.MutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    if($("#inbrowser_inspect_button").attr("href")==="http://csgo.gallery/"){
        addClickListener();
    }
});

let inventoriesElement = document.getElementById("inventories");

if(inventoriesElement!==undefined&&inventoriesElement!==""&&inventoriesElement!==null){
    observer.observe(inventoriesElement, {
        subtree: true,
        attributes: true
    });
}

function addClickListener(){
    $(".slot_actionmenu_button").on("click", function () {
        let inspectLink = $("#trade_action_popup_itemactions").find("a.popup_menu_item").first().attr("href");
        $("#inbrowser_inspect_button").attr("href", "http://csgo.gallery/" + inspectLink);
    });
}