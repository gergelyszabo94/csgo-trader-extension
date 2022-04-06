import DOMPurify from 'dompurify';

import {
  reloadPageOnExtensionReload, logExtensionPresence,
  updateLoggedInUserInfo, addUpdatedRibbon, updateLoggedInUserName,
} from 'utils/utilsModular';
import { getItemMarketLink } from 'utils/simpleUtils';
import {
  removeListing, getMarketHistory, cancelOrder, createOrder,
} from 'utils/market';
import {
  steamFormattedPriceToCents, centsToSteamFormattedPrice, priceQueue,
  workOnPriceQueue, initPriceQueue, updateWalletCurrency, getHighestBuyOrder,
} from 'utils/pricing';
import { injectStyle } from 'utils/injection';
import { overrideLoadMarketHistory } from 'utils/steamOverriding';

const marketHistoryExport = {
  history: [],
  from: 0,
  to: 1000000,
  progress: 0,
  inProgress: false,
  lastRequestSuccessful: true,
};

const getWalletAmount = () => {
  return steamFormattedPriceToCents(document.getElementById('header_wallet_balance').innerText);
};

const getMyListingIDFromElement = (listingElement) => {
  return listingElement.id.split('mylisting_')[1];
};

const getMyOrderIDFromElement = (orderElement) => {
  return orderElement.id.split('mybuyorder_')[1];
};

const getElementByListingID = (listingID) => {
  return document.getElementById(`mylisting_${listingID}`);
};

const getElementByOrderID = (orderID) => {
  return document.getElementById(`mybuyorder_${orderID}`);
};

const switchToNextPageIfEmpty = (listings) => {
  if (listings.querySelectorAll('.market_listing_row.market_recent_listing_row').length === 0) {
    document.getElementById('tabContentsMyActiveMarketListings_btn_next').click();
  }
};

const getAppIDAndItemNameFromLink = (marketLink) => {
  const appID = marketLink.split('listings/')[1].split('/')[0];
  const marketHashName = marketLink.split('listings/')[1].split('/')[1];
  return { appID, marketHashName };
};

const getHistoryType = (historyRow) => {
  const gainOrLoss = historyRow.querySelector('.market_listing_gainorloss').innerText.trim();
  let historyType;

  switch (gainOrLoss) {
    case '+': historyType = 'purchase'; break;
    case '-': historyType = 'sale'; break;
    default: historyType = historyRow.querySelector('.market_listing_whoactedwith').innerText.replace(/\s/g, '');
  }
  return historyType;
};

const addStartingAtPriceInfoToPage = (listingID, lowestPrice) => {
  const listingRow = getElementByListingID(listingID);

  // the listing might not be there for example if the page was switched
  // the per page listing count was changed or the listing was removed
  if (listingRow !== null) {
    const startingAt = listingRow.querySelector('.startingAtPrice');
    // also avoid adding the same element multiple times by checking if it exist already
    if (startingAt === null) {
      const priceElement = listingRow.querySelector('.market_listing_price');
      const listedPrice = priceElement.querySelectorAll('span')[1].innerText;
      const formattedPrice = centsToSteamFormattedPrice(lowestPrice);
      const cheapest = listedPrice === formattedPrice ? 'cheapest' : 'not_cheapest';

      priceElement.insertAdjacentHTML('beforeend',
        DOMPurify.sanitize(`<div class="startingAtPrice ${cheapest}" title="This is the price of the lowest listing right now.">
                ${formattedPrice}
             </div>`));
    }
  }
};

const addHistoryStartingAtPriceInfoToPage = (rowID, lowestPrice) => {
  const historyRow = document.getElementById(rowID);

  // the history might not be there for example if the page was switched
  if (historyRow !== null) {
    const startingAt = historyRow.querySelector('.startingAtPrice');
    // also avoid adding the same element multiple times by checking if it exist already
    if (startingAt === null) {
      const priceElement = historyRow.querySelector('.market_listing_price');
      const formattedPrice = centsToSteamFormattedPrice(lowestPrice);
      priceElement.insertAdjacentHTML('beforeend',
        DOMPurify.sanitize(`<div class="startingAtPrice" title="This is the price of the lowest listing right now.">
                ${formattedPrice}
             </div>`));
    }
  }
};

