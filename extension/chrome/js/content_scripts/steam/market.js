function getMyListingIDFromElement(listingElement) {return listingElement.id.split('mylisting_')[1]}

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

const sellListings = document.getElementById('tabContentsMyActiveMarketListingsTable');
if (sellListings !== null) {
    const tableHeader = sellListings.querySelector('.market_listing_table_header');
    const removeColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    removeColumnHeader.innerText = 'REMOVE ALL';
    removeColumnHeader.classList.add('clickable');

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

// reloads the page on extension update/reload/uninstall
chrome.runtime.connect().onDisconnect.addListener(() =>{location.reload()});