import DOMPurify from 'dompurify';

import { dopplerPhases } from 'utils/static/dopplerPhases';
import {
  addUpdatedRibbon,
  changePageTitle,
  csgoFloatExtPresent,
  getDataFilledFloatTechnical,
  getDopplerInfo,
  getFloatBarSkeleton,
  getPattern,
  logExtensionPresence,
  parseStickerInfo,
  parseCharmInfo,
  souvenirExists,
  getFloatAsFormattedString,
  updateLoggedInUserInfo,
  updateLoggedInUserName,
  getBuffLink,
  refreshSteamAccessToken,
} from 'utils/utilsModular';
import { listingsSortingModes } from 'utils/static/sortingModes';
import {
  buyListing, createOrder, loadItemOrderHistogram, removeListing,
} from 'utils/market';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import exteriors from 'utils/static/exteriors';
import {
  getHighestBuyOrder,
  getPrice,
  getStickerPriceTotal,
  steamFormattedPriceToCents,
  updateWalletCurrency,
} from 'utils/pricing';
import {
  genericMarketLink, souvenir, starChar, stattrak, stattrakPretty,
} from 'utils/static/simpleStrings';
import { injectScript, injectScriptAsFile, injectStyle } from 'utils/injection';
import steamApps from 'utils/static/steamApps';
import capsuleNamesWithNoCapsuleInName from 'utils/static/capsuleNamesWithNoCapsuleInName';
import { isDopplerInName, reloadPageOnExtensionUpdate } from 'utils/simpleUtils';
import { overrideCreatePriceHistoryGraph } from 'utils/steamOverriding';
import { listenToAcceptTrade } from 'utils/tradeOffers';

const dopplerPhase = '<div class="dopplerPhaseMarket"><span></span></div>';

// it takes the visible descriptors and checks if the collection includes souvenirs
let textOfDescriptors = '';
document.querySelectorAll('.descriptor').forEach((descriptor) => { textOfDescriptors += descriptor.innerText; });
const thereSouvenirForThisItem = souvenirExists(textOfDescriptors);
const isCommodityItem = document.querySelector('.market_commodity_order_block') !== null;

let weaponName = '';
const appID = decodeURIComponent(window.location.pathname).split('/listings/')[1].split('/')[0];
const fullName = decodeURIComponent(window.location.pathname).split('/listings/')[1].split('/')[1];
let star = '';
const isStattrak = /StatTrak™/.test(fullName);
const isSouvenir = /Souvenir/.test(fullName);
const knifeNames = ['Knife', 'Bayonet', 'Karambit', 'M9 Bayonet'];
const isVanillaKnife = !fullName.includes('(') && knifeNames.includes('Knife');

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

const getElementByMyListingID = (listingID) => {
  return document.getElementById(`mylisting_${listingID}`);
};

const getMyListingIDFromElement = (listingElement) => {
  return listingElement.id.split('mylisting_')[1];
};

const getListingIDFromElement = (listingElement) => {
  return listingElement.id.split('listing_')[1];
};

// const getListingIDByInspectLink = (inspectLink) => {
//   return inspectLink.split('M')[1].split('A')[0];
// };

