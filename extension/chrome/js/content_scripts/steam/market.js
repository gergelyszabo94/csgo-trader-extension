function getMyListingIDFromElement(listingElement) {return listingElement.id.split('mylisting_')[1]}

function getMyOrderIDFromElement(orderElement) {return orderElement.id.split('mybuyorder_')[1]}

function getElementByListingID(listingID) {return document.getElementById(`mylisting_${listingID}`)}

function getElementByOrderID(orderID) {return document.getElementById(`mybuyorder_${orderID}`)}

function switchToNextPageIfEmpty(listings) {
    if (listings.querySelectorAll('.market_listing_row.market_recent_listing_row').length === 0 ) {
        document.getElementById('tabContentsMyActiveMarketListings_btn_next').click();
    }
}

function getAppIDAndItemNameFromLink(marketLink) {
    const appID = marketLink.split('listings/')[1].split('/')[0];
    const market_hash_name = marketLink.split('listings/')[1].split('/')[1];
    return {appID, market_hash_name};
}

function addListingStartingAtPricesAndTotal(sellListings) {
    let totalPrice = 0;
    let totalYouReceivePrice = 0;

    // add starting at prices and total
    sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(listingRow => {
        // adds selection checkboxes
        const priceElement = listingRow.querySelector('.market_listing_right_cell.market_listing_my_price');
        if (priceElement !== null) {
            priceElement.insertAdjacentHTML('beforebegin', `
            <div class="market_listing_right_cell market_listing_edit_buttons">
                <input type="checkbox">
            </div>`);
        }

        const nameElement = listingRow.querySelector('.market_listing_item_name_link');
        if (nameElement !== null) {
            const marketLink = nameElement.getAttribute('href');
            const appID = getAppIDAndItemNameFromLink(marketLink).appID;
            const market_hash_name = getAppIDAndItemNameFromLink(marketLink).market_hash_name;
            const listingID = getMyListingIDFromElement(listingRow);

            const priceElement = listingRow.querySelector('.market_listing_price');
            const listedPrice = priceElement.querySelectorAll('span')[1].innerText;
            const youReceivePrice = priceElement.querySelectorAll('span')[2].innerText.split('(')[1].split(')')[0];

            totalPrice += parseInt(steamFormattedPriceToCents(listedPrice));
            totalYouReceivePrice += parseInt(steamFormattedPriceToCents(youReceivePrice));

            priceQueue.jobs.push({
                type: 'my_listing',
                listingID,
                appID,
                market_hash_name
            });

            if (!priceQueue.active) workOnPriceQueue();
        }
    });

    const listingsTotal = document.getElementById('listingsTotal');
    if (listingsTotal !== null) listingsTotal.parentNode.removeChild(listingsTotal);

    sellListings.insertAdjacentHTML('afterend',
        `<div id='listingsTotal' style="margin: -15px 0 15px;">
                   Total listed price: ${centsToSteamFormattedPrice(totalPrice)} You will receive: ${centsToSteamFormattedPrice(totalYouReceivePrice)} (on this page)
               </div>`);
}

function addStartingAtPriceInfoToPage(listingID, lowestPrice) {
    const listingRow = getElementByListingID(listingID);

    if (listingRow !== null) { // the listing might not be there for example if the page was switched, the per page listing count was changed or the listing was removed
        const priceElement = listingRow.querySelector('.market_listing_price');
        const listedPrice = priceElement.querySelectorAll('span')[1].innerText;
        const cheapest = listedPrice === lowestPrice ? 'cheapest' : 'not_cheapest';

        priceElement.insertAdjacentHTML('beforeend', `
                                    <div class="${cheapest}" title="This is the price of the lowest listing right now.">
                                        ${lowestPrice}
                                    </div>`);
    }
}

function extractHistoryEvents(result_html) {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = result_html;

    const eventsToReturn = [];

    tempEl.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach((historyRow) => {
        const itemName = historyRow.querySelector('.market_listing_item_name').innerText;
        const gameName = historyRow.querySelector('.market_listing_game_name').innerText;
        const listedOn = historyRow.querySelectorAll('.market_listing_listed_date')[1].innerText.trim();
        const actedOn = historyRow.querySelectorAll('.market_listing_listed_date')[0].innerText.trim();
        const displayPrice = historyRow.querySelector('.market_listing_price').innerText.trim();
        const priceInCents = steamFormattedPriceToCents(displayPrice);
        const partnerElement = historyRow.querySelector('.market_listing_whoactedwith');
        const type = getHistoryType(historyRow);
        let partner = null;

        if (type !== 'listing_created') { // listing creation events have no partner specified
            const partnerName = partnerElement.querySelector('img').title;
            const partnerLink = partnerElement.querySelector('a').getAttribute('href');
            const partnerID = partnerLink.split('profiles/')[1];
            partner = {partnerName, partnerLink, partnerID};
        }

        eventsToReturn.push({itemName, gameName, listedOn, actedOn, displayPrice, priceInCents, partner, type});
    });

    tempEl.remove();
    return eventsToReturn;
}

