import DOMPurify from 'dompurify';

import { dopplerPhases } from 'utils/static/dopplerPhases';
import {
  getDataFilledFloatTechnical,
  getDopplerInfo,
  getFloatBarSkeleton,
  getPattern,
  logExtensionPresence,
  parseStickerInfo,
  reloadPageOnExtensionReload,
  souvenirExists,
  updateLoggedInUserInfo,
  toFixedNoRounding,
  addUpdatedRibbon, changePageTitle,
} from 'utils/utilsModular';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import exteriors from 'utils/static/exteriors';
import { getPrice, getStickerPriceTotal } from 'utils/pricing';
import { trackEvent } from 'utils/analytics';
import {
  genericMarketLink, souvenir, starChar, stattrak, stattrakPretty,
} from 'utils/static/simpleStrings';
import { injectScript, injectStyle } from 'utils/injection';

const inBrowserInspectButtonPopupLink = `
    <a class="popup_menu_item" id="inbrowser_inspect" href="http://csgo.gallery/" target="_blank">
        ${chrome.i18n.getMessage('inspect_in_browser')}
    </a>`;
const dopplerPhase = '<div class="dopplerPhaseMarket"><span></span></div>';

let itemWithInspectLink = false;
// adds the in-browser inspect button to the top of the page
const actions = document.getElementById('largeiteminfo_item_actions');
// sometimes the page does not load correctly, for example when Steam shows:
// "There was an error getting listings for this item. Please try again later."
if (actions !== null) {
  const originalInspectButton = actions.querySelector('.btn_small.btn_grey_white_innerfade');
  // some items don't have inspect buttons (like cases)
  if (originalInspectButton !== null) {
    itemWithInspectLink = true;
    const inspectLink = originalInspectButton.getAttribute('href');
    const inBrowserInspectButton = `
    <a class="btn_small btn_grey_white_innerfade" id="inbrowser_inspect_button" href="http://csgo.gallery/${inspectLink}" target="_blank">
        <span>
            ${chrome.i18n.getMessage('inspect_in_browser')}
        </span>
    </a>`;
    document.getElementById('largeiteminfo_item_actions').insertAdjacentHTML(
      'beforeend',
      DOMPurify.sanitize(inBrowserInspectButton, { ADD_ATTR: ['target'] }),
    );
    document.getElementById('inbrowser_inspect_button').addEventListener('click', () => {
      // analytics
      trackEvent({
        type: 'event',
        action: 'MarketInspection',
      });
    });
  }
}

// it takes the visible descriptors and checks if the collection includes souvenirs
let textOfDescriptors = '';
document.querySelectorAll('.descriptor').forEach((descriptor) => { textOfDescriptors += descriptor.innerText; });
const thereSouvenirForThisItem = souvenirExists(textOfDescriptors);
const isCommodityItem = document.getElementById('searchResultsRows') === null;

let weaponName = '';
const fullName = decodeURIComponent(window.location.href).split('listings/730/')[1];
let star = '';
const isStattrak = /StatTrak™/.test(fullName);
const isSouvenir = /Souvenir/.test(fullName);

if (fullName.includes('★')) star = starChar;
if (isStattrak) weaponName = fullName.split('StatTrak™ ')[1].split('(')[0];
else if (isSouvenir) weaponName = fullName.split('Souvenir ')[1].split('(')[0];
else {
  weaponName = fullName.split('(')[0].split('★ ')[1];
  if (weaponName === undefined) weaponName = fullName.split('(')[0];
}

let stOrSv = stattrakPretty;
let stOrSvClass = 'stattrakOrange';
let linkMidPart = star + stattrak;
if (isSouvenir || thereSouvenirForThisItem) {
  stOrSvClass = 'souvenirYellow';
  stOrSv = souvenir;
  linkMidPart = souvenir;
}

const getElementByListingID = (listingID) => {
  return document.getElementById(`listing_${listingID}`);
};

const getListingIDFromElement = (listingElement) => {
  return listingElement.id.split('listing_')[1];
};

