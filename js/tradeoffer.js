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