const addListingStartingAtPricesAndTotal = (sellListings) => {
  let totalPrice = 0;
  let totalYouReceivePrice = 0;

  // add starting at prices and total
  sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row')
    .forEach((listingRow) => {
      // adds selection checkboxes
      const priceElement = listingRow.querySelector('.market_listing_right_cell.market_listing_my_price');
      if (priceElement !== null) {
        priceElement.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(`
            <div class="market_listing_right_cell market_listing_edit_buttons">
                <input type="checkbox">
            </div>`));
      }

      const nameElement = listingRow.querySelector('.market_listing_item_name_link');
      if (nameElement !== null) {
        const marketLink = nameElement.getAttribute('href');
        const appID = getAppIDAndItemNameFromLink(marketLink).appID;
        const marketHashName = getAppIDAndItemNameFromLink(marketLink).marketHashName;
        const listingID = getMyListingIDFromElement(listingRow);

        const lisintPriceElement = listingRow.querySelector('.market_listing_price');
        const listedPrice = lisintPriceElement.querySelectorAll('span')[1].innerText;
        const youReceivePrice = lisintPriceElement.querySelectorAll('span')[2]
          .innerText.split('(')[1].split(')')[0];

        totalPrice += parseInt(steamFormattedPriceToCents(listedPrice));
        totalYouReceivePrice += parseInt(steamFormattedPriceToCents(youReceivePrice));

        priceQueue.jobs.push({
          type: 'my_listing',
          listingID,
          appID,
          market_hash_name: marketHashName,
          retries: 0,
          callBackFunction: addStartingAtPriceInfoToPage,
        });

        if (!priceQueue.active) workOnPriceQueue();
      }
    });

  const listingsTotal = document.getElementById('listingsTotal');
  if (listingsTotal !== null) listingsTotal.remove();

  sellListings.insertAdjacentHTML(
    'afterend',
    DOMPurify.sanitize(
      `<div id='listingsTotal' style="margin: -15px 0 15px;">
                Total listed price: ${centsToSteamFormattedPrice(totalPrice)} You will receive: ${centsToSteamFormattedPrice(totalYouReceivePrice)} (on this page)
            </div>`,
    ),
  );
};

const extractHistoryEvents = (resultHtml, hovers, assets) => {
  const tempEl = document.createElement('div');
  tempEl.innerHTML = DOMPurify.sanitize(resultHtml);

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
    let appID = null;
    let contextID = null;
    let assetID = null;
    let classID = null;
    let instanceID = null;
    let unOwnedContextID = null;
    let unOwnedID = null;
    let marketName = null;

    // non-transactional (listing creation or cancellation) history events don't have partners
    // and you can't hover on them, so the asset data is missing
    if (type === 'sale' || type === 'purchase') {
      const partnerName = partnerElement.querySelector('img').title;
      const partnerLink = partnerElement.querySelector('a').getAttribute('href');
      partner = { partnerName, partnerLink };
      const rowID = historyRow.id;
      const hoverDataSplit = hovers.split(`${rowID}_name`)[1].split(');')[0].split(',');
      appID = parseInt(hoverDataSplit[1]);
      contextID = parseInt(hoverDataSplit[2].split('\'')[1]);
      assetID = hoverDataSplit[3].split('\'')[1];
      const asset = assets[appID][contextID][assetID];

      classID = asset.classid;
      instanceID = asset.instanceid;
      unOwnedContextID = asset.unowned_contextid;
      unOwnedID = asset.unowned_id;
      marketName = asset.market_hash_name;
    }

    eventsToReturn.push({
      itemName,
      gameName,
      listedOn,
      actedOn,
      displayPrice,
      priceInCents,
      partner,
      type,
      marketName,
      appID,
      contextID,
      assetID,
      classID,
      instanceID,
      unOwnedContextID,
      unOwnedID,
    });
  });

  tempEl.remove();
  return eventsToReturn;
};