const addPhasesIndicator = () => {
  if (window.location.href.includes('Doppler')) {
    const listingsTable = document.getElementById('searchResultsTable');
    if (listingsTable !== null) {
      listingsTable.querySelectorAll('.market_listing_item_img_container').forEach((container) => {
        container.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhase));
        const phase = getDopplerInfo(container.querySelector('img').getAttribute('src').split('economy/image/')[1].split('/')[0]);
        const dopplerElement = container.querySelector('.dopplerPhaseMarket');

        switch (phase.short) {
          case dopplerPhases.sh.short:
            dopplerElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.sh.element));
            break;
          case dopplerPhases.rb.short:
            dopplerElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.rb.element));
            break;
          case dopplerPhases.em.short:
            dopplerElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.em.element));
            break;
          case dopplerPhases.bp.short:
            dopplerElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.bp.element));
            break;
          default:
            dopplerElement.querySelector('span').innerText = phase.short;
        }
      });
    }
  }
};

const getListings = () => {
  const getListingsScript = `
    document.querySelector('body').setAttribute('listingsInfo', JSON.stringify({
        listings: typeof g_rgListingInfo !== 'undefined' ? g_rgListingInfo : {},
        assets: typeof g_rgAssets !== 'undefined' ? g_rgAssets : {730:{2:{}}}
    }));`;

  const listingsInfo = JSON.parse(injectScript(getListingsScript, true, 'getListings', 'listingsInfo'));
  const assets = listingsInfo.assets[730][2];
  const listings = listingsInfo.listings;

  for (const listing of Object.values(listings)) {
    const assetID = listing.asset.id;

    for (const asset of Object.values(assets)) {
      const stickers = parseStickerInfo(asset.descriptions, 'search');

      if (assetID === asset.id) {
        listing.asset = asset;
        listing.asset.stickers = stickers;
      }
    }
  }

  return listings;
};

const addStickers = () => {
  // removes sih sticker info
  document.querySelectorAll('.sih-images').forEach((image) => {
    image.remove();
  });

  // inject style to modify the listing row
  injectStyle(`
  .extension__row {
    overflow: initial;
    float: left;
    max-width: 100%;
   }
  `, 'listingRowOverRide');

  const listings = getListings();

  if (!isCommodityItem) {
    document.getElementById('searchResultsRows').querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(
      (listingRow) => {
        if (listingRow.parentNode.id !== 'tabContentsMyActiveMarketListingsRows' && listingRow.parentNode.parentNode.id !== 'tabContentsMyListings') {
          const listingID = getListingIDFromElement(listingRow);

          if (listingRow.querySelector('.stickerHolderMarket') === null) { // if stickers elements not added already
            const nameBlock = listingRow.querySelector('.market_listing_item_name_block');
            nameBlock.classList.add('extension__row');
            nameBlock.insertAdjacentHTML(
              'beforeend',
              DOMPurify.sanitize(`<div class="stickerHolderMarket" id="stickerHolder_${listingID}"></div>`),
            );
            const stickers = listings[listingID].asset.stickers;

            stickers.forEach((stickerInfo) => {
              listingRow.querySelector('.stickerHolderMarket').insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(
                  `<span class="stickerSlotMarket" data-tooltip-market="${stickerInfo.name}">
                        <a href="${stickerInfo.marketURL}" target="_blank">
                            <img src="${stickerInfo.iconURL}" class="stickerIcon">
                        </a>
                     </span>`,
                  { ADD_ATTR: ['target'] },
                ),
              );
            });
            listingRow.querySelector('.stickerHolderMarket').insertAdjacentHTML('afterend',
              DOMPurify.sanitize('<div class="stickersTotal" data-tooltip-market="Total Price of Stickers on this item"></div>'));
          }
        }
      },
    );
  }
};

const populateFloatInfo = (listingID, floatInfo) => {
  const listingElement = getElementByListingID(listingID);

  // if for example the user has changed page and the listing is not there anymore
  if (listingElement !== null) {
    const floatTechnical = listingElement.querySelector('.floatTechnical');
    if (floatTechnical !== null) {
      floatTechnical.innerHTML = DOMPurify.sanitize(getDataFilledFloatTechnical(floatInfo), { ADD_ATTR: ['target'] });
      const position = ((toFixedNoRounding(floatInfo.floatvalue, 2) * 100) - 2);
      listingElement.querySelector('.floatToolTip').setAttribute('style', `left: ${position}%`);
      listingElement.querySelector('.floatDropTarget').innerText = toFixedNoRounding(floatInfo.floatvalue, 4);
    }
  }
};