const addPhasesIndicator = () => {
  if (isDopplerInName(fullName)) {
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
        assets: typeof g_rgAssets !== 'undefined' ? g_rgAssets : {${appID}:{2:{}}}
    }));`;

  const listingsInfo = JSON.parse(injectScript(getListingsScript, true, 'getListings', 'listingsInfo'));
  const assets = listingsInfo.assets[appID][2];
  const listings = listingsInfo.listings;

  for (const listing of Object.values(listings)) {
    const assetID = listing.asset.id;

    for (const asset of Object.values(assets)) {
      const stickers = parseStickerInfo(asset.descriptions, 'search');
      const charms = parseCharmInfo(asset.descriptions, 'search');

      if (assetID === asset.id) {
        listing.asset = asset;
        listing.asset.stickers = stickers;
        listing.asset.charms = charms;
      }
    }
  }

  return listings;
};

// also adds name tags
const addStickers = () => {
  if (appID === steamApps.CSGO.appID && !isCommodityItem) {
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
    // if there are no listings the listings variable is an empty array
    // if there are listings it's an object
    if (!isCommodityItem && listings.length === undefined) {
      const showStickerHolder = !csgoFloatExtPresent()
        ? ''
        : 'hidden';
      document.getElementById('searchResultsRows').querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(
        (listingRow) => {
          if (listingRow.parentNode.id !== 'tabContentsMyActiveMarketListingsRows' && listingRow.parentNode.parentNode.id !== 'tabContentsMyListings') {
            const listingID = getListingIDFromElement(listingRow);
            const nameTag = listings[listingID].asset.fraudwarnings
              ? listings[listingID].asset.fraudwarnings[0]
              : '';

            if (listingRow.querySelector('.stickerHolderMarket') === null) { // if stickers elements not added already
              const nameBlock = listingRow.querySelector('.market_listing_item_name_block');
              nameBlock.classList.add('extension__row');
              nameBlock.insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(`<div class="stickerHolderMarket ${showStickerHolder}" id="stickerHolder_${listingID}"></div>`),
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

            if (listingRow.querySelector('.customNameTag') === null
              && nameTag !== '') {
              listingRow.querySelector('.extension__row').insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(`<div class="customNameTag" style="color: var(--steam-nametag-red);" id="customNameTag_${listingID}">${nameTag}</div>`),
              );
            }

            if (listingRow.querySelector('#inspectInBrowser') === null) {
              const inspectInGameButton = listingRow.querySelector('div.market_listing_row_action');
              if (inspectInGameButton) {
                const inspectLink = inspectInGameButton.querySelector('a').getAttribute('href');

                inspectInGameButton.style['margin-top'] = '10px';
                inspectInGameButton.style['margin-bottom'] = '10px';
                inspectInGameButton.style['line-height'] = '15px';
                inspectInGameButton.style['text-align'] = 'left';

                inspectInGameButton.insertAdjacentHTML(
                  'afterend',
                  DOMPurify.sanitize(
                    `<div class="market_listing_row_action" id="inspectInBrowser" style="line-height: 50px; text-align: left">
                      <a href="https://swap.gg/screenshot?inspectLink=${inspectLink}" target="_blank">
                        Inspect in Browser...
                      </a>
                    </div>
                    <div class="market_listing_row_action" id="inspectOnServer" style="line-height: 30px; text-align: left">
                      <a href="https://www.cs2inspects.com/?apply=${inspectLink}" target="_blank">
                        Inspect on Server...
                      </a>
                    </div>`,
                    { ADD_ATTR: ['target'] },
                  ));
              }
            }
          }
        },
      );
    }
  }
};

const populateFloatInfo = (listingID, floatInfo) => {
  const listingElement = getElementByListingID(listingID);

  // if for example the user has changed page and the listing is not there anymore
  if (listingElement !== null) {
    // Ensure float bar skeleton is present before populating
    const nameBlock = listingElement.querySelector('.market_listing_item_name_block');
    if (nameBlock && !nameBlock.querySelector('.floatBarMarket')) {
      nameBlock.insertAdjacentHTML('beforeend', DOMPurify.sanitize(getFloatBarSkeleton('market')));
      nameBlock.setAttribute('data-floatBar-added', 'true');
      // Add show technical toggle logic if needed
      const showTechnicalBtn = nameBlock.querySelector('.showTechnical');
      if (showTechnicalBtn) {
        showTechnicalBtn.addEventListener('click', (event) => {
          event.target.parentNode.querySelector('.floatTechnical').classList.toggle('hidden');
        });
      }
    }

    chrome.storage.local.get([
      'marketShowFloatValuesOnly', 'marketAlwaysShowFloatTechnical', 'numberOfFloatDigitsToShow',
    ],
    ({ marketShowFloatValuesOnly, marketAlwaysShowFloatTechnical, numberOfFloatDigitsToShow }) => {
      if (!marketShowFloatValuesOnly) {
        const floatTechnical = listingElement.querySelector('.floatTechnical');
        if (floatTechnical !== null) {
          if (floatInfo === undefined || floatInfo.floatvalue === 0) {
            // agents don't have float values yet they sometimes return float info, weird
            listingElement.querySelector('.floatBarMarket').remove();
          } else if (floatInfo) {
            floatTechnical.innerHTML = DOMPurify.sanitize(getDataFilledFloatTechnical(floatInfo), { ADD_ATTR: ['target'] });
            const position = (parseFloat(
              getFloatAsFormattedString(floatInfo.floatvalue, 2),
            ) * 100) - 2;
            listingElement.querySelector('.floatToolTip').setAttribute('style', `left: ${position}%`);
            listingElement.querySelector('.floatDropTarget').innerText = getFloatAsFormattedString(floatInfo.floatvalue, numberOfFloatDigitsToShow);

            if (marketAlwaysShowFloatTechnical) floatTechnical.classList.remove('hidden');
          }
        }
      } else if (floatInfo) {
        const itemImageDiv = listingElement.querySelector('.market_listing_item_img_container');
        if (itemImageDiv !== null) {
          itemImageDiv.querySelector('img').insertAdjacentHTML(
            'afterend',
            DOMPurify.sanitize(
              `<span class="marketFloatOnly">
                        ${getFloatAsFormattedString(floatInfo.floatvalue, 6)}
                   </span>`,
            ),
          );
        }
      }

      if (floatInfo) {
        listingElement.setAttribute('data-float', floatInfo.floatvalue);
        listingElement.setAttribute('data-paintindex', floatInfo.paintindex);
        listingElement.setAttribute('data-paintseed', floatInfo.paintseed);
      }
    });
  }
};

// sticker wear to sticker icon tooltip
const setStickerInfo = (listingID, stickers) => {
  if (stickers !== null) {
    chrome.storage.local.get(['prices', 'pricingProvider', 'pricingMode', 'exchangeRate', 'currency'],
      ({
        prices, pricingProvider, pricingMode, exchangeRate, currency,
      }) => {
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
              prices,
              pricingProvider,
              pricingMode,
              exchangeRate,
              currency,
            );

            stickerInfo.price = stickerPrice;
            if (currentSticker) {
              currentSticker.setAttribute(
                'data-tooltip-market',
                `${stickerInfo.name} (${stickerPrice.display}) - Condition: ${wear}%`,
              );
              currentSticker.querySelector('img').setAttribute(
                'style',
                `opacity: ${(wear > 10) ? wear / 100 : (wear / 100) + 0.1}`,
              );
            }
          });

          const stickersTotalPrice = getStickerPriceTotal(stickers, currency);
          listingElement.setAttribute(
            'data-sticker-price',
            stickersTotalPrice === null
              ? '0.0'
              : stickersTotalPrice.price.toString(),
          );

          const stickersTotalElement = listingElement.querySelector('.stickersTotal');
          if (stickersTotalElement !== null) {
            stickersTotalElement.innerText = stickersTotalPrice === null ? '' : stickersTotalPrice.display;
          }
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

  if (floatInfo !== undefined) {
    setStickerInfo(job.listingID, floatInfo.stickers);
    addPatterns(job.listingID, floatInfo);

    // const genCommand = generateInspectCommand(
    //   fullName, floatInfo.floatvalue, floatInfo.paintindex,
    //   floatInfo.defindex, floatInfo.paintseed, floatInfo.stickers,
    // );

    // if (job.type === 'market') {
    //   const originalInspectButton = actions.querySelector('.btn_small.btn_grey_white_innerfade');

    //   if (originalInspectButton && job.inspectLink === originalInspectButton.getAttribute('href')) {
    //     const inspectGenCommandEl = document.querySelector('.inspectGenCommand');
    //     inspectGenCommandEl.title = 'Click to copy !gen command';

    //     if (genCommand.includes('undefined')) {
    //       // defindex was not used/stored before the inspect on server feature was introduced
    //       // and it might not exists in the data stored in the float cache
    //       // if that is the case then we clear it from cache
    //       removeFromFloatCache(job.assetID);

    //       // ugly timeout to get around making removeFromFloatCache async
    //       setTimeout(() => {
    //         floatQueue.jobs.push({
    //           type: 'market',
    //           assetID: job.assetID,
    //           inspectLink: job.inspectLink,
    //           // they call each other and one of them has to be defined first
    //           // eslint-disable-next-line no-use-before-define
    //           callBackFunction: dealWithNewFloatData,
    //         });

    //         if (!floatQueue.active) workOnFloatQueue();
    //       }, 1000);
    //     } else inspectGenCommandEl.textContent = genCommand;
    //     inspectGenCommandEl.setAttribute('genCommand', genCommand);
    //   }
    // }
    // else if (job.type === 'market_per_listing_gencommand') {
    //   const listingRow = getElementByListingID(job.listingID);

    //   if (listingRow) {
    //     const inspectGenCommandEl = listingRow.querySelector('.inspectGenCommandListing');
    //     inspectGenCommandEl.title = 'Click to copy !gen command';

    //     if (genCommand.includes('undefined')) {
    //       // defindex was not used/stored before the inspect on server feature was introduced
    //       // and it might not exists in the data stored in the float cache
    //       // if that is the case then we clear it from cache
    //       removeFromFloatCache(job.assetID);

    //       // ugly timeout to get around making removeFromFloatCache async
    //       setTimeout(() => {
    //         floatQueue.jobs.push({
    //           type: 'market_per_listing_gencommand',
    //           assetID: job.assetID,
    //           inspectLink: job.inspectLink,
    //           // they call each other and one of them has to be defined first
    //           // eslint-disable-next-line no-use-before-define
    //           callBackFunction: dealWithNewFloatData,
    //         });

    //         if (!floatQueue.active) workOnFloatQueue();
    //       }, 1000);
    //     } else inspectGenCommandEl.textContent = genCommand;
    //     inspectGenCommandEl.setAttribute('genCommand', genCommand);
    //   }
    // }
  }
};

const dealWithNewFloatData = (job, floatInfo) => {
  if (floatInfo !== 'nofloat') {
    addFloatDataToPage(job, floatInfo);
  }
};

const addListingsToFloatQueue = () => {
  if (appID === steamApps.CSGO.appID && !isCommodityItem) {
    chrome.storage.local.get(['autoFloatMarket'], ({ autoFloatMarket }) => {
      if (autoFloatMarket && !csgoFloatExtPresent()) {
        const listings = getListings();
        for (const listing of Object.values(listings)) {
          const listingRow = getElementByListingID(listing.listingid);
          if (listingRow.getAttribute('data-float') === null) {
            listingRow.setAttribute('data-float', '1.0');
            const assetID = listing.asset.id;

            const price = listing.converted_price + listing.converted_fee;

            floatQueue.jobs.push({
              type: 'market',
              assetID,
              inspectLink: listing.asset.actions[0].link.replace('%assetid%', assetID),
              listingID: listing.listingid,
              price,
              currencyid: listing.currencyid,
              callBackFunction: dealWithNewFloatData,
            });
          }
        }
        if (!floatQueue.active) workOnFloatQueue();
      }
    });
  }
};

const sortListings = (sortingMode) => {
  const listingElements = [...document.getElementById('searchResultsTable')
    .querySelectorAll('.market_listing_row.market_recent_listing_row')];
  const listingsData = getListings();
  let sortedElements = [];

  if (sortingMode === listingsSortingModes.price_asc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const priceOfA = parseInt(listingsData[getListingIDFromElement(a)].converted_price);
      const priceOfB = parseInt(listingsData[getListingIDFromElement(b)].converted_price);
      return priceOfA - priceOfB;
    });
  } else if (sortingMode === listingsSortingModes.price_desc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const priceOfA = parseInt(listingsData[getListingIDFromElement(a)].converted_price);
      const priceOfB = parseInt(listingsData[getListingIDFromElement(b)].converted_price);
      return priceOfB - priceOfA;
    });
  } else if (sortingMode === listingsSortingModes.float_asc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const floatOfA = parseFloat(a.getAttribute('data-float'));
      const floatOfB = parseFloat(b.getAttribute('data-float'));
      return floatOfA - floatOfB;
    });
  } else if (sortingMode === listingsSortingModes.float_desc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const floatOfA = parseFloat(a.getAttribute('data-float'));
      const floatOfB = parseFloat(b.getAttribute('data-float'));
      return floatOfB - floatOfA;
    });
  } else if (sortingMode === listingsSortingModes.paint_index_asc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const paintIndexOfA = parseInt(a.getAttribute('data-paintindex'));
      const paintIndexOfB = parseInt(b.getAttribute('data-paintindex'));
      return paintIndexOfA - paintIndexOfB;
    });
  } else if (sortingMode === listingsSortingModes.paint_index_desc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const paintIndexOfA = parseInt(a.getAttribute('data-paintindex'));
      const paintIndexOfB = parseInt(b.getAttribute('data-paintindex'));
      return paintIndexOfB - paintIndexOfA;
    });
  } else if (sortingMode === listingsSortingModes.paint_seed_asc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const paintSeedOfA = parseInt(a.getAttribute('data-paintseed'));
      const paintSeedOfB = parseInt(b.getAttribute('data-paintseed'));
      return paintSeedOfA - paintSeedOfB;
    });
  } else if (sortingMode === listingsSortingModes.paint_seed_desc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const paintSeedOfA = parseInt(a.getAttribute('data-paintseed'));
      const paintSeedOfB = parseInt(b.getAttribute('data-paintseed'));
      return paintSeedOfB - paintSeedOfA;
    });
  } else if (sortingMode === listingsSortingModes.sticker_price_asc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const stickerPriceOfA = a.getAttribute('data-sticker-price') !== 'null' && a.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(a.getAttribute('data-sticker-price'))
        : 0.0;
      const stickerPriceOfB = b.getAttribute('data-sticker-price') !== 'null' && b.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(b.getAttribute('data-sticker-price'))
        : 0.0;
      return stickerPriceOfA - stickerPriceOfB;
    });
  } else if (sortingMode === listingsSortingModes.sticker_price_desc.key) {
    sortedElements = listingElements.sort((a, b) => {
      const stickerPriceOfA = a.getAttribute('data-sticker-price') !== 'null' && a.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(a.getAttribute('data-sticker-price'))
        : 0.0;
      const stickerPriceOfB = b.getAttribute('data-sticker-price') !== 'null' && b.getAttribute('data-sticker-price') !== undefined
        ? parseFloat(b.getAttribute('data-sticker-price'))
        : 0.0;
      return stickerPriceOfB - stickerPriceOfA;
    });
  } else if (sortingMode === listingsSortingModes.default.key) {
    sortedElements = listingElements.sort((a, b) => {
      const positionOfA = Object.keys(listingsData).indexOf(getListingIDFromElement(a));
      const positionOfB = Object.keys(listingsData).indexOf(getListingIDFromElement(b));
      return positionOfA - positionOfB;
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
  if (!isCommodityItem) {
    chrome.storage.local.get('marketOriginalPrice', ({ marketOriginalPrice }) => {
      if (marketOriginalPrice) {
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
                        
                        if (originalPriceElement !== null && originalPriceElement.getAttribute('data-converted') === 'false') {
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
  }
};

const getBuyerKYCFromPage = () => {
  const type = isCommodityItem ? '' : '_buynow';
  const stateEl = document.getElementById(`billing_state${type}`);
  const firstNameEl = document.getElementById(`first_name${type}`);
  const lastNameEl = document.getElementById(`last_name${type}`);
  const billingAddressEl = document.getElementById(`billing_address${type}`);
  const billingAddress2El = document.getElementById(`billing_address_two${type}`);
  const countryEl = document.getElementById(`billing_country${type}`);
  const cityEl = document.getElementById(`billing_city${type}`);
  const postalEl = document.getElementById(`billing_postal_code${type}`);

  return {
    first_name: firstNameEl !== null ? encodeURIComponent(firstNameEl.value) : '',
    last_name: lastNameEl !== null ? encodeURIComponent(lastNameEl.value) : '',
    billing_address: billingAddressEl !== null ? encodeURIComponent(billingAddressEl.value) : '',
    billing_address_two: billingAddress2El !== null ? encodeURIComponent(billingAddress2El.value) : '',
    billing_country: countryEl !== null ? encodeURIComponent(countryEl.value) : '',
    billing_city: cityEl !== null ? encodeURIComponent(cityEl.value) : '',
    billing_state: stateEl !== null ? encodeURIComponent(stateEl.value) : '',
    billing_postal_code: postalEl !== null ? encodeURIComponent(postalEl.value) : '',
  };
};

const addInstantBuyButtons = () => {
  chrome.storage.local.get('marketListingsInstantBuy', ({ marketListingsInstantBuy }) => {
    if (marketListingsInstantBuy && !isCommodityItem) {
      const listings = getListings();
      // if it's not an empty array but an object
      if (listings.length === undefined) {
        const listingsSection = document.getElementById('searchResultsRows');
        listingsSection.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(
          (listingRow) => {
            if (listingRow.parentNode.id !== 'tabContentsMyActiveMarketListingsRows'
              && listingRow.parentNode.parentNode.id !== 'tabContentsMyListings') {
              const listingID = getListingIDFromElement(listingRow);

              if (listingRow.querySelector('.instantBuy') === null) { // if not added before
                const buyButton = listingRow.querySelector('.market_listing_buy_button');
                // for example it's our listing, then there is no buy button but a remove button
                if (buyButton !== null) {
                  buyButton.parentElement.style['line-height'] = '30px';
                  buyButton.insertAdjacentHTML(
                    'afterend',
                    DOMPurify.sanitize(
                      `<div class="instantBuy">
                          <a class="item_market_action_button btn_green_white_innerfade btn_small">
                            <span title="Buy this item with one click (no purchase dialog)">
                              Instant Buy
                           </span>
                          </a>
                        </div>`,
                    ),
                  );

                  const instaBuyEl = listingRow.querySelector('.instantBuy');
                  instaBuyEl.addEventListener('click', () => {
                    buyListing(listings[listingID], getBuyerKYCFromPage()).then(() => {
                      listingRow.querySelector('.market_listing_action_buttons').innerText = 'Purchased';
                    }).catch((err) => {
                      console.log(err);
                      instaBuyEl.innerText = 'Error purchasing!';
                      instaBuyEl.style.color = 'red';
                    });
                  });
                }
              }
            }
          },
        );
      }
    }
  });
};

const highlightSeen = () => {
  const seenStorageKey = `seen_listings_${appID}_${fullName}`;
  chrome.storage.local.get(['highlightSeenListings', seenStorageKey], (result) => {
    if (result.highlightSeenListings && !isCommodityItem) {
      const highlighted = result[seenStorageKey] !== undefined ? result[seenStorageKey] : {};
      const listings = getListings();
      const firstTimeSeenListings = [];
      // if it's not an empty array but an object
      if (listings.length === undefined) {
        const listingsSection = document.getElementById('searchResultsRows');
        listingsSection.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach(
          (listingRow) => {
            if (listingRow.parentNode.id !== 'tabContentsMyActiveMarketListingsRows'
              && listingRow.parentNode.parentNode.id !== 'tabContentsMyListings') {
              if (listingRow.getAttribute('data-highlightseen') === null) { // if not processed yet
                const listingID = getListingIDFromElement(listingRow);
                if (highlighted[listingID] !== undefined) {
                  if (Date.now() > highlighted[listingID] + 60000) {
                    listingRow.style['background-color'] = '#4e1d4e';
                  }
                } else firstTimeSeenListings.push(listingID);
              }
            }
          },
        );

        firstTimeSeenListings.forEach((listingID) => {
          highlighted[listingID] = Date.now();
        });

        chrome.storage.local.set({ [seenStorageKey]: highlighted }, () => { });
      }
    }
  });
};

const getNameID = () => {
  return document.querySelector('body').innerHTML.split('Market_LoadOrderSpread( ')[1].split(' ')[0];
};

const showAllOrders = (type) => {
  loadItemOrderHistogram(getNameID()).then((histogramResponse) => {
    const graphData = histogramResponse[`${type}_order_graph`];

    for (let i = 0; i < graphData.length; i += 1) {
      let sum = 0;

      for (let x = 0; x < i; x += 1) {
        sum += graphData[x][1];
      }
      graphData[i][1] -= sum;
    }

    let tableRows = '<tr><th align="right">Price</th><th align="right">Quantity</th></tr>';

    graphData.forEach((row) => {
      tableRows += `<tr>
            <td align="right">
                ${histogramResponse.price_prefix}${row[0]}${histogramResponse.price_suffix}
            </td>
            <td align="right">
                ${row[1]}
            </td>
        </tr>`;
    });

    document.getElementById(`show_more_${type}`).outerHTML = DOMPurify.sanitize(
      `
              <table class="market_commodity_orders_table">
                  ${tableRows}
              </table>`,
    );

    document.getElementById('market_commodity_buyreqeusts_table').remove();
  });
};

const getContextIDFromPage = () => {
  let contextID = 2;

  document.querySelectorAll('script').forEach((scriptEl) => {
    if (scriptEl.textContent.includes('g_rgAppContextData =')) {
      contextID = scriptEl.textContent.split('"contextid":"')[1].split('"')[0];
    }
  });

  return contextID;
};

const addPerListingStuff = (marketEnhanceStickers) => {
  addPhasesIndicator();
  if (marketEnhanceStickers) addStickers();
  addListingsToFloatQueue();
  addPricesInOtherCurrencies();
  addInstantBuyButtons();
  highlightSeen();
};

floatQueue.cleanupFunction = () => {
  sortListings(document.getElementById('sortSelect').value);
};

logExtensionPresence();
refreshSteamAccessToken();
updateWalletCurrency();
updateLoggedInUserInfo();
updateLoggedInUserName();
addUpdatedRibbon();
changePageTitle('market_listing', fullName);
overrideCreatePriceHistoryGraph();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();

const descriptor = document.getElementById('largeiteminfo_item_descriptors');

if (appID === steamApps.CSGO.appID) {
  if (descriptor !== null) {
    descriptor.insertAdjacentHTML('beforeend', DOMPurify.sanitize(
      `<div class="descriptor">
          <a href="${getBuffLink(fullName)}">Lookup item on Buff</a>
       </div>`,
      { ADD_ATTR: ['target'] },
    ));

    if (fullName.split('(')[1] !== undefined) {
      descriptor.insertAdjacentHTML('beforeend', DOMPurify.sanitize(
        `<div class="descriptor otherExteriors">
                <span>${chrome.i18n.getMessage('links_to_other_exteriors')}:</span>
                <ul>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Factory%20New%29`}" target="_blank">${exteriors.factory_new.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Factory%20New%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.factory_new.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Minimal%20Wear%29`}"" target="_blank">${exteriors.minimal_wear.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Minimal%20Wear%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.minimal_wear.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Field-Tested%29`}"" target="_blank">${exteriors.field_tested.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Field-Tested%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.field_tested.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Well-Worn%29`}"" target="_blank">${exteriors.well_worn.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Well-Worn%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.well_worn.localized_name}</span></a></li>
                    <li><a href="${`${genericMarketLink + star + weaponName}%28Battle-Scarred%29`}"" target="_blank">${exteriors.battle_scarred.localized_name}</a> - <a href="${genericMarketLink + linkMidPart + weaponName}%28Battle-Scarred%29" target="_blank"><span class="${stOrSvClass} exteriorsLink">${stOrSv} ${exteriors.battle_scarred.localized_name}</span></a></li>
                </ul>
                <span>${chrome.i18n.getMessage('not_every_available')}</span>
            </div>`,
        { ADD_ATTR: ['target'] },
      ));
    }
  }
}

if (isCommodityItem) {
  const contextID = getContextIDFromPage();
  descriptor.insertAdjacentHTML('beforeend', DOMPurify.sanitize(
    `<div class="descriptor multiSell">
                <a href="https://steamcommunity.com/market/multisell?appid=${appID}&contextid=${contextID}&items%5B%5D=${encodeURIComponent(fullName)}&qty%5B%5D=250">Open multi-sell page.</a>
            </div>`,
    { ADD_ATTR: ['target'] },
  ));
}

// adds sorting menu to market pages with individual listings
const searchBar = document.querySelector('.market_listing_filter_contents');
if (searchBar !== null) {
  searchBar.insertAdjacentHTML('beforeend',
    DOMPurify.sanitize(
      `<div class="market_sorting">
             <span class="market_listing_filter_searchhint">Sort on page by:</span>
             <select id="sortSelect">
              
             </select>
           </div>`,
    ));

  const sortingSelect = document.getElementById('sortSelect');
  for (const mode of Object.values(listingsSortingModes)) {
    const option = document.createElement('option');
    option.value = mode.key;
    option.innerText = mode.name;
    sortingSelect.insertAdjacentElement('beforeend', option);
  }

  chrome.storage.local.get('marketListingsDefaultSorting', ({ marketListingsDefaultSorting }) => {
    sortingSelect.value = marketListingsDefaultSorting;
    sortListings(marketListingsDefaultSorting);
    sortingSelect.addEventListener(
      'change',
      () => {
        sortListings(sortingSelect.value);
      },
    );
  });
}

// adds custom buy order buttons/inputs
const buyOrderInfoEl = isCommodityItem === true
  ? document.getElementById('market_activity_section')
  : document.getElementById('market_buyorder_info');

if (buyOrderInfoEl !== null) {
  buyOrderInfoEl.firstElementChild.insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(`
        <div style="float: right; padding-right: 10px; color: white">
            <a id="place_highest_order" class="btn_green_white_innerfade btn_medium market_noncommodity_buyorder_button" style="margin-right: 5px">
            <span>Place highest order</span>
            </a>
            <a id="quick_place_order" class="btn_green_white_innerfade btn_medium market_noncommodity_buyorder_button" style="margin-right: 5px">
            <span>Quick-place order</span>
            </a>
            Price:
            <input type="text" id="quick_order_price" style="width: 30px; margin-right: 5px"/>
            Quantity:
            <input type="number" value="1" id="quick_order_qt" style="width: 30px; margin-right: 5px"/>
        </div>
    `),
  );

  // repositions expandable details so it does not overlap with the custom buttons
  if (!isCommodityItem) {
    document.getElementById('market_buyorder_info_details').style['margin-top'] = '45px';
  } else {
    const recentActivityEl = document.getElementById('market_activity_block');
    if (recentActivityEl !== null) {
      recentActivityEl.style.overflow = 'visible';
      recentActivityEl.style['margin-top'] = '20px';
    }
  }

  document.getElementById('place_highest_order').addEventListener('click', () => {
    getHighestBuyOrder(appID, fullName).then((highestOrder) => {
      createOrder(
        appID,
        fullName,
        parseInt(highestOrder) + 1,
        1,
        getBuyerKYCFromPage(),
      ).then(() => {
        window.location.reload();
      }).catch((err) => {
        console.log(err);
        buyOrderInfoEl.insertAdjacentHTML(
          'beforeend',
          `<div class="marketListingBuyOrderError">${err}</div>`,
        );
      });
    });
  });

  document.getElementById('quick_place_order').addEventListener('click', () => {
    const quantity = parseInt(document.getElementById('quick_order_qt').value);
    const pricePerItem = parseInt(steamFormattedPriceToCents(document.getElementById('quick_order_price').value));

    createOrder(
      appID,
      fullName,
      pricePerItem,
      quantity,
      getBuyerKYCFromPage(),
    ).then(() => {
      window.location.reload();
    }).catch((err) => {
      console.log(err);
      buyOrderInfoEl.insertAdjacentHTML(
        'beforeend',
        `<div class="marketListingBuyOrderError">${err}</div>`,
      );
    });
  });
}

// remove all listings button when there are listings
const myACtiveListingsEl = document.getElementById('tabContentsMyActiveMarketListingsRows');
if (myACtiveListingsEl) {
  const removeColumnHeader = document.querySelector('span.market_listing_right_cell.market_listing_edit_buttons.placeholder');
  removeColumnHeader.classList.add('clickable');
  removeColumnHeader.textContent = 'REMOVE ALL';

  removeColumnHeader.addEventListener('click', () => {
    const listingIDsToRemove = [];

    myACtiveListingsEl.querySelectorAll('.market_listing_row.market_recent_listing_row').forEach((activeListingRow) => {
      listingIDsToRemove.push(getMyListingIDFromElement(activeListingRow));
    });

    const removeListingsInterval = setInterval(() => {
      if (listingIDsToRemove.length > 0) {
        const listingToRemove = listingIDsToRemove.pop();

        removeListing(listingToRemove).then(
          () => {
            getElementByMyListingID(listingToRemove).remove();
          },
        );
      } else clearInterval(removeListingsInterval);
    }, 1000);
  });
}

// show all orders
const buyOrdersDiv = document.getElementById('market_commodity_buyreqeusts_table');

const buyOrderShowAll = isCommodityItem
  ? '<div id="show_more_buy" class="btn_grey_black btn_medium"><span>Show All</span></div>'
  : '<div style="text-align: center;"><div id="show_more_buy" class="btn_grey_black btn_medium"><span>Show All</span></div></div>';
if (buyOrdersDiv) buyOrdersDiv.insertAdjacentHTML('afterend', buyOrderShowAll);

const showMoreBuy = document.getElementById('show_more_buy');

if (showMoreBuy) {
  showMoreBuy.addEventListener('click', () => {
    showAllOrders('buy');
  });
}

// only commodity items have sell orders
if (isCommodityItem) {
  const sellOrdersDiv = document.getElementById('market_commodity_forsale_table');
  sellOrdersDiv.insertAdjacentHTML('afterend', '<div id="show_more_sell" class="btn_grey_black btn_medium"><span>Show All</span></div>');

  document.getElementById('show_more_sell').addEventListener('click', () => {
    showAllOrders('sell');
  });

  // makes container items into market search links
  if (fullName.includes('Case') || fullName.includes('Capsule') || capsuleNamesWithNoCapsuleInName.includes(fullName)) {
    const descriptors = document.getElementById('largeiteminfo_item_descriptors');
    if (descriptors !== null) {
      const qualityRBGS = [
        'rgb(75, 105, 255)',
        'rgb(136, 71, 255)',
        'rgb(211, 44, 230)',
        'rgb(235, 75, 75)',
      ];

      descriptors.querySelectorAll('.descriptor').forEach((descriptorEl) => {
        if (descriptorEl.style !== '' && qualityRBGS.includes(descriptorEl.style.color)) {
          const itemName = descriptorEl.innerText;
          descriptorEl.innerHTML = DOMPurify.sanitize(
            `<a href="https://steamcommunity.com/market/search?q=${itemName}&appid=730" style="color: ${descriptorEl.style.color}">
                    ${itemName}
                  </a>`,
          );
        }
      });
    }
  } else if (fullName.includes('Sticker')) {
    const descriptors = document.getElementById('largeiteminfo_item_descriptors');
    if (descriptors !== null) {
      descriptors.insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(
          `<a href="https://steamcommunity.com/market/search?q=${fullName.split('Sticker | ')[1]}&appid=730">
                    Look up similar stickers
                </a>`,
        ),
      );
    }
  }
} else {
  // adds "buy and sell orders" chart to non-commodity items
  chrome.storage.local.get(
    ['marketShowBuySellNonCommodity', 'marketShowRecentActivityNonCommodity'],
    ({ marketShowBuySellNonCommodity, marketShowRecentActivityNonCommodity }) => {
      const listingItemInfoEl = document.querySelector('.market_listing_iteminfo');
      const myListingsEl = document.getElementById('myListings');
      if (listingItemInfoEl !== null && myListingsEl !== null) {
        if (marketShowBuySellNonCommodity) {
          listingItemInfoEl.insertAdjacentHTML('beforeend', '<div id="orders_histogram" style="margin-top:20px"></div>');
        }

        if (marketShowRecentActivityNonCommodity) {
          myListingsEl.insertAdjacentHTML(
            'beforebegin',
            `
                <hr>
                <div id="market_activity_section">
                    <h3 class="market_activity_header">Recent activity</h3>
                    <div id="market_activity_block">
                        <div id="market_activity_waiting_text">Waiting for new activity...</div>
                    </div>
                </div>`,
          );
        }

        if (marketShowBuySellNonCommodity || marketShowRecentActivityNonCommodity) {
          const startTickerScript = `ItemActivityTicker.Start(${getNameID()});`;
          injectScript(startTickerScript, false, 'startTicker', false);
        }
      }
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

chrome.storage.local.get(['showRealMoneySiteLinks'], ({ showRealMoneySiteLinks }) => {
  if (showRealMoneySiteLinks
    && (appID === steamApps.CSGO.appID || appID === steamApps.DOTA2.appID
      || appID === steamApps.TF2.appID || appID === steamApps.RUST.appID
      || appID === steamApps.Z1.appID)) {
    const elementToInsertTo = isCommodityItem
      ? document.querySelector('.market_commodity_order_block')
      : document.getElementById('largeiteminfo_warning');

    if (elementToInsertTo !== null) {
      elementToInsertTo.insertAdjacentHTML(
        'beforebegin',
        `<div>
                <span class="realMoneyMarketTitle">You can save money (20-35%) by buying this item on one of these trusted markets for "real money":</span>
                <div class="realMoneySites">
                  <div class="realMoneySite">
                    <a href="https://skinport.com/market/${appID}?search=${fullName}&r=gery" target="_blank" class="realMoneySiteLink referralLink" data-site="Skinport">
                    <img alt="Skinport logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinport.png')}" data-site="skinport">
                      <br>
                      Skinport.com
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://csfloat.com/search?market_hash_name=${fullName}&ref=gerytrading" target="_blank" class="realMoneySiteLink referralLink" data-site="csfloat">
                        <img alt="CSFloat logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/csgofloat.png')}" data-site="csfloat">
                        <br>
                        CSFloat Market
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://buff.market/r/U1093423730" target="_blank" class="realMoneySiteLink referralLink" data-site="buffmarket">
                        <img alt="Buff Market logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/buffmarket.png')}" data-site="buffmarket">
                        <br>
                        BUFF.MARKET
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://itrade.gg/trade/csgo?search=${fullName}&ref=gery" target="_blank" class="realMoneySiteLink referralLink" data-site="itradegg">
                        <img alt="iTrade.gg logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/itradegg.png')}" data-site="itradegg">
                        <br>
                        iTrade.gg
                    </a>
                  </div>
                </div>
                <div class="realMoneySites">
                 <div class="realMoneySite">
                    <a href="https://cs.money/csgo/trade/?utm_source=mediabuy&utm_medium=cstrade&utm_campaign=cstrd0920&utm_content=link&search=${weaponName}${isVanillaKnife ? ' vanilla' : ''}&sort=price&order=asc&isStatTrak=${isStattrak}&isSouvenir=${isSouvenir}" target="_blank" class="realMoneySiteLink referralLink" data-site="csmoney">
                        <img alt="Csmoney logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/csmoney.png')}" data-site="csmoney">
                        <br>
                        CS.MONEY
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://skinbaron.com/partner/gery" target="_blank" class="realMoneySiteLink referralLink" data-site="skinbaron">
                        <img alt="Skinbaron logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinbaron.png')}" data-site="skinbaron">
                        <br>
                        Skinbaron.com
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://gamerpay.gg/partner/okn9go3r" target="_blank" class="realMoneySiteLink referralLink" data-site="gamerpay">
                        <img alt="GamerPay logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/gamerpay.png')}" data-site="gamerpay">
                        <br>
                        GamerPay.gg
                    </a>
                  </div>
                </div>
                <div class="realMoneySites">
                  <div class="realMoneySite">
                    <a href="https://tradeit.gg/?aff=gery" target="_blank" class="realMoneySiteLink referralLink" data-site="tradeit">
                        <img alt="Tradeit logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/tradeit.png')}" data-site="tradeit">
                        <br>
                        TRADEIT.GG
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://cs.trade/trade/ref/CSGOTRADERAPP" target="_blank" class="realMoneySiteLink referralLink" data-site="cstrade">
                        <img alt="CS.TRADE logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/cstrade.png')}" data-site="cstrade">
                        <br>
                        CS.TRADE
                    </a>
                  </div>
                  <div class="realMoneySite">
                    <a href="https://cs.money/market/buy/?utm_source=mediabuy&utm_medium=cstrade&utm_campaign=market&utm_content=link&search=${weaponName}${isVanillaKnife ? ' vanilla' : ''}&isStatTrak=${isStattrak}&isSouvenir=${isSouvenir}&sort=price&order=asc" target="_blank" class="realMoneySiteLink referralLink" data-site="csmoney">
                        <img alt="Csmoney P2P logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/csmoneyp2p.png')}" data-site="csmoney">
                        <br>
                        CS.MONEY P2P
                    </a>
                  </div>
                </div>
                <div class="realMoneySites">
                    <div class="realMoneySite">
                      <a href="https://bitskins.com/market/csgo?ref_alias=csgotrader" target="_blank" class="realMoneySiteLink referralLink" data-site="bitskins">
                        <img alt="Bitskins logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/bitskins.png')}" data-site="bitskins">
                        <br>
                        Bitskins.com
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://dmarket.com/?ref=hJEDYLBTsV" target="_blank" class="realMoneySiteLink referralLink" data-site="dmarket">
                          <img alt="Dmarket logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/dmarket.png')}" data-site="dmarket">
                          <br>
                          DMARKET
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://waxpeer.com/r/gery" target="_blank" class="realMoneySiteLink referralLink" data-site="waxpeer">
                          <img alt="Waxpeer logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/waxpeer.png')}" data-site="waxpeer">
                          <br>
                          Waxpeer.com
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://skinbid.com/?ref=csgotrader" target="_blank" class="realMoneySiteLink referralLink" data-site="skinbid">
                          <img alt="SkinBid logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinbid.png')}" data-site="skinbid">
                          <br>
                          SkinBid
                      </a>
                    </div>
                  </div> 
                  <div class="realMoneySites">
                    <div class="realMoneySite">
                      <a href="https://skinvault.gg/en?aff=gery" target="_blank" class="realMoneySiteLink referralLink" data-site="skinvault">
                          <img alt="SkinVault logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinvault.png')}" data-site="skinvault">
                          <br>
                          SkinVault
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://skinswap.com/r/gery" target="_blank" class="realMoneySiteLink referralLink" data-site="skinswap">
                          <img alt="Skinswap logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinswap.png')}" data-site="skinswap">
                          <br>
                          SKINSWAP
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://csdeals.com/new/?ref=mwe3otc" target="_blank" class="realMoneySiteLink referralLink" data-site="csdeals">
                          <img alt="CS.DEALS logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/csdeals.png')}" data-site="csdeals">
                          <br>
                          CS.DEALS
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://skin.place/buy-cs2-skins/?search=${weaponName}&utm_campaign=cs2trader" target="_blank" class="realMoneySiteLink referralLink" data-site="skinplace">
                          <img alt="Skin.Place logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/skinplace.png')}" data-site="skinplace">
                          <br>
                          Skin.Place
                      </a>
                    </div>
                    <div class="realMoneySite">
                      <a href="https://white.market/item?appId=730&nameHash=${fullName}&ref=53cecef4a02f6fc1" target="_blank" class="realMoneySiteLink referralLink" data-site="whitemarket">
                          <img alt="White.Market logo" style="height: 50px" src="${chrome.runtime.getURL('images/external_logos/whitemarket.png')}" data-site="whitemarket">
                          <br>
                          White.Market
                      </a>
                    </div>
                </div>
                
                <div id="realMoneyExpand" class="clickable" title="Click to learn more about what this is">What is this?</div>
                <div id="realMoneyMoreInfo" class="hidden">
                    <div style="margin: 10px 0 10px 0">
                      <a href="https://skinport.com/market/730?r=gery" target="_blank" class="referralLink" data-site="skinport">Skinport</a>,
                      <a href="https://skinbaron.com/partner/gery" target="_blank" class="referralLink" data-site="skinbaron">Skinbaron</a>,
                      <a href="https://dmarket.com/?ref=hJEDYLBTsV" target="_blank" class="referralLink" data-site="dmarket">DMARKET</a>,
                      <a href="https://skinbid.com/?ref=csgotrader" target="_blank" class="referralLink" data-site="skinbid">SkinBid</a>,
                      <a href="https://skinvault.gg/en?aff=gery" target="_blank" class="referralLink" data-site="skinvault">SkinVault</a>,
                      <a href="https://itrade.gg/trade/csgo?search=${fullName}&ref=gery" target="_blank" class="referralLink" data-site="itradegg">ITRADE.GG</a>,
                      <a href="https://gamerpay.gg/partner/okn9go3r" target="_blank" class="referralLink" data-site="gamerpay">GamerPay</a>,
                      <a href="https://waxpeer.com/r/gery" target="_blank" class="referralLink" data-site="waxpeer">Waxpeer</a>,
                      <a href="https://buff.market/r/U1093423730" target="_blank" class="referralLink" data-site="buffmarket">BUFF.MARKET</a>,
                      <a href="https://csdeals.com/new/?ref=mwe3otc" target="_blank" class="referralLink" data-site="csdeals">CS.DEALS</a>,
                      <a href="https://p.skin.place/cs2trader" target="_blank" class="referralLink" data-site="skinplace">Skin.Place</a>,
                      <a href="https://white.market/item?appId=730&nameHash=${fullName}&ref=53cecef4a02f6fc1" target="_blank" class="referralLink" data-site="whitemarket">White.Market</a>,
                      <a href="bskn.co/?ref_alias=xcW4c_phcUc" target="_blank" class="referralLink" data-site="bitskins">Bitskins</a> and 
                      <a href="https://csfloat.com?ref=gerytrading" target="_blank" class="referralLink" data-site="csfloat">
                      CSFloat
                      </a>
                      are real money marketplaces where you can buy and sell skins. <br>
                      You can save money by buying items there instead of the market. <br>
                      <a href="https://skinport.com/market/${appID}?search=${fullName}&r=gery" target="_blank" class="referralLink" data-site="skinport">
                          Follow this link to check listings for his item on Skinport.com
                      </a>,
                      <a href="https://bitskins.com/market/csgo?ref_alias=csgotrader" target="_blank" class="referralLink" data-site="bitskins">
                          this one for Bitskins.com
                      </a>,
                      <a href="https://csfloat.com?ref=gerytrading" target="_blank" class="referralLink" data-site="csfloat">
                      this one and find your desired items on CSFloat's peer to peer market
                      </a>,
                      <a href="https://buff.market/r/U1093423730" target="_blank" class="referralLink" data-site="buffmarket">this one for BUFF.MARKET</a>,
                      <a href="https://gamerpay.gg/partner/okn9go3r" target="_blank" class="referralLink" data-site="gamerpay"> this one for GamerPay.gg</a>
                      or
                      <a href="https://skinbaron.com/partner/gery" target="_blank" class="referralLink" data-site="skinbaron">this one for Skinbaron</a>
                      You can also buy items for real money on
                      <a href="https://cs.money/csgo/trade/?utm_source=mediabuy&utm_medium=cstrade&utm_campaign=cstrd0920&utm_content=link&search=${weaponName}${isVanillaKnife ? ' vanilla' : ''}&sort=price&order=asc&isStatTrak=${isStattrak}&isSouvenir=${isSouvenir}&sort=price&order=asc" target="_blank" class="referralLink" data-site="csmoney">Csmoney</a>
                      and
                      <a href="https://tradeit.gg/?aff=gery" target="_blank" class="referralLink" data-site="tradeit">TRADEIT.GG</a>
                      as well as trade for them with your items.
                    </div>
                    <div>
                      This message was added by the CS2 Trader extension. using the above link to purchase something helps the development of the extension.
                      If you don't wish to see this message in the future you can go the options and turn the feature off.
                    </div>
                </div>
            </div>`,
      );

      document.getElementById('realMoneyExpand').addEventListener('click', () => {
        document.getElementById('realMoneyMoreInfo').classList.remove('hidden');
      });
    }
  }
});

chrome.storage.local.get(['numberOfListings', 'marketEnhanceStickers'], ({ numberOfListings, marketEnhanceStickers }) => {
  const numberOfListingsInt = parseInt(numberOfListings);
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(numberOfListingsInt) && numberOfListingsInt !== 10) {
    injectScriptAsFile('MarketPageSizeGoToPage', 'MarketPageSizeGoToPageScript', { numberOfListingsInt });
  } else addPerListingStuff(marketEnhanceStickers);

  let observerLastTriggered = Date.now() - 1001;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.target.id === 'searchResultsRows'
      && mutation.addedNodes.length > 0) {
        // to avoid executing this lots of times
        // at least a second has to pass since the last one
        if (Date.now() > observerLastTriggered + 1000) {
          addPerListingStuff(marketEnhanceStickers);
        }
        observerLastTriggered = Date.now();
      }
    }
  });

  const searchResultsRows = document.getElementById('searchResultsRows');
  if (searchResultsRows !== null) {
    observer.observe(searchResultsRows, {
      subtree: false,
      attributes: false,
      childList: true,
    });
  }

  // the csgofloat extension breaks seen listings highlighting,
  // this is a workaround to fix it with more retries
  if (csgoFloatExtPresent()) {
    let counter = 0;

    const overwriteFloatExtensionInterval = setInterval(() => {
      if (counter < 10) {
        counter += 1;
        highlightSeen();
      } else clearInterval(overwriteFloatExtensionInterval);
    }, 2000);
  }
});