function getHistoryType(historyRow) {
    const gainOrLoss = historyRow.querySelector('.market_listing_gainorloss').innerText.trim();
    let historyType = null;

    switch (gainOrLoss) {
        case '': historyType = 'listing_created'; break;
        case '+': historyType = 'purchase'; break;
        case '-': historyType = 'sale'; break
    }
    return historyType;
}

logExtensionPresence();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'marketMainPage'
});

// makes remove/cancel columns narrower
injectStyle(`
.market_listing_edit_buttons {
    width: 120px;
}`, 'editColumnWidth');

const sellListings = document.getElementById('tabContentsMyActiveMarketListingsTable');

if (sellListings !== null) {
    const tabContentRows = document.getElementById('tabContentsMyActiveMarketListingsRows');

    if (tabContentRows !== null) {
        // listens for listing changes like removal, page switching
        MutationObserver = window.MutationObserver;

        let observer = new MutationObserver((changes) => {
            if (sellListings.parentElement.style.display !== 'none') { // only execute if it's the active tab
                addListingStartingAtPricesAndTotal(sellListings);
            }
        });

        observer.observe(tabContentRows, {
            subtree: false,
            childList: true,
            attributes: false
        });
    }

    const tableHeader = sellListings.querySelector('.market_listing_table_header');
    const removeColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    removeColumnHeader.innerText = 'REMOVE ALL';
    removeColumnHeader.setAttribute('title', 'Click here to remove all listings from this page!');
    removeColumnHeader.classList.add('clickable');

    // adds remove selected column header/button
    removeColumnHeader.insertAdjacentHTML('afterend', `
        <span id="removeSelected" class="market_listing_right_cell market_listing_edit_buttons placeholder clickable" title="Click to remove the selected listings.">
            REMOVE
        </span>`);

    document.getElementById('removeSelected').addEventListener('click', () => {
        sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(listingRow => {
            if (listingRow.querySelector('input').checked) {
                const listingID = getMyListingIDFromElement(listingRow);
                removeListing(listingID).then(
                    result => {
                        listingRow.parentElement.removeChild(listingRow);
                        switchToNextPageIfEmpty(sellListings);
                    }
                )
            }
        });
    });

    removeColumnHeader.addEventListener('click', () => {
        sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(listingRow => {
            const listingID = getMyListingIDFromElement(listingRow);
            removeListing(listingID).then(
                result => {
                    listingRow.parentElement.removeChild(listingRow);
                    switchToNextPageIfEmpty(sellListings);
                }
            )
        });
    });

    addListingStartingAtPricesAndTotal(sellListings);
}

// buy order related functionality, highest buy order price, cancel selected, cancel all
const orders = document.querySelectorAll('.my_listing_section.market_content_block.market_home_listing_table')[1];
if (orders !== null && orders !== undefined) {
    const orderRows = orders.querySelectorAll('.market_listing_row.market_recent_listing_row');
    let totalOrderAmount = 0;

    // add starting at prices and total
    orderRows.forEach(orderRow => {
        // adds selection checkboxes
        const priceElement = orderRow.querySelector('.market_listing_right_cell.market_listing_my_price');
        if (priceElement !== null) {
            priceElement.insertAdjacentHTML('beforebegin', `
            <div class="market_listing_right_cell market_listing_edit_buttons">
                <input type="checkbox">
            </div>`);
        }

        const nameElement = orderRow.querySelector('.market_listing_item_name_link');
        if (nameElement !== null) {
            const marketLink = nameElement.getAttribute('href');
            const appID = getAppIDAndItemNameFromLink(marketLink).appID;
            const market_hash_name = getAppIDAndItemNameFromLink(marketLink).market_hash_name;
            const orderID = getMyOrderIDFromElement(orderRow);

            const orderPrice = orderRow.querySelector('.market_listing_price').innerText;

            totalOrderAmount += parseInt(steamFormattedPriceToCents(orderPrice));

            priceQueue.jobs.push({
                type: 'my_buy_order',
                orderID,
                appID,
                market_hash_name
            });

            if (!priceQueue.active) workOnPriceQueue();
        }
    });

    orders.insertAdjacentHTML('afterend',
        `<div style="margin: -15px 0 15px;">
                   Orders placed total value: ${centsToSteamFormattedPrice(totalOrderAmount)}
               </div>`);

    const tableHeader = orders.querySelector('.market_listing_table_header');
    const cancelColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    cancelColumnHeader.innerText = 'CANCEL ALL';
    cancelColumnHeader.setAttribute('title', 'Click here to cancel all your buy orders!');
    cancelColumnHeader.classList.add('clickable');

    // adds cancel selected column header/button
    cancelColumnHeader.insertAdjacentHTML('afterend', `
        <span id="cancelSelected" class="market_listing_right_cell market_listing_edit_buttons placeholder clickable" title="Click to cancel the selected buy orders.">
            CANCEL
        </span>`);

    document.getElementById('cancelSelected').addEventListener('click', () => {
        orderRows.forEach(orderRow => {
            if (orderRow.querySelector('input').checked) {
                const orderID = getMyOrderIDFromElement(orderRow);
                cancelOrder(orderID).then(
                    result => {
                        orderRow.parentElement.removeChild(orderRow);
                    }
                )
            }
        });
    });

    cancelColumnHeader.addEventListener('click', () => {
        orderRows.forEach(orderRow => {
            const orderID = getMyOrderIDFromElement(orderRow);
            cancelOrder(orderID).then(
                result => {
                    orderRow.parentElement.removeChild(orderRow);
                }
            )
        });
    });
}