// sticker wear to sticker icon tooltip
const setStickerInfo = (listingID, stickers) => {
  if (stickers !== null) {
    chrome.storage.local.get(['prices', 'pricingProvider', 'exchangeRate', 'currency'],
      (result) => {
        const listingElement = getElementByListingID(listingID);

        if (listingElement !== null) {
          stickers.forEach((stickerInfo, index) => {
            const wear = stickerInfo.wear !== undefined
              ? Math.trunc(Math.abs(1 - stickerInfo.wear) * 100)
              : 100;
            const currentSticker = listingElement.querySelectorAll('.stickerSlotMarket')[index];
            const stickerPrice = getPrice(
              `Sticker | ${stickerInfo.name}`,
              null,
              result.prices,
              result.pricingProvider,
              result.exchangeRate,
              result.currency,
            );

            stickerInfo.price = stickerPrice;
            currentSticker.setAttribute(
              'data-tooltip-market',
              `${stickerInfo.name} (${stickerPrice.display}) - Condition: ${wear}%`,
            );
            currentSticker.querySelector('img').setAttribute(
              'style',
              `opacity: ${(wear > 10) ? wear / 100 : (wear / 100) + 0.1}`,
            );
          });

          const stickersTotalPrice = getStickerPriceTotal(stickers, result.currency);
          listingElement.setAttribute(
            'data-sticker-price',
            stickersTotalPrice === null
              ? '0.0'
              : stickersTotalPrice.price.toString(),
          );

          const stickersTotalElement = listingElement.querySelector('.stickersTotal');
          stickersTotalElement.innerText = stickersTotalPrice === null ? '' : stickersTotalPrice.display;
        }
      });
  }
};

const addPatterns = (listingID, floatInfo) => {
  const patternInfo = getPattern(fullName, floatInfo.paintseed);
  if (patternInfo !== null) {
    const listingElement = getElementByListingID(listingID);

    if (listingElement !== null) {
      const patternClass = patternInfo.type === 'marble_fade' ? 'marbleFadeGradient' : 'fadeGradient';
      listingElement.querySelector('.market_listing_item_name').insertAdjacentHTML(
        'afterend',
        DOMPurify.sanitize(`<span class="${patternClass}"> ${patternInfo.value}</span>`),
      );
    }
  }
};

const addFloatDataToPage = (job, floatInfo) => {
  populateFloatInfo(job.listingID, floatInfo);
  setStickerInfo(job.listingID, floatInfo.stickers);
  addPatterns(job.listingID, floatInfo);
};

const hideFloatBar = (listingID) => {
  const listingElement = getElementByListingID(listingID);

  if (listingElement !== null) {
    listingElement.querySelector('.floatBar').classList.add('hidden');
  }
};

const dealWithNewFloatData = (job, floatInfo) => {
  if (floatInfo !== 'nofloat') addFloatDataToPage(job, floatInfo);
  else hideFloatBar();
};

const addListingsToFloatQueue = () => {
  chrome.storage.local.get('autoFloatMarket', (result) => {
    if (result.autoFloatMarket) {
      if (itemWithInspectLink) {
        const listings = getListings();
        for (const listing of Object.values(listings)) {
          const assetID = listing.asset.id;

          floatQueue.jobs.push({
            type: 'market',
            assetID,
            inspectLink: listing.asset.actions[0].link.replace('%assetid%', assetID),
            listingID: listing.listingid,
            callBackFunction: addFloatDataToPage,
          });
        }
        if (!floatQueue.active) workOnFloatQueue(dealWithNewFloatData);
      }
    }
  });
};

const addFloatBarSkeletons = () => {
  chrome.storage.local.get('autoFloatMarket', (result) => {
    if (result.autoFloatMarket) {
      const listingsSection = document.getElementById('searchResultsRows');

      // so it does not throw any errors when it can't find it on commodity items
      if (listingsSection !== null) {
        const listingNameBlocks = listingsSection.querySelectorAll('.market_listing_item_name_block');
        if (listingNameBlocks !== null && itemWithInspectLink) {
          listingNameBlocks.forEach((listingNameBlock) => {
            if (listingNameBlock.getAttribute('data-floatBar-added') === null
              || listingNameBlock.getAttribute('data-floatBar-added') === false) {
              listingNameBlock.insertAdjacentHTML('beforeend', DOMPurify.sanitize(getFloatBarSkeleton('market')));
              listingNameBlock.setAttribute('data-floatBar-added', 'true');

              // adds "show technical" hide and show logic
              listingNameBlock.querySelector('.showTechnical').addEventListener(
                'click',
                (event) => {
                  event.target.parentNode.querySelector('.floatTechnical').classList.toggle('hidden');
                },
              );
            }
          });
        } else {
          setTimeout(() => {
            addFloatBarSkeletons();
          }, 2000);
        }
      }
    }
  });
};

