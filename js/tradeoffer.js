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


const dopplerPhase = "<div class='dopplerPhase'><span></span></div>";

overrideHandleTradeActionMenu();

MutationObserver = window.MutationObserver;

let observer = new MutationObserver(function(mutations, observer) {
    mutations.forEach((mutation)=> {
        // console.log(mutation);
        if(mutation.target.classList.contains('popup_block_new')){
            // console.log(mutation.target);
        }
            if(mutation.target.classList.contains('inventory_ctn')||(mutation.type="childList"&&mutation.target.classList.contains('slot_actionmenu_button'))){
            // console.log(mutation.target);

        }
    });
});

let inventoriesElement = document.getElementById("inventories");

if(inventoriesElement!==undefined&&inventoriesElement!==""&&inventoriesElement!==null){
    observer.observe(inventoriesElement, {
        childList: true,
        subtree: true,
        attributes: true
    });
}