const createCSV = () => {
  const excludeNonTransaction = document.getElementById('excludeNonTransaction').checked;
  let csvContent = 'Item Name,Game Name,Listed On,Acted On, Display Price, Price in Cents, Type, Market Name, App Id, Context Id, Asset Id, Instance Id, Class Id, Unowned Context Id, Unowned Id, Partner Name, Partner Link\n';

  for (let i = 0; i < marketHistoryExport.to - marketHistoryExport.from; i += 1) {
    const historyEvent = marketHistoryExport.history[i];
    if (!(excludeNonTransaction && historyEvent.type !== 'purchase' && historyEvent.type !== 'sale')) {
      const lineCSV = historyEvent.partner !== null
        ? `"${historyEvent.itemName}","${historyEvent.gameName}","${historyEvent.listedOn}","${historyEvent.actedOn}","${historyEvent.displayPrice}","${historyEvent.priceInCents}","${historyEvent.type}","${historyEvent.marketName}","${historyEvent.appID}","${historyEvent.contextID}","${historyEvent.assetID}","${historyEvent.instanceID}","${historyEvent.classID}","${historyEvent.unOwnedContextID}","${historyEvent.unOwnedID}","${historyEvent.partner.partnerName}","${historyEvent.partner.partnerLink}"\n`
        : `"${historyEvent.itemName}","${historyEvent.gameName}","${historyEvent.listedOn}","${historyEvent.actedOn}","${historyEvent.displayPrice}","${historyEvent.priceInCents}","${historyEvent.type}",,,,,,,,,,,\n`;
      csvContent += lineCSV;
    }
  }

  const encodedURI = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const downloadButton = document.getElementById('market_history_download');
  downloadButton.setAttribute('href', encodedURI);
  downloadButton.classList.remove('hidden');
};

const workOnExport = () => {
  if (marketHistoryExport.inProgress) {
    const delay = marketHistoryExport.lastRequestSuccessful ? 5000 : 30000;
    getMarketHistory(marketHistoryExport.progress, 50).then(
      (history) => {
        marketHistoryExport.lastRequestSuccessful = true;
        marketHistoryExport.progress += 50;
        marketHistoryExport.history = marketHistoryExport.history.concat(
          extractHistoryEvents(history.results_html, history.hovers, history.assets),
        );

        const requestProgressEl = document.getElementById('requestProgress');
        requestProgressEl.innerText = (parseInt(requestProgressEl.innerText) + 1).toString();
        const timeRemainingEl = document.getElementById('timeRemaining');
        timeRemainingEl.innerText = (parseInt(timeRemainingEl.innerText) - 5).toString();

        if (marketHistoryExport.progress >= marketHistoryExport.to - marketHistoryExport.from) {
          marketHistoryExport.inProgress = false;
          createCSV();
          document.getElementById('exportHelperMessage').innerText = 'Export finished, you can now download the result!';
          document.getElementById('exportProgress').classList.add('hidden');
        } else setTimeout(() => { workOnExport(); }, delay);
      }, (error) => {
        marketHistoryExport.lastRequestSuccessful = false;
        console.log(error);
      },
    );
  }
};

const addHighestBuyOrderPrice = (job, highestBuyOrder) => {
  const priceOfHighestOrder = centsToSteamFormattedPrice(highestBuyOrder);
  const orderRow = getElementByOrderID(job.orderID);

  // the order might not be there for example if the page was switched
  // the per page order count was changed or the order was canceled
  if (orderRow !== null) {
    const priceElement = orderRow.querySelector('.market_listing_price');
    if (priceElement.offsetParent !== null) { // if visible
      const orderPrice = parseInt(steamFormattedPriceToCents(priceElement.innerText));
      const highest = orderPrice >= highestBuyOrder ? 'highest' : 'not_highest';
      priceElement.insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(
          `<div class="highestOrderPrice ${highest}" title="This is the price of the highest buy order right now.">
                ${priceOfHighestOrder}
             </div>`,
        ),
      );
    }
  }
};

