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

// adds selection checkboxes
document.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(row => {
    const priceElement = row.querySelector('.market_listing_right_cell.market_listing_my_price');

    if (priceElement !== null) {
        priceElement.insertAdjacentHTML('beforebegin', `
            <div class="market_listing_right_cell market_listing_edit_buttons">
                <input type="checkbox">
            </div>`);
    }
});

// listings related functionality, starting at price, remove selected, remove all
const sellListings = document.getElementById('tabContentsMyActiveMarketListingsTable');
if (sellListings !== null) {

    const sellListingRows = sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row');
    let totalPrice = 0;
    let totalYouReceivePrice = 0;

    // add starting at prices and total
    sellListingRows.forEach(listingRow => {
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

    sellListings.insertAdjacentHTML('afterend',
        `<div style="margin: -15px 0 15px;">
                   Total listed price: ${centsToSteamFormattedPrice(totalPrice)} You will receive: ${centsToSteamFormattedPrice(totalYouReceivePrice)} (on this page)
               </div>`);



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
        sellListingRows.forEach(listingRow => {
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
        sellListingRows.forEach(listingRow => {
            const listingID = getMyListingIDFromElement(listingRow);
            removeListing(listingID).then(
                result => {
                    listingRow.parentElement.removeChild(listingRow);
                    switchToNextPageIfEmpty(sellListings);
                }
            )
        });
    });
}

// cancel all orders functionality
const orders = document.querySelectorAll('.my_listing_section.market_content_block.market_home_listing_table')[1];
if (orders !== null && orders !== undefined) {
    const orderRows = orders.querySelectorAll('.market_listing_row.market_recent_listing_row');
    let totalOrderAmount = 0;

    // add starting at prices and total
    orderRows.forEach(orderRow => {
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

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});