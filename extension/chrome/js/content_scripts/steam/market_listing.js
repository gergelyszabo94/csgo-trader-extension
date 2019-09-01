updateLoggedInUserID();

// the promise will be stored here temporarily
let itemsPromise = undefined;

//listens to the message events on the extension side of the communication
window.addEventListener('message', e => {
    if (e.data.type === 'items') {
        let assets = e.data.assets[730][2];
        let listings = e.data.listings;
        for (let listing in listings){
            let assetid = listings[listing].asset.id;

            for(let asset in assets){
                let stickers = parseStickerInfo(assets[asset].descriptions, 'search');

                if(assetid === assets[asset].id){
                    listings[listing].asset = assets[asset];
                    listings[listing].asset.stickers = stickers;
                }
            }
        }
        itemsPromise(listings);
        itemsPromise = undefined;
    }
});

//sends the message to the page side to get the info
const getItems = () =>{
    window.postMessage(
        {
            type: 'requestItems'
        },
        '*'
    );
    return new Promise(resolve => {
        itemsPromise = resolve;
    });
};

// this injected script listens to the messages from the extension side and responds with the page context info needed
let getItemsScript = `
    window.addEventListener('message', (e) => {
        if (e.data.type == 'requestItems') {
            window.postMessage({
                type: 'items',
                listings: g_rgListingInfo,
                assets: g_rgAssets
            }, '*');
        }
    });
    `;
injectToPage(getItemsScript, false, 'getItems', null);

const inBrowserInspectButtonPopupLink = `<a class="popup_menu_item" id="inbrowser_inspect" href="http://csgo.gallery/" target="_blank">${chrome.i18n.getMessage("inspect_in_browser")}</a>`;
const getFloatInfoMenuItem = `<span class="popup_menu_item" id="get_float">${chrome.i18n.getMessage("get_float_info")}</span>`;


const dopplerPhase = '<div class="dopplerPhaseMarket"><span></span></div>';

// it takes the visible descriptors and checks if the collection includes souvenirs
let textOfDescriptors = '';
document.querySelectorAll('.descriptor').forEach(descriptor => {textOfDescriptors += descriptor.innerText});
let thereSouvenirForThisItem =  souvenirExists(textOfDescriptors);

let genericMarketLink = 'https://steamcommunity.com/market/listings/730/';
let weaponName = '';
const fullName = decodeURIComponent(window.location.href).split("listings/730/")[1];
let stattrak = 'StatTrak%E2%84%A2%20';
let stattrakPretty = 'StatTrak™';
let souvenir = 'Souvenir ';
let star = '';
let isStattrak = /StatTrak™/.test(fullName);
let isSouvenir = /Souvenir/.test(fullName);

if(/★/.test(fullName)){star = '%E2%98%85%20'}
if(isStattrak) weaponName = fullName.split('StatTrak™ ')[1].split('(')[0];
else if(isSouvenir) weaponName = fullName.split('Souvenir ')[1].split('(')[0];
else{
    weaponName = fullName.split('(')[0].split('★ ')[1];
    if(weaponName === undefined) weaponName = fullName.split('(')[0];
}

let stOrSv = stattrakPretty;
let stOrSvClass = 'stattrakOrange';
let linkMidPart = star + stattrak;
if(isSouvenir || thereSouvenirForThisItem){
    stOrSvClass = 'souvenirYellow';
    stOrSv = souvenir;
    linkMidPart = souvenir;
}