logExtensionPresence();
overrideLoadMarketHistory();
updateWalletCurrency();
initPriceQueue();
updateLoggedInUserInfo();
updateLoggedInUserName();
addUpdatedRibbon();

// makes remove/cancel columns narrower
injectStyle(`
.market_listing_edit_buttons {
    width: 120px;
}`, 'editColumnWidth');

const sellListings = document.getElementById('tabContentsMyActiveMarketListingsTable');

if (sellListings !== null) {
  const tableHeader = sellListings.querySelector('.market_listing_table_header');

  // if there are listings
  if (tableHeader !== null) {
    const tabContentRows = document.getElementById('tabContentsMyActiveMarketListingsRows');

    if (tabContentRows !== null) {
      // listens for listing changes like removal, page switching
      const observer = new MutationObserver(() => {
        if (sellListings.parentElement.style.display !== 'none') { // only execute if it's the active tab
          addListingStartingAtPricesAndTotal(sellListings);
        }
      });

      observer.observe(tabContentRows, {
        subtree: false,
        childList: true,
        attributes: false,
      });
    }

    const removeColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

    removeColumnHeader.innerText = 'REMOVE ALL';
    removeColumnHeader.setAttribute('title', 'Click here to remove all listings from this page!');
    removeColumnHeader.classList.add('clickable');

    // adds remove selected column header/button
    removeColumnHeader.insertAdjacentHTML('afterend', DOMPurify.sanitize(`
        <span id="removeSelected" class="market_listing_right_cell market_listing_edit_buttons placeholder clickable" title="Click to remove the selected listings.">
            REMOVE
        </span>`));

    document.getElementById('removeSelected').addEventListener('click', () => {
      sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach((listingRow) => {
        if (listingRow.querySelector('input').checked) {
          const listingID = getMyListingIDFromElement(listingRow);
          removeListing(listingID).then(
            () => {
              listingRow.remove();
              switchToNextPageIfEmpty(sellListings);
            },
          );
        }
      });
    });

    removeColumnHeader.addEventListener('click', () => {
      sellListings.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach((listingRow) => {
        const listingID = getMyListingIDFromElement(listingRow);
        removeListing(listingID).then(
          () => {
            listingRow.remove();
            switchToNextPageIfEmpty(sellListings);
          },
        );
      });
    });

    addListingStartingAtPricesAndTotal(sellListings);
  }
}

// buy order related functionality, highest buy order price, cancel selected, cancel all
// it's hard to tell apart buy orders and listings awaiting confirmation
const listingSections = document.querySelectorAll('.my_listing_section.market_content_block.market_home_listing_table');
const orders = listingSections.length === 2
  ? listingSections[1]
  : listingSections[2];