const sortListings = (sortingMode) => {
  const listingElements = [...document.getElementById('searchResultsTable')
    .querySelectorAll('.market_listing_row.market_recent_listing_row')];
  const listingsData = getListings();
  let sortedElements = [];

  if (sortingMode === 'price_asc') {
    sortedElements = listingElements.sort((a, b) => {
      const priceOfA = parseInt(listingsData[getListingIDFromElement(a)].converted_price);
      const priceOfB = parseInt(listingsData[getListingIDFromElement(b)].converted_price);
      return priceOfA - priceOfB;
    });
  } else if (sortingMode === 'price_desc') {
    sortedElements = listingElements.sort((a, b) => {
      const priceOfA = parseInt(listingsData[getListingIDFromElement(a)].converted_price);
      const priceOfB = parseInt(listingsData[getListingIDFromElement(b)].converted_price);
      return priceOfB - priceOfA;
    });
  } else if (sortingMode === 'float_asc') {
    sortedElements = listingElements.sort((a, b) => {
      const floatOfA = parseFloat(a.querySelector('.floatDropTarget').innerText);
      const floatOfB = parseFloat(b.querySelector('.floatDropTarget').innerText);
      return floatOfA - floatOfB;
    });
  } else if (sortingMode === 'float_desc') {
    sortedElements = listingElements.sort((a, b) => {
      const floatOfA = parseFloat(a.querySelector('.floatDropTarget').innerText);
      const floatOfB = parseFloat(b.querySelector('.floatDropTarget').innerText);
      return floatOfB - floatOfA;
    });
  } else if (sortingMode === 'sticker_price_asc') {
    sortedElements = listingElements.sort((a, b) => {
      const stickerPriceOfA = a.getAttribute('data-sticker-price') !== 'null' && a.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(a.getAttribute('data-sticker-price'))
        : 0.0;
      const stickerPriceOfB = b.getAttribute('data-sticker-price') !== 'null' && b.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(b.getAttribute('data-sticker-price'))
        : 0.0;
      return stickerPriceOfA - stickerPriceOfB;
    });
  } else if (sortingMode === 'sticker_price_desc') {
    sortedElements = listingElements.sort((a, b) => {
      const stickerPriceOfA = a.getAttribute('data-sticker-price') !== 'null' && a.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(a.getAttribute('data-sticker-price'))
        : 0.0;
      const stickerPriceOfB = b.getAttribute('data-sticker-price') !== 'null' && b.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(b.getAttribute('data-sticker-price'))
        : 0.0;
      return stickerPriceOfB - stickerPriceOfA;
    });
  }

  // remove all listings from page
  listingElements.forEach((listingElement) => { listingElement.remove(); });

  const listingsContainer = document.getElementById('searchResultsRows');
  sortedElements.forEach((listingElement) => {
    listingsContainer.insertAdjacentElement('beforeend', listingElement);
  });
};

