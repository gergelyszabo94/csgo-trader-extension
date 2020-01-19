function getMyListingIDFromElement(listingElement) {return listingElement.id.split('mylisting_')[1]}

function getMyOrderIDFromElement(orderElement) {return orderElement.id.split('mybuyorder_')[1]}

function switchToNextPageIfEmpty(listings) {
    if (listings.querySelectorAll('.market_listing_row.market_recent_listing_row').length === 0 ) {
        document.getElementById('tabContentsMyActiveMarketListings_btn_next').click();
    }
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

// remove all listings functionality
const sellListings = document.getElementById('tabContentsMyActiveMarketListingsTable');
if (sellListings !== null) {
    const tableHeader = sellListings.querySelector('.market_listing_table_header');
    const removeColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    removeColumnHeader.innerText = 'REMOVE ALL';
    removeColumnHeader.setAttribute('title', 'Click here to remove all listings from this page!');
    removeColumnHeader.classList.add('clickable');

    removeColumnHeader.insertAdjacentHTML('afterend', `<span id="removeSelected" class="market_listing_right_cell market_listing_edit_buttons placeholder clickable">REMOVE</span>`);

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
}

// cancel all orders functionality
const orders = document.querySelectorAll('.my_listing_section.market_content_block.market_home_listing_table')[1];
if (orders !== null && orders !== undefined) {
    const tableHeader = orders.querySelector('.market_listing_table_header');
    const cancelColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    cancelColumnHeader.innerText = 'CANCEL ALL';
    cancelColumnHeader.setAttribute('title', 'Click here to cancel all your buy orders!');
    cancelColumnHeader.classList.add('clickable');

    cancelColumnHeader.insertAdjacentHTML('afterend', `<span id="cancelSelected" class="market_listing_right_cell market_listing_edit_buttons placeholder clickable">CANCEL</span>`);

    document.getElementById('cancelSelected').addEventListener('click', () => {
        orders.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(orderRow => {
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
        orders.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(orderRow => {
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