if (orders) {
  const orderRows = orders.querySelectorAll('.market_listing_row.market_recent_listing_row');

  // if there are actually any orders
  if (orderRows.length !== 0) {
    chrome.storage.local.get(['outBidPercentage'], ({ outBidPercentage }) => {
      let totalOrderAmount = 0;
      const totalAllowedByWallet = getWalletAmount() * 10;

      // add starting at prices and total
      orderRows.forEach((orderRow) => {
        // makes the row higher to make space for the order buttons
        orderRow.style['padding-bottom'] = '15px';

        // adds selection checkboxes
        const priceElement = orderRow.querySelector('.market_listing_right_cell.market_listing_my_price');
        if (priceElement !== null) {
          priceElement.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(`
            <div class="market_listing_right_cell market_listing_edit_buttons" style="line-height: 20px">
                <div>
                    <input type="checkbox" />
                </div>
                <div>
                    <button type="submit" class="outbid outBidButton btn_green_white_innerfade btn_small" title="Cancel the current order and place the highest buy order">
                        Outbid
                    </button>
                </div>
                <div>
                    <button type="submit" class="outbidByPercent outBidButton btn_green_white_innerfade btn_small" title="Cancel the current order and place a higher order by 1% than the current highest">
                        Outbid by ${outBidPercentage}%
                    </button>
                </div>
            </div>`));

          orderRow.querySelectorAll('.outBidButton').forEach((outBidButton) => {
            outBidButton.addEventListener('click', () => {
              const outBidType = outBidButton.classList.contains('outbidByPercent')
                ? 'percentage'
                : 'highest';
              const orderID = getMyOrderIDFromElement(orderRow);
              const quantity = parseInt(orderRow.querySelector('.market_listing_right_cell.market_listing_my_price.market_listing_buyorder_qty').innerText);
              cancelOrder(orderID).then(
                () => {
                  const marketLink = orderRow.querySelector('.market_listing_item_name_link').getAttribute('href');
                  const appID = marketLink.split('market/listings/')[1].split('/')[0];
                  const marketName = marketLink.split('market/listings/')[1].split('/')[1];
                  getHighestBuyOrder(appID, marketName).then((highestOrder) => {
                    const highestInt = parseInt(highestOrder);
                    const newOrderPrice = outBidType === 'highest'
                      ? highestInt + 1
                      : highestInt >= 100
                        ? Math.floor(highestInt * (1 + (outBidPercentage / 100)))
                        : highestInt + outBidPercentage;
                    createOrder(appID, marketName, newOrderPrice, quantity).then(() => {
                      const priceEl = orderRow.querySelector('.highestOrderPrice');
                      if (priceEl) {
                        priceEl.innerText = centsToSteamFormattedPrice(newOrderPrice);
                        priceEl.classList.add('highest');
                        priceEl.classList.remove('not_highest');
                      }
                      outBidButton.innerText = 'Order placed';
                    }).catch((err) => {
                      document.querySelector('.ordersTotal').insertAdjacentHTML(
                        'afterend',
                        DOMPurify.sanitize(
                          `<div class="listingError">
                                ${err}
                            </div>`,
                        ),
                      );
                    });
                  });
                },
              );
            });
          });
        }

        const nameElement = orderRow.querySelector('.market_listing_item_name_link');
        if (nameElement !== null) {
          const marketLink = nameElement.getAttribute('href');
          const appID = getAppIDAndItemNameFromLink(marketLink).appID;
          const marketHashName = getAppIDAndItemNameFromLink(marketLink).marketHashName;
          const orderID = getMyOrderIDFromElement(orderRow);

          const orderPrice = orderRow.querySelector('.market_listing_price').innerText;
          const orderQuantity = orderRow.querySelector('.market_listing_buyorder_qty').innerText;

          totalOrderAmount += parseInt(steamFormattedPriceToCents(orderPrice))
            * parseInt(orderQuantity);

          priceQueue.jobs.push({
            type: 'my_buy_order',
            orderID,
            appID,
            market_hash_name: marketHashName,
            retries: 0,
            callBackFunction: addHighestBuyOrderPrice,
          });

          if (!priceQueue.active) workOnPriceQueue();
        }
      });

      const remainingAmountForOrders = totalOrderAmount > totalAllowedByWallet
        ? ''
        : `You can set more orders totaling: ${centsToSteamFormattedPrice(totalAllowedByWallet - totalOrderAmount)}`;
      orders.insertAdjacentHTML(
        'afterend',
        DOMPurify.sanitize(
          `<div class="ordersTotal">
                   Orders placed total value: ${centsToSteamFormattedPrice(totalOrderAmount)}
                   Max allowed by current balance: 
                   <span
                    class="${totalOrderAmount > totalAllowedByWallet ? 'loss' : 'profit'}"
                    title="${totalOrderAmount > totalAllowedByWallet ? 'You can\'t place new orders right now!' : 'You can place new orders up to this amount!'}">
                        ${centsToSteamFormattedPrice(totalAllowedByWallet)}
                   </span>
                   <span>
                        ${remainingAmountForOrders} 
                   </span>
               </div>`,
        ),
      );

      const tableHeader = orders.querySelector('.market_listing_table_header');
      const cancelColumnHeader = tableHeader.querySelector('.market_listing_right_cell.market_listing_edit_buttons.placeholder');

      cancelColumnHeader.innerText = 'CANCEL ALL';
      cancelColumnHeader.setAttribute('title', 'Click here to cancel all your buy orders!');
      cancelColumnHeader.classList.add('clickable');

      // adds cancel selected column header/button
      cancelColumnHeader.insertAdjacentHTML(
        'afterend',
        DOMPurify.sanitize(
          `<span
                id="cancelSelected"
                class="market_listing_right_cell market_listing_edit_buttons placeholder clickable"
                title="Click to cancel the selected buy orders."
              >
                CANCEL
              </span>`,
        ),
      );

      document.getElementById('cancelSelected').addEventListener('click', () => {
        orderRows.forEach((orderRow) => {
          if (orderRow.querySelector('input').checked) {
            const orderID = getMyOrderIDFromElement(orderRow);
            cancelOrder(orderID).then(
              () => {
                orderRow.remove();
              },
            );
          }
        });
      });

      cancelColumnHeader.addEventListener('click', () => {
        if (!cancelColumnHeader.getAttribute('data-confirm')) {
          cancelColumnHeader.setAttribute('data-confirm', true);
          cancelColumnHeader.innerText = 'Click again to remove all!';
        } else {
          orderRows.forEach((orderRow, index) => {
            setTimeout(() => {
              cancelOrder(getMyOrderIDFromElement(orderRow)).then(
                () => {
                  orderRow.remove();
                },
              );
            }, index * 1000);
          });
        }
      });
    });
  }
}