const addPricesInOtherCurrencies = () => {
  chrome.storage.local.get('marketOriginalPrice', (result) => {
    if (result.marketOriginalPrice) {
      const listings = getListings();
      const listingsSection = document.getElementById('searchResultsRows');

      // so it does not throw any errors when it can't find it on commodity items
      if (listingsSection !== null) {
        listingsSection.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(
          (listingRow) => {
            if (listingRow.parentNode.id !== 'tabContentsMyActiveMarketListingsRows'
              && listingRow.parentNode.parentNode.id !== 'tabContentsMyListings') {
              const listingID = getListingIDFromElement(listingRow);

              if (listingRow.querySelector('.originalPrice') === null) { // if not added before
                const price = parseInt(listings[listingID].price);
                const priceWithFees = price + parseInt(listings[listingID].fee);
                const currencyID = parseInt(listings[listingID].currencyid) - 2000;

                listingRow.querySelector('.market_table_value').insertAdjacentHTML(
                  'beforeend',
                  DOMPurify.sanitize(
                    `<div class="originalPrice" data-currency-id="${currencyID}" data-converted="false">
                           <div class="market_listing_price_original_after_fees" title="Price including market fees in the seller's currency">${priceWithFees}</div>
                           <div class="market_listing_price_original_before_fees" title="The amount the seller receives after fees in their own currency">${price}</div>
                         </div>`,
                  ),
                );
              }
            }
          },
        );

        const currencyConverterScript = `
                    document.getElementById('searchResultsRows').querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(listing_row => {
                        const originalPriceElement = listing_row.querySelector('.originalPrice');
                        
                        if (originalPriceElement.getAttribute('data-converted') === 'false') {
                            const currencyCode = GetCurrencyCode(parseInt(originalPriceElement.getAttribute('data-currency-id')));
                            const priceWithoutFeesElement = listing_row.querySelector('.market_listing_price_original_before_fees');
                            const priceWithoutFees = parseInt(priceWithoutFeesElement.innerText);
                            
                            priceWithoutFeesElement.innerText = v_currencyformat(priceWithoutFees, currencyCode);
                            const priceWithFeesElement = listing_row.querySelector('.market_listing_price_original_after_fees');
                            const priceWithFee = parseInt(priceWithFeesElement.innerText);
                            
                            priceWithFeesElement.innerText = v_currencyformat(priceWithFee, currencyCode);
                            originalPriceElement.setAttribute('data-converted', 'true');
                        }
                    });`;

        injectScript(currencyConverterScript, true, 'currencyConverter', false);
      }
    }
  });
};

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'ListingView',
});
changePageTitle('market_listing', fullName);

const otherExteriors = `
            <div class="descriptor otherExteriors">
                <span>${chrome.i18n.getMessage('links_to_other_exteriors')}:</span>
                <ul>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Factory%20New%29`}" target="_blank">${exteriors.factory_new.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Factory%20New%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.factory_new.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Minimal%20Wear%29`}"" target="_blank">${exteriors.minimal_wear.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Minimal%20Wear%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.minimal_wear.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Field-Tested%29`}"" target="_blank">${exteriors.field_tested.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Field-Tested%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.field_tested.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Well-Worn%29`}"" target="_blank">${exteriors.well_worn.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Well-Worn%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.well_worn.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Battle-Scarred%29`}"" target="_blank">${exteriors.battle_scarred.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Battle-Scarred%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.battle_scarred.localized_name}</span></a></li>
                </ul>
                <span>${chrome.i18n.getMessage('not_every_available')}</span>
            </div>
            `;

const descriptor = document.getElementById('largeiteminfo_item_descriptors');
if (fullName.split('(')[1] !== undefined && descriptor !== null) {
  descriptor.insertAdjacentHTML('beforeend', DOMPurify.sanitize(otherExteriors, { ADD_ATTR: ['target'] }));
}

// adds the in-browser inspect button to the context menu
document.getElementById('market_action_popup_itemactions')
  .insertAdjacentHTML('afterend', DOMPurify.sanitize(inBrowserInspectButtonPopupLink, { ADD_ATTR: ['target'] }));

// adds the proper link to the context menu before it gets clicked
// needed because the context menu resets when clicked
document.getElementById('inbrowser_inspect').addEventListener('mouseenter', (event) => {
  const inspectLink = document.getElementById('market_action_popup_itemactions')
    .querySelector('a.popup_menu_item').getAttribute('href');
  event.target.setAttribute('href', `http://csgo.gallery/${inspectLink}`);
});

document.getElementById('inbrowser_inspect').addEventListener('click', () => {
  // analytics
  trackEvent({
    type: 'event',
    action: 'MarketInspection',
  });
});