// market history features
const marketHistoryTab = document.getElementById('tabContentsMyMarketHistory');
if (marketHistoryTab !== null) {
    // listens for history page changes
    MutationObserver = window.MutationObserver;

    let observer = new MutationObserver((mutationRecord) => {
        if (sellListings.style.display !== 'none') { // only execute if it's the active tab
            if (mutationRecord[0].target.id === 'tabContentsMyMarketHistory' || mutationRecord[0].target.id === 'tabContentsMyMarketHistoryRows') {
                marketHistoryTab.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(historyRow => {
                    const historyType = getHistoryType(historyRow);
                    historyRow.classList.add(historyType);
                })
            }
        }
    });

    observer.observe(marketHistoryTab, {
        subtree: true,
        childList: true,
        attributes: false
    });
}

// market history export
const marketHistoryButton = document.getElementById('tabMyMarketHistory');
const myListingsButton = document.getElementById('tabMyListings');

if (marketHistoryButton !== null) {
    // inserts export tab button
    marketHistoryButton.insertAdjacentHTML('afterend', `
        <a id="tabMyMarketHistoryExport" class="market_tab_well_tab market_tab_well_tab_inactive" href="#">
            <span class="market_tab_well_tab_contents">Export Market History</span>
        </a>
    `);

    // inserts export tab content
    document.getElementById('myListings').insertAdjacentHTML('beforeend', `
        <div id="tabContentsMyMarketHistoryExport" class="my_listing_section market_content_block" style="display: none;">
            <h1 class="historyExportTitle">Export Market History (<span id="numberOfHistoryEvents">0</span> history events) (BETA)</h1> 
            <p>
                Exporting your market history can be great if you want to analyse it in a spreadsheet for example.
                A history event is either one of these three actions: a purchase, a sale or  a listing creation.
                The result is a .csv file that you can open in Microsoft Excel or use programmatically.
            </p>
            <span id="exportMarketHistory" class="clickable underline">Click here to export to start exporting your market history.</span>
            <span style="display: none" id="marketHistoryTempElement"></span>
        </div>    
    `);

    const marketHistoryExportButton = document.getElementById('exportMarketHistory');
    const marketHistoryExportContent = document.getElementById('tabContentsMyMarketHistoryExport');
    const marketHistoryExportTabButton = document.getElementById('tabMyMarketHistoryExport');

    // hides the export tab when one of the other tabs becomes active
    [marketHistoryButton, myListingsButton].forEach((tabButton) => {
       tabButton.addEventListener('click', () => {
           marketHistoryExportTabButton.classList.remove('market_tab_well_tab_active');
           marketHistoryExportTabButton.classList.add('market_tab_well_tab_inactive');
           marketHistoryExportContent.style.display = 'none';
       })
    });

    marketHistoryExportButton.addEventListener('click', (event) => {
       event.target.innerText = 'Exporting market history..';
        getMarketHistory(0, 50).then(
            history => {
                console.log(extractHistoryEvents(history.results_html));
            }
        )
    });

    marketHistoryExportTabButton.addEventListener('click', () => {
        marketHistoryExportTabButton.classList.add('market_tab_well_tab_active');
        marketHistoryExportTabButton.classList.remove('market_tab_well_tab_inactive');
        marketHistoryButton.classList.remove('market_tab_well_tab_active');
        marketHistoryButton.classList.add('market_tab_well_tab_inactive');
        myListingsButton.classList.remove('market_tab_well_tab_active');
        myListingsButton.classList.add('market_tab_well_tab_inactive');

        marketHistoryExportContent.style.display = 'block';
        sellListings.parentElement.style.display = 'none';
        marketHistoryTab.style.display = 'none';

        getMarketHistory(0, 50).then(
            history => {
                console.log(history);
                document.getElementById('numberOfHistoryEvents').innerText = history.total_count;
                document.getElementById('marketHistoryTempElement').innerHTML = history.results_html;
            }
        )

    });
}

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});