// market history features
const marketHistoryTab = document.getElementById('tabContentsMyMarketHistory');
if (marketHistoryTab !== null) {
  // listens for history page changes
  const observer = new MutationObserver((mutationRecord) => {
    if (sellListings.style.display !== 'none') { // only execute if it's the active tab
      if (mutationRecord[0].target.id === 'tabContentsMyMarketHistory'
        || mutationRecord[0].target.id === 'tabContentsMyMarketHistoryRows') {
        marketHistoryTab.querySelectorAll('.market_listing_row.market_recent_listing_row')
          .forEach((historyRow) => {
            const itemName = historyRow.getAttribute('data-name');
            if (itemName !== null) {
              const appID = historyRow.getAttribute('data-appid');
              const nameElement = historyRow.querySelector('.market_listing_item_name');
              const name = nameElement.innerText;

              nameElement.innerHTML = DOMPurify.sanitize(
                `<a href="${getItemMarketLink(appID, itemName)}" target="_blank">
                          ${name}
                      </a>`,
                { ADD_ATTR: ['target'] },
              );

              priceQueue.jobs.push({
                type: 'history_row',
                rowID: historyRow.id,
                appID,
                market_hash_name: itemName,
                retries: 0,
                callBackFunction: addHistoryStartingAtPriceInfoToPage,
              });
            }
            const historyType = getHistoryType(historyRow);
            historyRow.classList.add(historyType);
          });

        if (!priceQueue.active) workOnPriceQueue();
      }
    }
  });

  observer.observe(marketHistoryTab, {
    subtree: true,
    childList: true,
    attributes: false,
  });
}

// market history export
const marketHistoryButton = document.getElementById('tabMyMarketHistory');
const myListingsButton = document.getElementById('tabMyListings');