// adds sorting menu to market pages with individual listings
const searchBar = document.querySelector('.market_listing_filter_contents');
if (searchBar !== null) {
  searchBar.insertAdjacentHTML('beforeend',
    DOMPurify.sanitize(
      `<div class="market_sorting">
             <span class="market_listing_filter_searchhint">Sort on page by:</span>
             <select id="sortSelect">
               <option value="price_asc">Cheapest to most expensive</option>
               <option value="price_desc">Most expensive to cheapest</option>
               <option value="float_asc">Float lowest to highest</option>
               <option value="float_desc">Float highest to lowest</option>
               <option value="sticker_price_asc">Sticker price cheapest to most expensive</option>
               <option value="sticker_price_desc">Sticker price most expensive to cheapest</option>
             </select>
           </div>`,
    ));

  document.getElementById('sortSelect').addEventListener(
    'change',
    (event) => {
      sortListings(event.target.options[event.target.selectedIndex].value);
    },
  );
}

// reload page on failure
chrome.storage.local.get(['reloadListingOnError'], ({ reloadListingOnError }) => {
  if (reloadListingOnError) {
    const tableMessage = document.querySelector('.market_listing_table_message');
    const largeItemImage = document.querySelector('.market_listing_largeimage');
    // the table message includes an error message when the page failed to load
    // it should not be there otherwise, but for some reason it's not reliable
    // so check if the item image is's there too
    if (tableMessage !== null && largeItemImage === null) {
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }
});

addFloatBarSkeletons();
addPhasesIndicator();
addStickers();
addPricesInOtherCurrencies();

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.target.id === 'searchResultsRows') {
      addPhasesIndicator();
      addFloatBarSkeletons();
      addStickers();
      addListingsToFloatQueue();
      addPricesInOtherCurrencies();
    }
  }
});

const searchResultsRows = document.getElementById('searchResultsRows');
if (searchResultsRows !== null) {
  observer.observe(searchResultsRows, {
    subtree: true,
    attributes: false,
    childList: true,
  });
}

chrome.storage.local.get(['showRealMoneySiteLinks'], ({ showRealMoneySiteLinks }) => {
  if (showRealMoneySiteLinks) {
    const elementToInsertTo = isCommodityItem
      ? document.getElementById('market_commodity_order_spread')
      : document.getElementById('market_buyorder_info');

    if (elementToInsertTo !== null) {
      elementToInsertTo.insertAdjacentHTML(
        'beforebegin',
        DOMPurify.sanitize(
          `<div class="realMoneySite">
                <a href="https://skincay.com/market/730?search=${fullName}&r=gery" target="_blank" id="skincayLink" class="skincayLink">
                    You can buy this item 20-30% cheaper on Skincay
                </a>
                <span id="realMoneyExpand" class="clickable" title="Click to learn more about what this is">What is this?</span>
                <div id="realMoneyMoreInfo" class="hidden">
                    <div style="margin: 10px 0 10px 0">
                      <a href="https://skincay.com/market/730?r=gery" target="_blank" class="skincayLink">Skincay</a>
                      is a real money marketplace where you can buy and sell skins. <br>
                      They have a very simple to use interface, good prices and great support. <br>
                      You can save money by buying items there instead of the market. <br>
                      <a href="https://skincay.com/market/730?search=${fullName}&r=gery" target="_blank" class="skincayLink">
                          Follow this link to check listings for his item on Skincay.com
                      </a>
                    </div>
                    <div>
                      This message was added by the CSGO Trader extension. using the above link to purchase something helps the development of the extension.
                      If you don't wish to see this message in the future you can go the options and turn the feature off.
                    </div>
                </div>
            </div>`,
          { ADD_ATTR: ['target'] },
        ),
      );

      document.querySelectorAll('.skincayLink').forEach((link) => {
        link.addEventListener('click', () => {
          trackEvent('marketSkincayLinkClicked');
        });
      });

      document.getElementById('realMoneyExpand').addEventListener('click', () => {
        document.getElementById('realMoneyMoreInfo').classList.remove('hidden');
      });
    }
  }
});

chrome.storage.local.get('numberOfListings', ({ numberOfListings }) => {
  const numberOfListingsInt = parseInt(numberOfListings);
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(numberOfListingsInt) && numberOfListingsInt !== 10) {
    const loadMoreMarketAssets = `g_oSearchResults.m_cPageSize = ${numberOfListingsInt}; g_oSearchResults.GoToPage(0, true);`;
    injectScript(loadMoreMarketAssets, true, 'loadMoreMarketAssets', null);
  } else addListingsToFloatQueue();
});

reloadPageOnExtensionReload();