let otherExteriors = `
            <div class="descriptor otherExteriors">
                <span>${chrome.i18n.getMessage("links_to_other_exteriors")}:</span>
                <ul>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Factory%20New%29"}" target="_blank">${exteriors.factory_new.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Factory%20New%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.factory_new.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Minimal%20Wear%29"}"" target="_blank">${exteriors.minimal_wear.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Minimal%20Wear%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.minimal_wear.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Field-Tested%29"}"" target="_blank">${exteriors.field_tested.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Field-Tested%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.field_tested.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Well-Worn%29"}"" target="_blank">${exteriors.well_worn.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Well-Worn%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.well_worn.localized_name}</span></a></li>
                    <li><a href="${genericMarketLink + star + weaponName + "%28Battle-Scarred%29"}"" target="_blank">${exteriors.battle_scarred.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Battle-Scarred%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.battle_scarred.localized_name}</span></a></li>
                </ul>
                <span>${chrome.i18n.getMessage("not_every_available")}</span>
            </div>
            `;

const descriptor = document.getElementById('largeiteminfo_item_descriptors');
if(fullName.split('(')[1] !== undefined && descriptor !== null) descriptor.insertAdjacentHTML('beforeend', otherExteriors);

// adds the in-browser inspect button to the top of the page
const originalInspectButton = document.getElementById('largeiteminfo_item_actions').querySelector('.btn_small.btn_grey_white_innerfade'); // some items don't have inspect buttons (like cases)
if (originalInspectButton !== null){
    const inspectLink = originalInspectButton.getAttribute('href');
    const inBrowserInspectButton =`<a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect_button" href="http://csgo.gallery/${inspectLink}" target="_blank"><span>${chrome.i18n.getMessage("inspect_in_browser")}</span></a>`;
    document.getElementById('largeiteminfo_item_actions').insertAdjacentHTML('beforeend', inBrowserInspectButton);
}

// adds the extra functions to the context menu
document.getElementById('market_action_popup_itemactions').insertAdjacentHTML('afterend', inBrowserInspectButtonPopupLink + getFloatInfoMenuItem);

// adds the proper link to the context menu before it gets clicked - needed because the context menu resets when clicked
document.getElementById('inbrowser_inspect').addEventListener('mouseenter', (event)=>{
    let inspectLink = document.getElementById('market_action_popup_itemactions').querySelector('a.popup_menu_item').getAttribute('href');
    event.target.setAttribute('href', `http://csgo.gallery/${inspectLink}`);
});

document.getElementById('get_float').addEventListener('click', (event)=>{
    let inspectLink = event.target.parentNode.querySelector('a.popup_menu_item').getAttribute('href');
    let listingID = inspectLink.split('preview%20M')[1].split('A')[0];

    let listingParentElement = document.getElementById(`listing_${listingID}_name`).parentNode;

    if(listingParentElement.getAttribute('data-floatBar-added') === null || listingParentElement.getAttribute('data-floatBar-added') === false){
        chrome.runtime.sendMessage({getFloatInfo: inspectLink}, (response) =>{
            try{
                float = response.floatInfo.floatvalue;
                paintIndex = response.floatInfo.paintindex;
                paintSeed = response.floatInfo.paintseed;
                origin = response.floatInfo.origin_name;
                min = response.floatInfo.min;
                max = response.floatInfo.max;
                stickers = response.floatInfo.stickers;

            }
            catch{

            }

            let position = float.toFixed(2) * 100 - 2;

            let floatBar = `
                <div class="floatBarMarket">
                    <div class="floatToolTip" style="left: ${position}%">
                        <div>Float: <span id="float1DropTarget">${float.toFixed(4)}</span></div>
                        <svg id="floatPointer" class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
                   </div>
                 <div class="progress">
                    <div class="progress-bar floatBarFN" title="${exteriors.factory_new.localized_name}"></div>
                    <div class="progress-bar floatBarMW" title="${exteriors.minimal_wear.localized_name}"></div>
                    <div class="progress-bar floatBarFT" title="${exteriors.field_tested.localized_name}"></div>
                    <div class="progress-bar floatBarWW" title="${exteriors.well_worn.localized_name}"></div>
                     <div class="progress-bar floatBarBS" title="${exteriors.battle_scarred.localized_name}"></div>
                 </div>
                  <div class="showTechnical">Show Technical</div>
                 <div class="floatTechnical hidden">
                        Technical:<br>
                        Float Value: ${float}<br>
                        Paint Index: ${paintIndex}<br>
                        Paint Seed: ${paintSeed}<br>
                        Origin: ${origin}<br>
                        Best Possible Float: ${min}<br>
                        Worst Possible Float: ${max}<br>
                        <br>
                        Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>
                </div>
                </div>
            `;
            //TODO set sticker condition
            if (float === 0) listingParentElement.insertAdjacentHTML('beforeend', '<div>Could not get Float from csgofloat.com</div>');
            else{
                listingParentElement.setAttribute('data-floatBar-added', true);
                listingParentElement.insertAdjacentHTML('beforeend', floatBar);
            }

            document.querySelectorAll('.showTechnical').forEach(showTechnical => {
                showTechnical.addEventListener('click', event =>{ event.target.parentNode.querySelector('.floatTechnical').classList.toggle('hidden')})
            });
        });
    }
});