if (marketHistoryButton !== null) {
  // inserts export tab button
  marketHistoryButton.insertAdjacentHTML(
    'afterend',
    DOMPurify.sanitize(
      `<a id="tabMyMarketHistoryExport" class="market_tab_well_tab market_tab_well_tab_inactive" href="#">
                <span class="market_tab_well_tab_contents">Export Market History</span>
            </a>`,
    ),
  );

  // inserts export tab content
  document.getElementById('myListings').insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(
      `<div id="tabContentsMyMarketHistoryExport" class="my_listing_section market_content_block" style="display: none;">
            <h1 class="historyExportTitle">Export Market History (<span class="numberOfHistoryEvents">0</span> history events)</h1> 
            <p>
                Exporting your market history can be great if you want to analyse it in a spreadsheet for example.
                A history event is either one of these four actions: a purchase, a sale, a listing creation or a listing cancellation.
                The result is a .csv file that you can open in Microsoft Excel or use programmatically.
                It is in utf-8 charset, if you see weird characters in your Excel you should try
                <a href="https://www.itg.ias.edu/content/how-import-csv-file-uses-utf-8-character-encoding-0" target="_blank">importing it as such</a>.
            </p>
            <p>
                The item names will be in the language you have set on Steam at the moment.
                Unfortunately Steam only returns day accuracy, that means you won't be able to tell at what specific time you transacted.
                You also won't be able to easily tell which year the event is from.
            </p>
            <p>
                The most recent history event is event 0, the first one is the event with the highest number
                (<span class="numberOfHistoryEvents">0</span> in your case).
                Your market history is requested in chunks and might take a while if do lots of transactions.
            </p>
            <p>
                Range: Events <input type="number" min="0" max="1000000" value="0" id="exportFrom"/> to <input type="number" min="50" max="1000000" value="50" id="exportTo"/> 
                Exclude non-transaction events<input type="checkbox" id="excludeNonTransaction"/>
                <span id="exportMarketHistory" class="clickable underline"> Start history export!</span>
            </p>
            <div>
                <span id="exportHelperMessage"></span> 
                <span id="exportProgress" class="hidden">
                    Request <span id="requestProgress">0</span>/<span id="numberOfRequests">0</span> Estimated time remaining: <span id="timeRemaining">0</span> seconds
                </span>
            </div>
            <div>
                <a class="hidden" id="market_history_download" href="" download="market_history.csv">Download market_history.csv</a> 
            </div>
        </div>    
    `,
      { ADD_ATTR: ['target'] },
    ),
  );

  const marketHistoryExportButton = document.getElementById('exportMarketHistory');
  const marketHistoryExportContent = document.getElementById('tabContentsMyMarketHistoryExport');
  const marketHistoryExportTabButton = document.getElementById('tabMyMarketHistoryExport');

  // hides the export tab when one of the other tabs becomes active
  [marketHistoryButton, myListingsButton].forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      marketHistoryExportTabButton.classList.remove('market_tab_well_tab_active');
      marketHistoryExportTabButton.classList.add('market_tab_well_tab_inactive');
      marketHistoryExportContent.style.display = 'none';
    });
  });

  document.querySelectorAll('#exportFrom, #exportTo').forEach((range) => {
    range.addEventListener('change', () => {
      const fromElement = document.getElementById('exportFrom');
      const toElement = document.getElementById('exportTo');
      if (parseInt(fromElement.value) >= parseInt(toElement.value)) {
        fromElement.value = 0;
        toElement.value = toElement.getAttribute('max');
      }
    });
  });

  marketHistoryExportButton.addEventListener('click', () => {
    if (!marketHistoryExport.inProgress) {
      marketHistoryExport.inProgress = true;
      marketHistoryExport.history = [];
      marketHistoryExport.progress = 0;
      document.getElementById('requestProgress').innerText = '0';

      document.getElementById('exportHelperMessage').innerText = 'Exporting market history...';
      marketHistoryExport.from = parseInt(document.getElementById('exportFrom').value);
      marketHistoryExport.to = parseInt(document.getElementById('exportTo').value);

      const numOfRequests = Math.ceil(((marketHistoryExport.to - marketHistoryExport.from) / 50));
      document.getElementById('numberOfRequests').innerText = numOfRequests.toString();
      document.getElementById('timeRemaining').innerText = (numOfRequests * 5).toString();
      document.getElementById('exportProgress').classList.remove('hidden');

      workOnExport();
    } else document.getElementById('exportHelperMessage').innerText = 'Exporting is already in progress!';
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
      (history) => {
        document.getElementById('exportFrom').setAttribute('max', history.total_count);
        const exportToElement = document.getElementById('exportTo');
        exportToElement.setAttribute('max', history.total_count);
        exportToElement.value = history.total_count;
        document.querySelectorAll('.numberOfHistoryEvents').forEach((numberOfEvents) => {
          numberOfEvents.innerText = history.total_count;
        });
      },
    );
  });
}

reloadPageOnExtensionReload();