addPhasesIndicator();
addStickers();

let observer = new MutationObserver((mutations) =>{
    for(let mutation of mutations) {
        if (mutation.target.id === 'searchResultsRows') {addPhasesIndicator(); addStickers()}
    }
});

let searchResultsRows = document.getElementById('searchResultsRows');
if (searchResultsRows !== null){
    observer.observe(searchResultsRows, {
        subtree: true,
        attributes: false,
        childList: true
    });
}

chrome.storage.local.get('numberOfListings', (result) =>{
    if (result.numberOfListings !== 10){
        let loadMoreMarketAssets = `g_oSearchResults.m_cPageSize = ${result.numberOfListings}; g_oSearchResults.GoToPage(0, true);`;
        injectToPage(loadMoreMarketAssets, true, 'loadMoreMarketAssets', null);
    }
});


function addPhasesIndicator(){
    if (/Doppler/.test(window.location.href)) {
        document.querySelectorAll('.market_listing_item_img_container').forEach(container =>{
            container.insertAdjacentHTML('beforeend', dopplerPhase);
            let phase = getDopplerInfo(container.querySelector('img').getAttribute('src').split('economy/image/')[1].split('/')[0]);
            let dopplerElement = container.querySelector('.dopplerPhaseMarket');

            switch (phase.short){
                case dopplerPhases.sh.short: dopplerElement.insertAdjacentHTML('beforeend', sapphire); break;
                case dopplerPhases.rb.short: dopplerElement.insertAdjacentHTML('beforeend', ruby); break;
                case dopplerPhases.em.short: dopplerElement.insertAdjacentHTML('beforeend', emerald); break;
                case dopplerPhases.bp.short: dopplerElement.insertAdjacentHTML('beforeend', blackPearl); break;
                default: dopplerElement.querySelector('span').innerText = phase.short;
            }
        });
    }
}

function addStickers() {
    // removes sih sticker info
    document.querySelectorAll('.sih-images').forEach(image => {image.parentNode.removeChild(image)});

    getItems().then(listings => {
        document.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(listing_row => {
            if (listing_row.parentNode.id !== 'tabContentsMyActiveMarketListingsRows' && listing_row.parentNode.parentNode.id !== 'tabContentsMyListings'){
                let listingID = listing_row.id.split('listing_')[1];
                listing_row.querySelectorAll('.market_listing_item_name_block').forEach(name_block =>{name_block.insertAdjacentHTML('beforeend', `<div class="stickerHolderMarket" id="stickerHolder_${listingID}"></div>`)});

                let stickers = listings[listingID].asset.stickers;

                stickers.forEach(stickerInfo =>{
                    document.getElementById(`stickerHolder_${listingID}`).insertAdjacentHTML('beforeend', `<span class="stickerSlotMarket" data-tooltip-market="${stickerInfo.name}"><a href="${stickerInfo.marketURL}" target="_blank"><img src="${stickerInfo.iconURL}" class="stickerIcon"></a></span>`)
                });
            }
        });
    });
}

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});
