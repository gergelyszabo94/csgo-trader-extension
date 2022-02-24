import DOMPurify from 'dompurify';

import {
  addPageControlEventListeners, getItemByAssetID, changePageTitle,
  getAssetIDOfElement, makeItemColorful, addDopplerPhase,
  addSSTandExtIndicators, addFloatIndicator, addPriceIndicator,
  getDataFilledFloatTechnical, souvenirExists, copyToClipboard,
  getFloatBarSkeleton, addUpdatedRibbon, updateLoggedInUserName,
  logExtensionPresence, repositionNameTagIcons, csgoFloatExtPresent,
  updateLoggedInUserInfo, reloadPageOnExtensionReload, isSIHActive, getActivePage,
  addSearchListener, getPattern, removeFromArray, toFixedNoRounding,
}
  from 'utils/utilsModular';
import { getItemMarketLink, generateInspectCommand, isDopplerInName } from 'utils/simpleUtils';
import { getShortDate, dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import {
  stattrak, starChar, souvenir, stattrakPretty, genericMarketLink,
  inspectServerConnectLink, inspectServerConnectCommand,
} from 'utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import {
  getPriceOverview, getPriceAfterFees, userPriceToProperPrice,
  centsToSteamFormattedPrice, prettyPrintPrice, addRealTimePriceToPage,
  priceQueue, workOnPriceQueue, getSteamWalletCurrency, initPriceQueue,
  updateWalletCurrency, getHighestBuyOrder, getLowestListingPrice,
}
  from 'utils/pricing';
import { getItemByIDs, getIDsFromElement, findElementByIDs } from 'utils/itemsToElementsToItems';
import { listItem } from 'utils/market';
import { sortingModes } from 'utils/static/sortingModes';
import doTheSorting from 'utils/sorting';
import { overridePopulateActions, overRideCSGOInventoryLoading } from 'utils/steamOverriding';
import itemTypes from 'utils/static/itemTypes';
import exteriors from 'utils/static/exteriors';
import { injectScript } from 'utils/injection';
import { getUserSteamID } from 'utils/steamID';
import { inOtherOfferIndicator } from 'utils/static/miscElements';
import steamApps from 'utils/static/steamApps';
import { removeFromFloatCache } from '../../utils/floatCaching';

let items = [];
let inventoryTotal = 0.0;
// variables for the countdown recursive logic
let countingDown = false;
let countDownID = '';

const floatBar = getFloatBarSkeleton('inventory');
const upperModule = `
<div class="upperModule">
    <div class="nametag"></div>
    <div class="descriptor customStickers"></div>
    <div class="duplicate">x1</div>
    <div class="copyButtons"></div>
    ${floatBar}
    <div class="patternInfo"></div>
</div>
`;

const lowerModule = `<a class="lowerModule">
    <div class="descriptor tradability tradabilityDiv"></div>
    <div class="descriptor countdown"></div>
    <div class="descriptor tradability bookmark">Bookmark and Notify</div>
</a>`;

const tradable = '<span class="tradable">Tradable</span>';
const notTradable = '<span class="not_tradable">Not Tradable</span>';

const getInventoryOwnerID = () => {
  const inventoryOwnerIDScript = 'document.querySelector(\'body\').setAttribute(\'inventoryOwnerID\', UserYou.GetSteamId());';
  return injectScript(inventoryOwnerIDScript, true, 'inventoryOwnerID', 'inventoryOwnerID');
};

// gets the asset id of the item that is currently selected
const getAssetIDofActive = () => {
  return getAssetIDOfElement(document.querySelector('.activeInfo'));
};

const getIDsOfActiveItem = () => {
  return getIDsFromElement(document.querySelector('.activeInfo'), 'inventory');
};

const getDefaultContextID = (appID) => {
  // 2 is the default context for standard games
  // 6 is the community context for steam
  return appID === steamApps.STEAM.appID ? '6' : '2';
};

// works in inventory and profile pages
const isOwnInventory = () => {
  return getUserSteamID() === getInventoryOwnerID();
};

const getActiveInventoryAppID = () => {
  return document.querySelector('.games_list_tab.active').getAttribute('href').split('#')[1];
};

const cleanUpElements = () => {
  document.querySelectorAll(
    '.upperModule, .lowerModule, .inTradesInfoModule, .otherExteriors, .custom_name,.startingAtVolume,.marketActionInstantSell, .marketActionQuickSell, .listingError, .pricEmpireLink, .buffLink, .inspectOnServer, .CSGOSSTASHLink, .multiSellLink',
  ).forEach((element) => {
    element.remove();
  });
};

const addBookmark = (module) => {
  const IDs = getIDsOfActiveItem();
  const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
  const bookmark = {
    added: Date.now(),
    itemInfo: item,
    owner: getInventoryOwnerID(),
    comment: '',
    notify: true,
    notifTime: item.tradability.toString(),
    notifType: 'chrome',
  };

  chrome.storage.local.get('bookmarks', ({ bookmarks }) => {
    chrome.storage.local.set({ bookmarks: [...bookmarks, bookmark] }, () => {
      if (bookmark.itemInfo.tradability !== 'Tradable') {
        chrome.runtime.sendMessage({
          setAlarm: {
            name: `${bookmark.itemInfo.appid}_${bookmark.itemInfo.contextid}_${bookmark.itemInfo.assetid}_${bookmark.added}`,
            when: bookmark.itemInfo.tradability,
          },
        }, () => {});
      }

      chrome.runtime.sendMessage({
        openInternalPage: 'index.html?page=bookmarks',
      }, ({ openInternalPage }) => {
        if (openInternalPage === 'no_tabs_api_access') {
          module.parentElement.parentElement.querySelector('.descriptor.tradability.bookmark')
            .innerText = 'Bookmarked! Open the bookmarks menu to see what you have saved!';
        }
      });
    });
  });
};

const countDown = (dateToCountDownTo) => {
  if (!countingDown) {
    countingDown = true;
    countDownID = setInterval(() => {
      document.querySelectorAll('.countdown').forEach((countdown) => {
        const now = new Date().getTime();
        const distance = new Date(dateToCountDownTo) - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdown.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s remains`;

        if (distance < 0) {
          clearInterval(countDownID);
          countdown.classList.add('hidden');
          document.querySelectorAll('.tradabilityDiv').forEach((tradabilityDiv) => {
            tradabilityDiv.innerText = 'Tradable';
            tradabilityDiv.classList.add('tradable');
          });
        }
      });
    }, 1000);
  } else {
    clearInterval(countDownID);
    countingDown = false;
    countDown(dateToCountDownTo);
  }
};

const getItemInfoFromPage = (appID, contextID) => {
  const getItemsScript = `
        inventory = UserYou.getInventory(${appID},${contextID});
        trimmedAssets = [];
                
        for (const asset of Object.values(inventory.m_rgAssets)) {
            if (asset.hasOwnProperty('appid')) {
              trimmedAssets.push({
                  amount: asset.amount,
                  assetid: asset.assetid,
                  classid: asset.classid,
                  contextid: asset.contextid,
                  instanceid: asset.instanceid,
                  description: asset.description,
                  ...asset.description,
                  appid: asset.appid.toString(),
              });
            }
        }
        document.querySelector('body').setAttribute('inventoryInfo', JSON.stringify(trimmedAssets));`;
  return JSON.parse(injectScript(getItemsScript, true, 'getInventory', 'inventoryInfo'));
};

// it hides the original item name element and replaces it with one
// that is a link to it's market page and adds the doppler phase to the name
const changeName = (name, color, appID, marketHashName, dopplerInfo) => {
  const marketLink = getItemMarketLink(appID, marketHashName);
  const newNameElement = (dopplerInfo !== null && dopplerInfo !== undefined)
    ? `<a class="hover_item_name custom_name" style="color: #${color}" href="${marketLink}" target="_blank">${name} (${dopplerInfo.name})</a>`
    : `<a class="hover_item_name custom_name" style="color: #${color}" href="${marketLink}" target="_blank">${name}</a>`;

  document.querySelector('.inventory_page_right').querySelectorAll('.hover_item_name').forEach((nameElement) => {
    nameElement.insertAdjacentHTML('afterend', DOMPurify.sanitize(newNameElement, { ADD_ATTR: ['target'] }));
    nameElement.classList.add('hidden');
  });
};

const setFloatBarWithData = (floatInfo) => {
  const floatTechnicalElement = getDataFilledFloatTechnical(floatInfo);

  document.querySelectorAll('.floatTechnical').forEach((floatTechnical) => {
    floatTechnical.innerHTML = DOMPurify.sanitize(floatTechnicalElement, { ADD_ATTR: ['target'] });
  });

  const position = (toFixedNoRounding(floatInfo.floatvalue, 2) * 100) - 2;
  document.querySelectorAll('.floatToolTip').forEach((floatToolTip) => {
    floatToolTip.setAttribute('style', `left: ${position}%`);
  });
  document.querySelectorAll('.floatDropTarget').forEach((floatDropTarget) => {
    floatDropTarget.innerText = toFixedNoRounding(floatInfo.floatvalue, 4);
  });
};

const setPatternInfo = (patternInfo) => {
  document.querySelectorAll('.patternInfo').forEach((patternInfoElement) => {
    if (patternInfo !== null) {
      if (patternInfo.type === 'fade') patternInfoElement.classList.add('fadeGradient');
      else if (patternInfo.type === 'marble_fade') patternInfoElement.classList.add('marbleFadeGradient');
      else if (patternInfo.type === 'case_hardened') patternInfoElement.classList.add('caseHardenedGradient');
      patternInfoElement.innerText = `Pattern: ${patternInfo.value}`;
    }
  });
};

// sticker wear to sticker icon tooltip
const setStickerInfo = (stickers) => {
  if (stickers !== null) {
    stickers.forEach((stickerInfo, index) => {
      const wear = stickerInfo.wear !== undefined
        ? Math.trunc(Math.abs(1 - stickerInfo.wear) * 100)
        : 100;

      document.querySelectorAll('.customStickers').forEach((customStickers) => {
        const currentSticker = customStickers.querySelectorAll('.stickerSlot')[index];

        if (currentSticker !== undefined) {
          const currentToolTipText = currentSticker.getAttribute('data-tooltip');
          currentSticker.setAttribute('data-tooltip', `${currentToolTipText} - Condition: ${wear}%`);
          currentSticker.querySelector('img').setAttribute(
            'style',
            `opacity: ${(wear > 10) ? wear / 100 : (wear / 100) + 0.1}`,
          );
        }
      });
    });
  }
};

const setGenInspectInfo = (item) => {
  const genCommand = generateInspectCommand(
    item.market_hash_name, item.floatInfo.floatvalue, item.floatInfo.paintindex,
    item.floatInfo.defindex, item.floatInfo.paintseed, item.floatInfo.stickers,
  );

  document.querySelectorAll('.inspectOnServer').forEach((inspectOnServerDiv) => {
    const inspectGenCommandEl = inspectOnServerDiv.querySelector('.inspectGenCommand');
    inspectGenCommandEl.title = 'Click to copy !gen command';

    if (genCommand.includes('undefined')) {
      // defindex was not used/stored before the inspect on server feature was introduced
      // and it might not exists in the data stored in the float cache
      // if that is the case then we clear it from cache
      removeFromFloatCache(item.assetid);

      // ugly timeout to get around making removeFromFloatCache async
      setTimeout(() => {
        floatQueue.jobs.push({
          type: 'inventory_floatbar',
          assetID: item.assetid,
          inspectLink: item.inspectLink,
          // they call each other and one of them has to be defined first
          // eslint-disable-next-line no-use-before-define
          callBackFunction: dealWithNewFloatData,
        });

        if (!floatQueue.active) workOnFloatQueue();
      }, 1000);
    } else inspectGenCommandEl.textContent = genCommand;
    inspectGenCommandEl.setAttribute('genCommand', genCommand);
  });
};

const updateFloatAndPatternElements = (item) => {
  setFloatBarWithData(item.floatInfo);
  setPatternInfo(item.patternInfo);
  setStickerInfo(item.floatInfo.stickers);
  setGenInspectInfo(item, item.market_hash_name, item.floatInfo);
};

const hideFloatBars = () => {
  document.querySelectorAll('.floatBar').forEach((floatBarElement) => {
    floatBarElement.classList.add('hidden');
  });
};

const addFloatDataToPage = (job, activeFloatQueue, floatInfo) => {
  if (floatInfo !== null && floatInfo !== undefined) {
    addFloatIndicator(findElementByIDs(steamApps.CSGO.appID, '2', job.assetID, 'inventory'), floatInfo);

    // add float and pattern info to page variable
    const item = getItemByAssetID(items, job.assetID);
    item.floatInfo = floatInfo;
    item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintseed);

    if (job.type === 'inventory_floatbar') {
      if (getAssetIDofActive() === job.assetID) updateFloatAndPatternElements(item);
    } else {
      // check if there is a floatbar job for the same item and remove it
      activeFloatQueue.jobs.find((floatJob, index) => {
        if (floatJob.type === 'inventory_floatbar' && job.assetID === floatJob.assetID) {
          updateFloatAndPatternElements(item);
          activeFloatQueue.jobs = removeFromArray(activeFloatQueue.jobs, index);
        }
        return null;
      });
    }
  }
};

const dealWithNewFloatData = (job, floatInfo, activeFloatQueue) => {
  if (floatInfo !== 'nofloat') addFloatDataToPage(job, activeFloatQueue, floatInfo);
  else if (job.type === 'inventory_floatbar') hideFloatBars();
};

const sellNext = () => {
  if (document.getElementById('stopSale').getAttribute('data-stopped') === 'false') {
    for (const listingRow of document.getElementById('listingTable').querySelector('.rowGroup').querySelectorAll('.row')) {
      const IDs = listingRow.getAttribute('data-ids').split(',');
      const soldIDs = listingRow.getAttribute('data-sold-ids').split(',');
      const name = listingRow.getAttribute('data-item-name');

      for (const ID of IDs) {
        if (!soldIDs.includes(ID)) {
          const appID = ID.split('_')[0];
          const contextID = ID.split('_')[1];
          const assetID = ID.split('_')[2];
          listItem(
            appID,
            contextID,
            '1',
            assetID,
            listingRow.querySelector('.cstSelected').getAttribute('data-listing-price'),
          ).then(() => {
            const soldFromRow = document.getElementById('listingTable')
              .querySelector('.rowGroup').querySelector(`[data-item-name="${name}"]`);
            const rowIDs = soldFromRow.getAttribute('data-ids').split(',');
            let rowSoldIDs = soldFromRow.getAttribute('data-sold-ids').split(',');
            rowSoldIDs = rowSoldIDs[0] === '' ? [] : rowSoldIDs;

            rowSoldIDs.push(`${appID}_${contextID}_${assetID}`);
            if (rowIDs.toString() === rowSoldIDs.toString()) soldFromRow.classList.add('strikethrough');
            const quantityCell = soldFromRow.querySelector('.itemAmount');
            const quantityElement = quantityCell.querySelector('input');
            quantityElement.value = (parseInt(quantityElement.value) - 1).toString();

            // flashing quantity as visual feedback when it changes
            quantityCell.classList.add('whiteBackground');
            document.getElementById('remainingItems').classList.add('whiteBackground');
            setTimeout(() => {
              quantityCell.classList.remove('whiteBackground');
              document.getElementById('remainingItems').classList.remove('whiteBackground');
            }, 200);

            soldFromRow.setAttribute('data-sold-ids', rowSoldIDs.toString());
            const itemElement = findElementByIDs(appID, contextID, assetID, 'inventory');
            itemElement.classList.add('sold');
            itemElement.classList.remove('cstSelected');

            // updates remaining and total items
            const totalItems = parseInt(document.getElementById('numberOfItemsToSell').innerText);
            document.getElementById('totalItems').innerText = totalItems.toString();

            let alreadySold = 0;
            for (const row of document.getElementById('listingTable').querySelector('.rowGroup').querySelectorAll('.row')) {
              const alreadySoldIDs = row.getAttribute('data-sold-ids').split(',');
              alreadySold += alreadySoldIDs.length === 1
                ? alreadySoldIDs[0] === ''
                  ? 0
                  : 1
                : alreadySoldIDs.length;
            }
            document.getElementById('remainingItems').innerText = (totalItems - alreadySold).toString();

            sellNext();
          }).catch((err) => {
            console.log(err);
            const warningElement = document.getElementById('massSellError');
            if (err.message) {
              warningElement.innerText = err.message;
              warningElement.classList.remove('hidden');
            }
            const retryEl = document.getElementById('massSaleRetry');
            retryEl.classList.remove('hidden');
            setTimeout(() => {
              retryEl.classList.add('hidden');
              if (!warningElement.classList.contains('hidden')) warningElement.classList.add('hidden');
              sellNext();
            }, 5000);
          });

          return;
        }
      }
    }
  }
  document.querySelector('.beforeStart').classList.remove('hidden');
  document.querySelector('.inProgress').classList.add('hidden');
};

const startMassSelling = () => {
  document.querySelector('.beforeStart').classList.add('hidden');
  document.querySelector('.inProgress').classList.remove('hidden');
  document.getElementById('stopSale').setAttribute('data-stopped', 'false');
  sellNext();
};

const onListingPricesLoaded = () => {
  const onLoadBox = document.getElementById('startListingOnPriceLoad');
  if (onLoadBox && onLoadBox.checked) startMassSelling();
};

// adds market info in other inventories
const addStartingAtPrice = (appID, marketHashName) => {
  getPriceOverview(appID, marketHashName).then(
    (priceOverview) => {
      // removes previous leftover elements
      document.querySelectorAll('.startingAtVolume')
        .forEach((previousElement) => previousElement.remove());

      // adds new elements
      document.querySelectorAll('.item_owner_actions')
        .forEach((marketActions) => {
          marketActions.style.display = 'block';
          const startingAt = priceOverview.lowest_price === undefined ? 'Unknown' : priceOverview.lowest_price;
          const volume = priceOverview.volume === undefined ? 'Unknown amount' : priceOverview.volume;

          marketActions.insertAdjacentHTML('afterbegin',
            DOMPurify.sanitize(`<div class="startingAtVolume">
                     <div style="height: 24px;">
                        <a href="${getItemMarketLink(appID, marketHashName)}">
                            View in Community Market
                        </a>
                     </div>
                     <div style="min-height: 3em; margin-left: 1em;">
                        Starting at: ${startingAt}<br>Volume: ${volume} sold in the last 24 hours<br>
                     </div>
                   </div>
                `));
        });
    }, (error) => { console.log(error); },
  );
};

const addRightSideElements = () => {
  const activeIDs = getIDsOfActiveItem();
  if (activeIDs !== null) {
    // cleans up previously added elements
    cleanUpElements();
    const item = getItemByIDs(items, activeIDs.appID, activeIDs.contextID, activeIDs.assetID);
    const activeInventoryAppID = getActiveInventoryAppID();
    if (activeInventoryAppID === steamApps.CSGO.appID
      || activeInventoryAppID === steamApps.DOTA2.appID
      || activeInventoryAppID === steamApps.TF2.appID
    ) {
      // removes previously added listeners
      document.querySelectorAll('.showTechnical, .lowerModule, .marketActionInstantSell, .marketActionQuickSell, .copyItemID, .copyItemName, .copyItemLink').forEach((element) => {
        element.removeEventListener('click');
      });

      // adds the lower module that includes tradability, countdown  and bookmarking
      document.querySelectorAll('#iteminfo1_item_actions, #iteminfo0_item_actions')
        .forEach((action) => {
          action.insertAdjacentHTML('afterend', DOMPurify.sanitize(`
            <div class="inspectOnServer hidden">
                <div>
                    <a href="${inspectServerConnectLink}" class="connectToInspectServer">${inspectServerConnectCommand}</a>
                </div>
                <div class="inspectGenCommand clickable" title="Generating !gen command..." style="margin-top: 5px;">Generating !gen command...</div>
            </div>
          ${lowerModule}`));
        });

      // i think dompurify removes the connect link when inserted above
      // this adds the href afterwards
      document.querySelectorAll('.connectToInspectServer').forEach((connectLinkEl) => {
        connectLinkEl.setAttribute('href', inspectServerConnectLink);
      });

      document.querySelectorAll('.inspectGenCommand').forEach((copyGenCommandEl) => {
        copyGenCommandEl.addEventListener('click', () => {
          copyToClipboard(copyGenCommandEl.getAttribute('genCommand'));
        });
      });

      document.querySelectorAll('.lowerModule').forEach((module) => {
        module.addEventListener('click', (event) => {
          addBookmark(event.target);
        });
      });

      document.querySelectorAll('.onServer').forEach((onServerInspectButton) => {
        onServerInspectButton.addEventListener('click', () => {
          document.querySelectorAll('.inspectOnServer').forEach((inspectOnServerDiv) => {
            inspectOnServerDiv.classList.remove('hidden');
          });
          onServerInspectButton.removeEventListener('click', this);
        });
      });

      if (activeInventoryAppID === steamApps.CSGO.appID) {
        // hides "tags" and "tradable after" in one's own inventory
        document.querySelectorAll('#iteminfo1_item_tags, #iteminfo0_item_tags, #iteminfo1_item_owner_descriptors, #iteminfo0_item_owner_descriptors')
          .forEach((tagsElement) => {
            if (!tagsElement.classList.contains('hidden')) tagsElement.classList.add('hidden');
          });

        // adds float bar, sticker info, nametag
        document.querySelectorAll('.item_desc_icon').forEach((icon) => {
          icon.insertAdjacentHTML('afterend', DOMPurify.sanitize(upperModule));
        });

        // listens to click on "show technical"
        document.querySelectorAll('.showTechnical').forEach((showTechnical) => {
          showTechnical.addEventListener('click', () => {
            document.querySelectorAll('.floatTechnical').forEach((floatTechnical) => {
              floatTechnical.classList.toggle('hidden');
            });
          });
        });

        // allows the float pointer's text to go outside the boundaries of the item
        // they would not be visible otherwise on high-float items
        // also removes background from the right side of the page
        document.querySelectorAll('.item_desc_content').forEach((itemDescContent) => {
          itemDescContent.setAttribute('style', 'overflow: visible; background-image: url()');
        });
      }
    } else {
      document.querySelectorAll('.countdown').forEach((countdown) => {
        countdown.style.display = 'none';
      });
    }

    if (item) {
      if (activeInventoryAppID === steamApps.CSGO.appID
        || activeInventoryAppID === steamApps.DOTA2.appID
        || activeInventoryAppID === steamApps.TF2.appID) {
        if (activeInventoryAppID === steamApps.CSGO.appID) {
          // adds the nametag text to nametags
          document.querySelectorAll('.nametag').forEach((nametag) => {
            if (item.nametag !== undefined) {
              nametag.innerText = item.nametag;
              document.querySelectorAll('.fraud_warning').forEach((fraudWarning) => {
                fraudWarning.outerHTML = '';
              });
            } else nametag.style.display = 'none';
          });

          // repositions stickers
          if (item.stickers !== undefined && item.stickers.length !== 0) {
            // removes the original stickers elements
            const originalStickers = document.getElementById('sticker_info');
            if (originalStickers !== null) originalStickers.outerHTML = '';

            // sometimes it is added slowly so it does not get removed the first time..
            setTimeout(() => {
              if (originalStickers !== null && originalStickers.parentNode !== null) originalStickers.outerHTML = '';
            }, 1000);

            // adds own sticker elements
            item.stickers.forEach((stickerInfo) => {
              document.querySelectorAll('.customStickers').forEach((customStickers) => {
                customStickers.innerHTML += DOMPurify.sanitize(`
                                    <div class="stickerSlot" data-tooltip="${stickerInfo.name} (${stickerInfo.price.display})">
                                        <a href="${stickerInfo.marketURL}" target="_blank">
                                            <img src="${stickerInfo.iconURL}" class="stickerIcon">
                                        </a>
                                    </div>
                                    `, { ADD_ATTR: ['target'] });
              });
            });
          }

          // adds csgostash link to collection
          if (item.collection) {
            document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
              .forEach((descriptors) => {
                descriptors.querySelectorAll('.descriptor').forEach((descriptor) => {
                  if (descriptor.style.color === 'rgb(157, 161, 169)') {
                    const collectionName = descriptor.textContent;
                    descriptor.innerHTML = '';
                    descriptor.insertAdjacentHTML(
                      'afterbegin',
                      DOMPurify.sanitize(
                        `<a href="https://csgostash.com/collection/${item.collection}?utm_source=csgotrader.app" target="_blank">
                        ${collectionName}
                      </a>`,
                        { ADD_ATTR: ['target'] },
                      ),
                    );
                  }
                });
              });
          }

          // adds the in-offer module
          chrome.storage.local.get(['activeOffers', 'itemInOffersInventory', 'showPriceEmpireLinkInInventory',
            'showBuffLookupInInventory', 'inventoryShowCopyButtons', 'showCSGOSTASHLinkInInventory'], ({
            activeOffers, itemInOffersInventory, showCSGOSTASHLinkInInventory,
            showPriceEmpireLinkInInventory, showBuffLookupInInventory, inventoryShowCopyButtons,
          }) => {
            if (itemInOffersInventory) {
              const inOffers = activeOffers.items.filter((offerItem) => {
                return offerItem.assetid === item.assetid;
              });

              if (inOffers.length !== 0) {
                const offerLinks = inOffers.map((offerItem, index) => {
                  const offerLink = offerItem.offerOrigin === 'sent'
                    ? `https://steamcommunity.com/profiles/${offerItem.owner}/tradeoffers/sent#tradeofferid_${offerItem.inOffer}`
                    : `https://steamcommunity.com/tradeoffer/${offerItem.inOffer}/`;

                  const afterLinkChars = index === inOffers.length - 1
                    ? '' // if it's the last one
                    : ', ';

                  return `<a href="${offerLink}" target="_blank">
                        ${offerItem.inOffer}${afterLinkChars}
                      </a>`;
                });

                const listString = `<div>${offerLinks.join('')}</div>`;
                const inTradesInfoModule = `
                <div class="descriptor inTradesInfoModule">
                    In offer${inOffers.length > 1 ? 's' : ''}:
                    ${listString}
                </div>`;

                document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
                  .forEach((descriptor) => {
                    descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(inTradesInfoModule, { ADD_ATTR: ['target'] }));
                  });
              }
            }

            if (showPriceEmpireLinkInInventory) {
              const priceEmpireLink = `
                <div class="descriptor pricEmpireLink">
                    <a href="https://pricempire.com/item/${item.market_hash_name}?utm_source=csgotrader.app" target="_blank" style="color: yellow;">
                        Check prices on PRICEMPIRE.COM
                      </a>
                </div>
              `;

              document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
                .forEach((descriptor) => {
                  descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(priceEmpireLink, { ADD_ATTR: ['target'] }));
                });
            }

            if (showBuffLookupInInventory) {
              const buffLink = `
                <div class="descriptor buffLink">
                    <a href="https://api.pricempire.com/v1/redirectBuff/${item.market_hash_name}" target="_blank" style="color: yellow;">
                        Lookup item on Buff
                      </a>
                </div>
              `;

              document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
                .forEach((descriptor) => {
                  descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(buffLink, { ADD_ATTR: ['target'] }));
                });
            }

            if (showCSGOSTASHLinkInInventory) {
              const CSGOSTASHLink = `
                <div class="descriptor CSGOSSTASHLink">
                    <a href="https://csgostash.com/markethash/${item.market_hash_name}" target="_blank" style="color: yellow;">
                        View on CS:GO STASH
                      </a>
                </div>
              `;

              document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
                .forEach((descriptor) => {
                  descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(CSGOSTASHLink, { ADD_ATTR: ['target'] }));
                });
            }

            if (inventoryShowCopyButtons) {
              document.querySelectorAll('.copyButtons')
                .forEach((copyButtons) => {
                  copyButtons.insertAdjacentHTML(
                    'afterbegin',
                    DOMPurify.sanitize(
                      `<div class="copyItemID clickable" title="Copy the AssetID of the item.">
                                Copy ID
                            </div>
                            <div class="copyItemName clickable" title="Copy the full market name of the item.">
                                Copy Name
                            </div>
                            <div class="copyItemLink clickable" title="Copy the item's inventory link.">
                                Copy Link
                            </div>`,
                    ),
                  );
                });

              document.querySelectorAll('.copyItemID').forEach((element) => {
                element.addEventListener('click', () => {
                  copyToClipboard(item.assetid);
                });
              });

              document.querySelectorAll('.copyItemName').forEach((element) => {
                element.addEventListener('click', () => {
                  copyToClipboard(item.market_hash_name);
                });
              });

              document.querySelectorAll('.copyItemLink').forEach((element) => {
                element.addEventListener('click', () => {
                  copyToClipboard(`https://steamcommunity.com/profiles/${item.owner}/inventory/#${item.appid}_${item.contextid}_${item.assetid}`);
                });
              });
            }
          });

          // removes sih "Get Float" button
          // does not really work since it's loaded after this script..
          if (isSIHActive()) {
            document.querySelectorAll('.float_block').forEach((e) => e.remove());
            setTimeout(() => {
              document.querySelectorAll('.float_block').forEach((e) => e.remove());
            }, 1000);
          }
          if (item.floatInfo === null || item.floatInfo === undefined) {
            if (item.inspectLink !== null && itemTypes[item.type.key].float) {
              floatQueue.jobs.push({
                type: 'inventory_floatbar',
                assetID: item.assetid,
                inspectLink: item.inspectLink,
                callBackFunction: dealWithNewFloatData,
              });
              if (!floatQueue.active) workOnFloatQueue();
            } else hideFloatBars();
          } else {
            updateFloatAndPatternElements(item);
            addFloatIndicator(findElementByIDs(steamApps.CSGO.appID, '2', item.assetid, 'inventory'), item.floatInfo);
          }

          // it takes the visible descriptors and checks if the collection includes souvenirs
          let textOfDescriptors = '';
          document.querySelectorAll('.descriptor').forEach((descriptor) => {
            if (descriptor.parentNode.classList.contains('item_desc_descriptors')
              && descriptor.parentNode.parentNode.parentNode.parentNode.style.display !== 'none') {
              textOfDescriptors += descriptor.innerText;
            }
          });

          const thereSouvenirForThisItem = souvenirExists(textOfDescriptors);

          let weaponName = '';
          const star = item.starInName ? starChar : '';

          if (item.isStatrack) weaponName = item.market_hash_name.split(`${stattrakPretty} `)[1].split('(')[0];
          else if (item.isSouvenir) weaponName = item.market_hash_name.split('Souvenir ')[1].split('(')[0];
          else {
            weaponName = item.market_hash_name.split('(')[0].split('★ ')[1];
            if (weaponName === undefined) weaponName = item.market_hash_name.split('(')[0];
          }

          let stOrSv = stattrakPretty;
          let stOrSvClass = 'stattrakOrange';
          let linkMidPart = star + stattrak;
          if (item.isSouvenir || thereSouvenirForThisItem) {
            stOrSvClass = 'souvenirYellow';
            stOrSv = souvenir;
            linkMidPart = souvenir;
          }

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

          if (item.exterior !== undefined) {
            document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
              .forEach((descriptor) => {
                descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(otherExteriors, { ADD_ATTR: ['target'] }));
              });
          }
        }

        // sets the tradability info
        document.querySelectorAll('.tradabilityDiv').forEach((tradabilityDiv) => {
          if (item.tradability === 'Tradable') {
            tradabilityDiv.innerHTML = DOMPurify.sanitize(tradable);
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'none';
            });
          } else if (item.tradability === 'Not Tradable') {
            tradabilityDiv.innerHTML = DOMPurify.sanitize(notTradable);
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'none';
            });
          } else {
            const tradableAt = new Date(item.tradability).toString().split('GMT')[0];
            tradabilityDiv.innerHTML = DOMPurify.sanitize(`<span class='not_tradable'>Tradable After ${tradableAt}</span>`);
            countDown(tradableAt);
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'block';
            });
          }
        });
      }

      if (item.duplicates !== undefined) {
        // adds duplicates counts
        document.querySelectorAll('.duplicate').forEach((duplicate) => {
          duplicate.style.display = 'block';
          duplicate.innerText = `x${item.duplicates.num}`;
        });
      }

      // adds doppler phase  to the name and makes it a link to the market listings page
      // the name is retrieved from the page variables to keep the right local
      const name = getItemByIDs(
        getItemInfoFromPage(
          item.appid,
          item.contextid,
        ),
        item.appid,
        item.contextid,
        item.assetid,
      ).description.name;

      changeName(name, item.name_color, item.appid, item.market_hash_name, item.dopplerInfo);

      // adds "starting at" and sales volume to everyone's inventory
      if (!isOwnInventory()) addStartingAtPrice(item.appid, item.market_hash_name);
      else if (item.marketable) { // adds quick and instant sell buttons
        chrome.storage.local.get(['inventoryInstantQuickButtons'], ({ inventoryInstantQuickButtons }) => {
          if (inventoryInstantQuickButtons) {
            document.querySelectorAll('.item_market_actions').forEach((marketActions) => {
              marketActions.insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(
                  `<a class="marketActionInstantSell item_market_action_button item_market_action_button_green">
                           <span class="item_market_action_button_edge item_market_action_button_left"></span>
                           <span class="item_market_action_button_contents" title="List the item on the market to be bought by the highest buy order">Instant Sell</span>
                           <span class="item_market_action_button_edge item_market_action_button_right"></span>
                      </a>
                      <a class="marketActionQuickSell item_market_action_button item_market_action_button_green">
                           <span class="item_market_action_button_edge item_market_action_button_left"></span>
                           <span class="item_market_action_button_contents" title="List the item to be the cheapest on the market">Quick Sell</span>
                           <span class="item_market_action_button_edge item_market_action_button_right"></span>
                      </a>`,
                ),
              );

              marketActions.querySelectorAll('.marketActionInstantSell').forEach((instantSellButton) => {
                instantSellButton.addEventListener('click', () => {
                  getHighestBuyOrder(
                    item.appid,
                    item.market_hash_name,
                  ).then((highestOrderPrice) => {
                    if (highestOrderPrice !== null) {
                      listItem(
                        item.appid,
                        item.contextid,
                        1,
                        item.assetid,
                        getPriceAfterFees(highestOrderPrice),
                      ).then(() => {
                        instantSellButton.querySelector('.item_market_action_button_contents').innerText = 'Listing created!';
                      }).catch((err) => {
                        console.log(err);
                        document.querySelectorAll('#iteminfo1_market_content, #iteminfo0_market_content').forEach((marketContent) => {
                          marketContent.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="listingError">${err.message}</div>`));
                        });
                      });
                    } else {
                      document.querySelectorAll('#iteminfo1_market_content, #iteminfo0_market_content').forEach((marketContent) => {
                        marketContent.insertAdjacentHTML('beforeend', DOMPurify.sanitize('<div class="listingError">No buy orders to sell to.</div>'));
                      });
                    }
                  }).catch((err) => {
                    console.log(err);
                    document.querySelectorAll('#iteminfo1_market_content, #iteminfo0_market_content').forEach((marketContent) => {
                      marketContent.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="listingError">${err}</div>`));
                    });
                  });
                });
              });

              marketActions.querySelectorAll('.marketActionQuickSell').forEach((quickSellButton) => {
                quickSellButton.addEventListener('click', () => {
                  getLowestListingPrice(
                    item.appid,
                    item.market_hash_name,
                  ).then((lowestListingPrice) => {
                    const newPrice = lowestListingPrice > 3 ? lowestListingPrice - 1 : 3;
                    listItem(
                      item.appid,
                      item.contextid,
                      1,
                      item.assetid,
                      getPriceAfterFees(newPrice),
                    ).then(() => {
                      quickSellButton.querySelector('.item_market_action_button_contents').innerText = 'Listing created!';
                    }).catch((err) => {
                      console.log(err);
                      document.querySelectorAll('#iteminfo1_market_content, #iteminfo0_market_content').forEach((marketContent) => {
                        marketContent.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="listingError">${err.message}</div>`));
                      });
                    });
                  }).catch((err) => {
                    console.log(err);
                    document.querySelectorAll('#iteminfo1_market_content, #iteminfo0_market_content').forEach((marketContent) => {
                      marketContent.insertAdjacentHTML('beforeend', DOMPurify.sanitize('<div class="listingError">Could not get lowest listing price</div>'));
                    });
                  });
                });
              });
            });
          }
        });

        if (item.commodity) {
          const multiSellLink = `
                <div class="descriptor multiSellLink">
                    <a href="https://steamcommunity.com/market/multisell?appid=${item.appid}&contextid=${item.contextid}&items%5B%5D=${item.market_hash_name}&qty%5B%5D=250" target="_blank">
                        Open multisell page.
                      </a>
                </div>
              `;

          document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors')
            .forEach((descriptor) => {
              descriptor.insertAdjacentHTML('afterend', DOMPurify.sanitize(multiSellLink, { ADD_ATTR: ['target'] }));
            });
        }
      }
    } else {
      // show the original names if the name can't be changed
      // because it can't be retrieved from the page
      document.querySelectorAll('.hover_item_name').forEach((name) => {
        name.classList.remove('hidden');
      });
    }
  } else console.log('Could not get IDs of active item');
};

const addFloatIndicatorsToPage = () => {
  chrome.storage.local.get('autoFloatInventory', (autoFloatInventory) => {
    if (autoFloatInventory && !csgoFloatExtPresent()) {
      const page = getActivePage('inventory');
      if (page !== null) {
        page.querySelectorAll('.item.app730.context2').forEach((itemElement) => {
          const assetID = getAssetIDOfElement(itemElement);
          const item = getItemByAssetID(items, assetID);
          if (item.inspectLink !== null && itemTypes[item.type.key].float) {
            if (item.floatInfo === null) {
              floatQueue.jobs.push({
                type: 'inventory',
                assetID,
                inspectLink: item.inspectLink,
                callBackFunction: dealWithNewFloatData,
              });
            } else addFloatIndicator(itemElement, item.floatInfo);
          }
        });
        if (!floatQueue.active) workOnFloatQueue();
      }
    }
  });
};

const addRealTimePricesToQueue = () => {
  if (!document.getElementById('selectButton').classList.contains('selectionActive')) {
    chrome.storage.local.get(
      ['realTimePricesAutoLoadInventory', 'realTimePricesMode'],
      ({ realTimePricesAutoLoadInventory, realTimePricesMode }) => {
        if (realTimePricesAutoLoadInventory) {
          const itemElements = [];
          const page = getActivePage('inventory');

          if (page !== null) {
            page.querySelectorAll('.item').forEach((item) => {
              if (!item.classList.contains('unknownItem')) itemElements.push(item);
            });
          } else {
            setTimeout(() => {
              addRealTimePricesToQueue();
            }, 1000);
          }

          if (itemElements) {
            itemElements.forEach((itemElement) => {
              if (itemElement.getAttribute('data-realtime-price') === null) {
                const IDs = getIDsFromElement(itemElement, 'inventory');
                const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);

                itemElement.setAttribute('data-realtime-price', '0');
                if (item && item.marketable === 1) {
                  priceQueue.jobs.push({
                    type: `inventory_${realTimePricesMode}`,
                    assetID: item.assetid,
                    appID: item.appid,
                    contextID: item.contextid,
                    market_hash_name: item.market_hash_name,
                    retries: 0,
                    callBackFunction: addRealTimePriceToPage,
                  });
                }
              }
            });

            if (!priceQueue.active) workOnPriceQueue();
          }
        }
      },
    );
  }
};

const addInOtherTradeIndicator = (itemElement, item, activeOfferItems) => {
  const inOffers = activeOfferItems.filter((offerItem) => {
    return offerItem.assetid === item.assetid;
  });
  if (inOffers.length !== 0) {
    itemElement.insertAdjacentHTML('beforeend', (inOtherOfferIndicator));
  }
};

// adds everything that is per item, like trade lock, exterior, doppler phases, border colors
const addPerItemInfo = (appID) => {
  const itemElements = document.querySelectorAll(`.item.app${appID}.context2`);
  if (itemElements.length !== 0) {
    chrome.storage.local.get([
      'colorfulItems', 'autoFloatInventory', 'showStickerPrice', 'activeOffers',
      'itemInOffersInventory', 'showShortExteriorsInventory', 'showTradeLockIndicatorInInventories',
    ],
    ({
      colorfulItems, showStickerPrice, autoFloatInventory,
      activeOffers, itemInOffersInventory, showShortExteriorsInventory,
      showTradeLockIndicatorInInventories,
    }) => {
      itemElements.forEach((itemElement) => {
        if (itemElement.getAttribute('data-processed') === null
            || itemElement.getAttribute('data-processed') === 'false') {
          // in case the inventory is not loaded yet it retries in a second
          if (itemElement.id === undefined) {
            setTimeout(() => {
              addPerItemInfo(appID);
            }, 1000);
            return false;
          }
          const IDs = getIDsFromElement(itemElement, 'inventory');
          const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);

          if (showTradeLockIndicatorInInventories) {
            // adds tradability indicator
            if (item.tradability === 'Tradable') {
              itemElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize('<div class="perItemDate tradable">T</div>'));
            } else if (item.tradability !== 'Not Tradable') {
              itemElement.insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(`<div class="perItemDate not_tradable">${item.tradabilityShort}</div>`),
              );
            }
          }

          if (appID === steamApps.CSGO.appID) {
            addDopplerPhase(itemElement, item.dopplerInfo);
            makeItemColorful(itemElement, item, colorfulItems);
            addSSTandExtIndicators(
              itemElement, item, showStickerPrice,
              showShortExteriorsInventory,
            );
            addPriceIndicator(itemElement, item.price);
            if (itemInOffersInventory) {
              addInOtherTradeIndicator(itemElement, item, activeOffers.items);
            }
            if (autoFloatInventory) addFloatIndicator(itemElement, item.floatInfo);
          }

          // marks the item "processed" to avoid additional unnecessary work later
          itemElement.setAttribute('data-processed', 'true');
        }
      });
    });
  } else { // in case the inventory is not loaded yet
    setTimeout(() => {
      addPerItemInfo(appID);
    }, 1000);
  }
};

const setInventoryTotal = () => {
  chrome.storage.local.get(['currency'], ({ currency }) => {
    const inventoryTotalValueElement = document.getElementById('inventoryTotalValue');
    inventoryTotalValueElement.innerText = prettyPrintPrice(
      currency,
      (inventoryTotal).toFixed(0),
    );
  });
};

const unselectAllItems = () => {
  document.querySelectorAll('.item.app730.context2').forEach((item) => {
    item.classList.remove('cstSelected');
  });
};

const updateMassSaleTotal = () => {
  let total = 0;
  let totalAfterFees = 0;
  document.getElementById('listingTable').querySelector('.rowGroup').querySelectorAll('.row')
    .forEach((listingRow) => {
      total += parseInt(listingRow.querySelector('.cstSelected')
        .getAttribute('data-price-in-cents'))
        * parseInt(listingRow.querySelector('.itemAmount').querySelector('input').value);
      totalAfterFees += parseInt(listingRow.querySelector('.cstSelected')
        .getAttribute('data-listing-price'))
        * parseInt(listingRow.querySelector('.itemAmount').querySelector('input').value);
    });
  document.getElementById('saleTotal').innerText = centsToSteamFormattedPrice(total);
  document.getElementById('saleTotalAfterFees').innerText = centsToSteamFormattedPrice(totalAfterFees);
};

const getListingRow = (appID, contextID, name) => {
  return document.getElementById('listingTable').querySelector(`.row[data-item-name="${appID}_${contextID}_${name}"]`);
};

const removeUnselectedItemsFromTable = () => {
  document.getElementById('listingTable').querySelector('.rowGroup')
    .querySelectorAll('.row').forEach((listingRow) => {
      const IDs = listingRow.getAttribute('data-ids').split(',');
      const remainingIDs = IDs.filter((ID) => {
        const IDSplit = ID.split('_');
        return findElementByIDs(IDSplit[0], IDSplit[1], IDSplit[2], 'inventory').classList.contains('cstSelected');
      });
      if (remainingIDs.length === 0) listingRow.remove();
      else {
        listingRow.setAttribute('data-ids', remainingIDs.toString());
        listingRow.querySelector('.itemAmount').querySelector('input').value = remainingIDs.length.toString();
      }
    });
};

const addListingRow = (item) => {
  const row = `
          <div class="row" data-ids="${item.appid}_${item.contextid}_${item.assetid}" data-sold-ids="" data-item-name="${item.appid}_${item.contextid}_${item.market_hash_name}">
              <div class="cell itemName">
                  <a href="${getItemMarketLink(item.appid, item.market_hash_name)}" target="_blank">
                      ${item.market_hash_name}
                  </a>
              </div>
              <div class="cell itemAmount">
                  <input type="number" min="0" max="5000" value="1" required>
              </div>
              <div
                  class="cell itemExtensionPrice cstSelected clickable"
                  data-price-in-cents="${item.price ? userPriceToProperPrice(item.price.price).toString() : '0'}"
                  data-listing-price="${item.price ? getPriceAfterFees(userPriceToProperPrice(item.price.price)).toString() : '0'}"
                  >
                  ${item.price ? item.price.display : '0'}
              </div>
              <div class="cell itemStartingAt clickable">---</div>
              <div class="cell itemQuickSell clickable">---</div>
              <div class="cell itemMidPrice clickable">---</div>
              <div class="cell itemInstantSell clickable">---</div>
              <div class="cell itemUserPrice"><input type="text" class="userPriceInput"></div>
          </div>`;

  document.getElementById('listingTable').querySelector('.rowGroup')
    .insertAdjacentHTML('beforeend', DOMPurify.sanitize(row));
  const listingRow = getListingRow(item.appid, item.contextid, item.market_hash_name);

  listingRow.querySelector('.itemAmount').querySelector('input[type=number]')
    .addEventListener('change', (event) => {
      const quantity = parseInt(event.target.value);
      let selected = 0;
      document.getElementById('tabcontent_inventory').querySelectorAll('.item').forEach((itemElement) => {
        const IDs = getIDsFromElement(itemElement, 'inventory');
        const itemInfo = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
        if (itemInfo !== undefined && itemInfo.market_hash_name === item.market_hash_name
          && itemInfo.appid === item.appid) {
          if (selected < quantity) {
            if (!itemElement.classList.contains('cstSelected')) itemElement.classList.add('cstSelected');
            selected += 1;
          } else if (itemElement.classList.contains('cstSelected')) itemElement.classList.remove('cstSelected');
        }
      });

      if (quantity === 0) listingRow.remove();

      listingRow.setAttribute('data-ids', '');
      // they use each other, one of them has to be declared first
      // eslint-disable-next-line no-use-before-define
      updateSelectedItemsSummary();
    });

  listingRow.querySelector('.itemUserPrice').querySelector('input[type=text]')
    .addEventListener('change', (event) => {
      const priceInt = userPriceToProperPrice(event.target.value);
      event.target.parentElement.setAttribute('data-price-in-cents', priceInt);
      event.target.parentElement.setAttribute('data-listing-price', getPriceAfterFees(priceInt));
      event.target.value = centsToSteamFormattedPrice(priceInt);
      event.target.parentElement.classList.add('cstSelected');
      event.target.parentElement.parentElement.querySelectorAll('.itemExtensionPrice,.itemStartingAt,.itemQuickSell,.itemInstantSell,.itemMidPrice')
        .forEach((priceType) => priceType.classList.remove('cstSelected'));
      updateMassSaleTotal();
    });

  listingRow.querySelectorAll('.itemExtensionPrice,.itemStartingAt,.itemQuickSell,.itemInstantSell,.itemMidPrice')
    .forEach((priceType) => {
      priceType.addEventListener('click', (event) => {
        event.target.classList.add('cstSelected');
        event.target.parentNode.querySelectorAll('.cell').forEach((column) => {
          if (column !== event.target) column.classList.remove('cstSelected');
        });
        updateMassSaleTotal();
      });
    });
};

const addStartingAtAndQuickSellPrice = (
  marketHashName,
  priceInCents,
  appID,
  assetID,
  contextID,
) => {
  const listingRow = getListingRow(appID, contextID, marketHashName);

  // the user might have unselected the item while it as in the queue
  // and now there is nowhere to add the price to
  if (listingRow !== null) {
    const startingAtElement = listingRow.querySelector('.itemStartingAt');
    const quickSell = listingRow.querySelector('.itemQuickSell');
    const quickSellPrice = priceInCents > 3 ? priceInCents - 1 : priceInCents;

    startingAtElement.innerText = centsToSteamFormattedPrice(priceInCents);
    startingAtElement.setAttribute('data-price-set', true.toString());
    startingAtElement.setAttribute('data-price-in-cents', priceInCents);
    startingAtElement.setAttribute('data-listing-price', getPriceAfterFees(priceInCents).toString());
    quickSell.setAttribute('data-price-in-cents', quickSellPrice.toString());
    quickSell.setAttribute('data-listing-price', getPriceAfterFees(quickSellPrice).toString());
    quickSell.innerText = centsToSteamFormattedPrice(quickSellPrice);

    // if the quicksell price is higher than the extension price
    // then select that one as default instead
    const extensionPrice = parseInt(listingRow.querySelector('.itemExtensionPrice')
      .getAttribute('data-price-in-cents'));
    const userSetPrice = listingRow.querySelector('.userPriceInput').value;
    if ((extensionPrice < quickSellPrice) && userSetPrice === '') quickSell.click();
  }
};

const addInstantSellPrice = (marketHashName, highestOrder, appID, assetID, contextID) => {
  const listingRow = getListingRow(appID, contextID, marketHashName);

  // the user might have unselected the item while it as in the queue
  // and now there is nowhere to add the price to
  if (listingRow !== null) {
    const instantElement = listingRow.querySelector('.itemInstantSell');

    if (highestOrder !== undefined) {
      if (highestOrder === null) { // when there aren'y any buy orders for the item
        instantElement.innerText = 'No Orders';
        instantElement.setAttribute('data-price-set', true.toString());
        instantElement.setAttribute('data-price-in-cents', '0');
        instantElement.setAttribute('data-listing-price', '0');
      } else {
        instantElement.innerText = centsToSteamFormattedPrice(highestOrder);
        instantElement.setAttribute('data-price-set', true.toString());
        instantElement.setAttribute('data-price-in-cents', highestOrder);
        instantElement.setAttribute('data-listing-price', getPriceAfterFees(highestOrder).toString());
      }
    } else instantElement.setAttribute('data-price-set', false.toString());

    instantElement.setAttribute('data-price-in-progress', false.toString());
  }
};

const addMidPrice = (marketHashName, midPrice, appID, assetID, contextID) => {
  const listingRow = getListingRow(appID, contextID, marketHashName);

  // the user might have unselected the item while it as in the queue
  // and now there is nowhere to add the price to
  if (listingRow !== null) {
    const midPriceElement = listingRow.querySelector('.itemMidPrice');

    if (midPrice !== undefined) {
      if (midPrice === null) { // when there aren't nay buy orders or listings
        midPriceElement.innerText = 'No price';
        midPriceElement.setAttribute('data-price-set', true.toString());
        midPriceElement.setAttribute('data-price-in-cents', '0');
        midPriceElement.setAttribute('data-listing-price', '0');
      } else {
        midPriceElement.innerText = centsToSteamFormattedPrice(midPrice);
        midPriceElement.setAttribute('data-price-set', true.toString());
        midPriceElement.setAttribute('data-price-in-cents', parseInt(midPrice).toString());
        midPriceElement.setAttribute('data-listing-price', getPriceAfterFees(midPrice).toString());
      }
    } else midPriceElement.setAttribute('data-price-set', false.toString());

    midPriceElement.setAttribute('data-price-in-progress', false.toString());
  }
};

const addToPriceQueueIfNeeded = (item) => {
  const listingRow = getListingRow(item.appid, item.contextid, item.market_hash_name);
  const startingAtElement = listingRow.querySelector('.itemStartingAt');
  const instantElement = listingRow.querySelector('.itemInstantSell');
  const midPriceElement = listingRow.querySelector('.itemMidPrice');
  const quickPriceElement = listingRow.querySelector('.itemQuickSell');

  const priceLoadingCheckBoxes = document.querySelector('.priceLoadingCheckboxes');

  const loadLowestListingPrice = priceLoadingCheckBoxes.querySelector('#lowestListingCheckBox').checked;
  const loadMidPrice = priceLoadingCheckBoxes.querySelector('#midPriceCheckBox').checked;
  const loadInstantSellPrice = priceLoadingCheckBoxes.querySelector('#instantSellCheckBox').checked;

  // check if price is already set or in progress
  if (loadLowestListingPrice && startingAtElement.getAttribute('data-price-set') !== true
    && startingAtElement.getAttribute('data-price-in-progress') !== true) {
    startingAtElement.setAttribute('data-price-in-progress', true.toString());
    startingAtElement.innerText = 'Loading...';
    quickPriceElement.innerText = 'Loading...';

    priceQueue.jobs.push({
      type: 'inventory_mass_sell_starting_at',
      appID: item.appid,
      contextID: item.contextid,
      assetID: item.assetid,
      market_hash_name: item.market_hash_name,
      retries: 0,
      callBackFunction: addStartingAtAndQuickSellPrice,
    });
    workOnPriceQueue();
  }

  // check if price is already set or in progress
  if (loadInstantSellPrice && instantElement.getAttribute('data-price-set') !== true
    && instantElement.getAttribute('data-price-in-progress') !== true) {
    instantElement.setAttribute('data-price-in-progress', true.toString());
    instantElement.innerText = 'Loading...';

    priceQueue.jobs.push({
      type: 'inventory_mass_sell_instant_sell',
      appID: item.appid,
      contextID: item.contextid,
      assetID: item.assetid,
      market_hash_name: item.market_hash_name,
      retries: 0,
      callBackFunction: addInstantSellPrice,
    });
    workOnPriceQueue();
  }

  // check if price is already set or in progress
  if (loadMidPrice && midPriceElement.getAttribute('data-price-set') !== true
    && midPriceElement.getAttribute('data-price-in-progress') !== true) {
    midPriceElement.setAttribute('data-price-in-progress', true.toString());
    midPriceElement.innerText = 'Loading...';

    priceQueue.jobs.push({
      type: 'inventory_mass_sell_mid_price',
      appID: item.appid,
      contextID: item.contextid,
      assetID: item.assetid,
      market_hash_name: item.market_hash_name,
      retries: 0,
      callBackFunction: addMidPrice,
    });
    workOnPriceQueue();
  }
};

const updateSelectedItemsSummary = () => {
  const selectedItems = document.getElementById('inventories').querySelectorAll('.item.cstSelected');
  const numberOfSelectedItems = selectedItems.length;
  let selectedTotal = 0;

  document.getElementById('numberOfItemsToSell').innerText = numberOfSelectedItems.toString();

  selectedItems.forEach((itemElement) => {
    const IDs = getIDsFromElement(itemElement, 'inventory');
    const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
    if (item) {
      if (item.price) selectedTotal += parseFloat(item.price.price);
      if (item.marketable === 1) {
        const listingRow = getListingRow(item.appid, item.contextid, item.market_hash_name);

        if (listingRow === null) {
          addListingRow(item);
          addToPriceQueueIfNeeded(item);
        } else {
          const previIDs = listingRow.getAttribute('data-ids');
          if (!previIDs.includes(`${item.appid}_${item.contextid}_${item.assetid}`)) {
            const dataIDs = previIDs.length === 0
              ? `${item.appid}_${item.contextid}_${item.assetid}`
              : `${previIDs},${item.appid}_${item.contextid}_${item.assetid}`;

            listingRow.setAttribute('data-ids', dataIDs);
            listingRow.querySelector('.itemAmount')
              .querySelector('input').value = (previIDs.split(',').length + 1).toString();
          }
        }
      }
    }
  });

  removeUnselectedItemsFromTable();
  updateMassSaleTotal();

  chrome.storage.local.get('currency', (result) => {
    document.getElementById('selectedTotalValue').innerText = prettyPrintPrice(result.currency, selectedTotal);
  });
};

const listenSelectClicks = (event) => {
  if (event.target.parentElement.classList.contains('item')
    && event.target.parentElement.parentElement.classList.contains('itemHolder')) {
    if (event.ctrlKey) {
      const IDs = getIDsFromElement(event.target.parentNode, 'inventory');
      const marketHashNameToLookFor = getItemByIDs(
        items,
        IDs.appID,
        IDs.contextID,
        IDs.assetID,
      ).market_hash_name;

      document.getElementById('inventories').querySelectorAll('.item')
        .forEach((itemEl) => {
          const itemIDs = getIDsFromElement(itemEl, 'inventory');
          const item = getItemByIDs(items, itemIDs.appID, itemIDs.contextID, itemIDs.assetID);
          if (item && item.market_hash_name === marketHashNameToLookFor
            && IDs.appID === itemIDs.appID) {
            itemEl.classList.toggle('cstSelected');
          }
        });
    } else event.target.parentElement.classList.toggle('cstSelected');
    updateSelectedItemsSummary();
  }
};

const sortItems = (inventoryItems, method) => {
  const activeAppID = getActiveInventoryAppID();
  if (activeAppID === steamApps.CSGO.appID) {
    const itemElements = document.querySelectorAll('.item.app730.context2');
    const inventoryPages = document.getElementById(`inventory_${getInventoryOwnerID()}_730_2`).querySelectorAll('.inventory_page');
    doTheSorting(inventoryItems, Array.from(itemElements), method, Array.from(inventoryPages), 'inventory');
    addPerItemInfo(activeAppID);
  }
};

const doInitSorting = () => {
  chrome.storage.local.get('inventorySortingMode', (result) => {
    sortItems(items, result.inventorySortingMode);
    document.querySelector(`#sortingMethod [value="${result.inventorySortingMode}"]`).selected = true;
    document.querySelector(`#generate_sort [value="${result.inventorySortingMode}"]`).selected = true;
    addFloatIndicatorsToPage();
    addRealTimePricesToQueue();
  });
};

const generateItemsList = () => {
  const generateSorting = document.getElementById('generate_sort');
  const sortingMode = generateSorting.options[generateSorting.selectedIndex].value;
  const sortedItems = doTheSorting(items,
    Array.from(document.querySelectorAll('.item.app730.context2')),
    sortingMode, null, 'simple_sort');
  let copyText = '';

  const delimiter = document.getElementById('generate_delimiter').value;

  const limit = document.getElementById('generate_limit').value;

  const exteriorSelect = document.getElementById('generate_exterior');
  const exteriorSelected = exteriorSelect.options[exteriorSelect.selectedIndex].value;
  const exteriorType = exteriorSelected === 'full' ? 'name' : 'short';

  const showPrice = document.getElementById('generate_price').checked;
  const showTradability = document.getElementById('generate_tradability').checked;
  const includeDupes = document.getElementById('generate_duplicates').checked;
  const includeNonMarketable = document.getElementById('generate_non_market').checked;
  const selectedOnly = document.getElementById('selected_only').checked;
  const includeItemLinks = document.getElementById('include_inventory_links').checked;

  let lineCount = 0;
  let characterCount = 0;
  const namesAlreadyInList = [];

  let csvContent = 'data:text/csv;charset=utf-8,';
  const headers = `Name,Exterior${showPrice ? ',Price' : ''}${showTradability ? ',Tradability' : ''}${includeDupes ? '' : ',Duplicates'}\n`;
  csvContent += headers;

  sortedItems.forEach((itemElement) => {
    const IDs = getIDsFromElement(itemElement, 'inventory');
    const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
    const customName = isDopplerInName(item.name)
      ? `${item.name} (${item.dopplerInfo.name})`
      : item.name;
    const price = (showPrice && item.price !== null) ? ` ${delimiter} ${item.price.display}` : '';
    const priceCSV = (showPrice && item.price !== null) ? `,${item.price.display}` : '';
    const exterior = (item.exterior !== undefined && item.exterior !== null) ? item.exterior[exteriorType] : '';
    const tradableAt = new Date(item.tradability).toString().split('GMT')[0];
    const inventoryLink = `https://steamcommunity.com/profiles/${item.owner}/inventory/#${item.appid}_${item.contextid}_${item.assetid}`;
    const itemInventoryLink = includeItemLinks ? `${delimiter} ${inventoryLink}` : '';
    const tradability = (showTradability && tradableAt !== 'Invalid Date') ? `${delimiter} ${tradableAt}` : '';
    const tradabilityCSV = (showTradability && tradableAt !== 'Invalid Date') ? `,${tradableAt}` : '';
    const duplicate = (!includeDupes && item.duplicates.num !== 1) ? `${delimiter} x${item.duplicates.num}` : '';
    const duplicateCSV = (!includeDupes && item.duplicates.num !== 1) ? `,x${item.duplicates.num}` : '';
    const line = `${includeDupes ? customName : item.name} ${delimiter} ${exterior}${price}${tradability} ${duplicate} ${itemInventoryLink}\n`;
    const lineCSV = `"${includeDupes ? customName : item.name}",${exterior}${priceCSV}${tradabilityCSV}${duplicateCSV}\n`;

    if (lineCount < limit) {
      if (includeDupes || (!includeDupes && !namesAlreadyInList.includes(item.market_hash_name))) {
        if (((!includeNonMarketable && item.tradability !== 'Not Tradable')
          || (item.tradability === 'Not Tradable' && includeNonMarketable))
          && (!selectedOnly || (selectedOnly && itemElement.classList.contains('cstSelected')))) {
          namesAlreadyInList.push(item.market_hash_name);
          copyText += line;
          csvContent += lineCSV;
          characterCount += line.length;
          lineCount += 1;
        }
      }
    }
  });
  
  const encodedURI = encodeURI(csvContent);
  const downloadButton = document.getElementById('generate_download');
  downloadButton.setAttribute('href', encodedURI);
  downloadButton.classList.remove('hidden');
  downloadButton.setAttribute('download', `${getInventoryOwnerID()}_csgo_items.csv`);

  copyToClipboard(copyText);

  document.getElementById('generation_result')
    .innerText = `${lineCount} lines (${characterCount} chars) generated and copied to clipboard`;
};

const addFunctionBar = () => {
  if (document.getElementById('inventory_function_bar') === null) {
    const handPointer = chrome.runtime.getURL('images/hand-pointer-solid.svg');
    const table = chrome.runtime.getURL('images/table-solid.svg');

    document.querySelector('.filter_ctn.inventory_filters').insertAdjacentHTML(
      'afterend',
      // DOMPurify sanitization breaks the svg icons and
      // the rest is static anyways, no external data here
      `<div id="inventory_function_bar">
                <div id="functionBarValues" class="functionBarRow">
                    <span id="selectedTotal"><span>Selected Items Value: </span><span id="selectedTotalValue">0.00</span></span>
                    <span id="inventoryTotal"><span>Total Inventory Value: </span><span id="inventoryTotalValue">0.00</span></span>
                </div>
                    <div id="functionBarActions" class="functionBarRow">
                        <span id="selectMenu">
                            <img id ="selectButton" class="clickable" src="${handPointer}" title="Start Selecting Items">
                        </span>
                        <span id="generate_menu">
                            <img id ="generate_list" class="clickable" src="${table}" title="Generate list of inventory items"
                        </span>
                        <div id="sortingMenu">
                            <span>Sorting:</span>
                            <select id="sortingMethod">
                            </select>
                        </div>
                    </div>
                    <div id="functionBarSelectionMenu" class="functionBarRow hidden">
                        <span id="selectAllPage" class="clickable underline" title="Select all the items on the page" style="margin-right: 30px">
                            Select All Page
                        </span>
                        <span id="selectAllUnder" class="clickable underline" title="Select all items under this price">Select all under:</span>
                        <input type="number" id="selectUnder" min="0" style="width: 50px" title="The items that are cheaper than this value will be selected, in your currency">
                    </div>
                    <div id="functionBarGenerateMenu" class="functionBarRow hidden">
                        <div>
                            <span>Generate list of inventory items (for posting in groups, trading forums, etc.) </span>
                            <span id="generate_button" class="clickable">Generate</span> 
                        </div>
                            
                            <div id="generate_options">
                                <span>Delimiter</span>
                                <input id="generate_delimiter" value="-">
                                <span>Exterior:</span>
                                <select id="generate_exterior">
                                    <option value="full">Full length</option>
                                    <option value="short">Shortened</option>
                                </select>
                                
                                <span><b>Show:</b> Price</span>
                                <input type="checkbox" id="generate_price">
                                <span> Tradability</span>
                                <input type="checkbox" id="generate_tradability">
                                <span><b>Include:</b> Duplicates</span>
                                <input id="generate_duplicates" type="checkbox" checked>
                                <span>Non-Marketable</span>
                                <input id="generate_non_market" type="checkbox">
                                <span>Selected only</span>
                                <input id="selected_only" type="checkbox" checked>
                                <span title="Only works with copy to clipboard, not .csv download">Links</span>
                                <input id="include_inventory_links" type="checkbox" checked>
                            </div>
                            
                            <div>
                                <b>Sort:</b>
                                <select id="generate_sort"></select>
                                <b>Limit result to:</b>
                                <input id="generate_limit" type="number" value="10000" min="1" max="10000">
                            </div>
                            <div>
                                <span id="generation_result"></span>
                                <a class="hidden" id="generate_download" href="" download="inventory_items.csv">Download .csv</a> 
                            </div>
                    </div>
                    <div id="massListing" class="hidden">
                      <h2 id="massListingTitle" class="hidden">Market Mass Listing</h2>
                      <div class="hidden not_tradable" id="currency_mismatch_warning">
                      Warning: Your Steam Wallet currency and CSGO Trader currency are not the same.
                      This is an untested scenario that is not recommended. 
                      Make sure you double check the listing prices when confirming the sales on your phone if you use it like this.
                      <span class="underline clickable" id="changeCurrency">Click here to fix this</span></div>
                          <div id="listingTable" class="table">
                              <div class="header">
                                <div class="cell" title="The name of the item">Name</div>
                                <div class="cell" title="How many of these type of items are set to be sold">Quantity</div>
                                <div class="cell" title="The price provided by the pricing provider you have selected in the options">Ext. price</div>
                                <div class="cell" title="The price of the current lowest listing for this item on Steam Community Market">Starting at</div>
                                <div class="cell" title="Just below the starting at price, using it will make your listing the cheapest">Quick sell</div>
                                <div class="cell" title="The average price of the ask and bid prices">Mid price</div>
                                <div class="cell" title="The price of the current highest buy order, your item should sell right after you list it">Instant Sell</div>
                                <div class="cell" title="Price specified by you">Your price</div>
                              </div>
                              <div class="rowGroup"></div>
                              <div class="priceLoadingCheckboxes row">
                                <div class="cell" title="Tick the boxes where you want prices loaded">Load prices for:</div>
                                <div class="cell"></div>
                                <div class="cell"></div>
                                <div class="cell"><input type="checkbox" id="lowestListingCheckBox" checked/></div>
                                <div class="cell">Based on startint at</div>
                                <div class="cell"><input type="checkbox" id="midPriceCheckBox" checked/></div>
                                <div class="cell"><input type="checkbox" id="instantSellCheckBox" checked/></div>
                                <div class="cell"></div>
                              </div>
                          </div>
                          <span class="beforeStart">
                              <span style="font-weight: bold">Total:</span><span id="numberOfItemsToSell">0</span> item(s) selected worth <span id="saleTotal">0</span>
                               that is <span id="saleTotalAfterFees">0</span> after market fees
                              <span id="startListMenu" class="hidden">
                                <span id="sellButton" class="clickable" title="Start the mass listing of the selected items">List Items</span>
                                <span id="startOnLoad">
                                  <span title="Start listing the items automatically when all the pricing info has been loaded">
                                      Start on price load
                                  </span>
                                  <input type="checkbox" id="startListingOnPriceLoad">
                                </span>
                              </span>
                          </span>
                          <span class="inProgress hidden">
                              Listing of <span id="remainingItems">0</span>/<span id="totalItems">0</span> in progress.
                              <span class="hidden not_tradable" id="massSaleRetry">Retrying in 5 seconds</span>
                              <span id="stopSale" class="clickable" title="Stop listing" data-stopped="false">Stop Listing</span>
                          </span>
                          <div id="massSellError" class="hidden not_tradable"></div>
                    </div>
                </div>`,
    );

    document.getElementById('selectAllPage').addEventListener('click', () => {
      const inventories = document.getElementById('inventories');
      if (inventories) {
        inventories.querySelectorAll('.inventory_page').forEach((page) => {
          if (page.style.display === 'block' || page.style.display === '') {
            page.querySelectorAll('.item').forEach((item) => {
              if (!item.classList.contains('cstSelected')) item.classList.add('cstSelected');
            });
          }
        });
        updateSelectedItemsSummary();
      }
    });

    document.getElementById('selectAllUnder').addEventListener('click', () => {
      const underThisPrice = parseFloat(document.getElementById('selectUnder').value);
      document.getElementById('tabcontent_inventory').querySelectorAll('.item').forEach((itemElement) => {
        const IDs = getIDsFromElement(itemElement, 'inventory');
        const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
        if (item !== undefined && parseFloat(item.price.price) < underThisPrice
          && !itemElement.classList.contains('cstSelected') && item.marketable === 1) {
          itemElement.classList.add('cstSelected');
        }
      });
      updateSelectedItemsSummary();
    });

    document.getElementById('sellButton').addEventListener('click',
      () => {
        startMassSelling();
      });

    document.querySelectorAll('#lowestListingCheckBox, #midPriceCheckBox, #instantSellCheckBox').forEach((checkBox) => {
      checkBox.addEventListener('change', (event) => {
        if (event.target.checked) {
          for (const listingRow of document.getElementById('listingTable').querySelector('.rowGroup').querySelectorAll('.row')) {
            const ID = listingRow.getAttribute('data-ids').split(',')[0];
  
            addToPriceQueueIfNeeded({
              market_hash_name: listingRow.getAttribute('data-item-name').split('_')[2],
              appid: ID.split('_')[0],
              contextid: ID.split('_')[1],
              assetid: ID.split('_')[2],
            });
          }
        } else {
          let type = '';

          if (event.target.id === 'lowestListingCheckBox') {
            type = 'inventory_mass_sell_starting_at';
          } else if (event.target.id === 'midPriceCheckBox') {
            type = 'inventory_mass_sell_mid_price';
          } else if (event.target.id === 'instantSellCheckBox') {
            type = 'inventory_mass_sell_instant_sell';
          }

          priceQueue.jobs = priceQueue.jobs.filter((job) => {
            return job.type !== type;
          });
        }
      });
    });

    document.getElementById('stopSale').setAttribute('data-stopped', 'true');

    document.getElementById('stopSale').addEventListener('click',
      (event) => {
        event.target.setAttribute('data-stopped', 'true');
      });

    // shows currency mismatch warning and option to change currency
    chrome.storage.local.get('currency', ({ currency }) => {
      const walletCurrency = getSteamWalletCurrency();
      if (walletCurrency !== currency) {
        document.getElementById('currency_mismatch_warning').classList.remove('hidden');
        document.getElementById('changeCurrency').addEventListener('click', () => {
          chrome.storage.local.set({ currency: walletCurrency }, () => {
            chrome.runtime.sendMessage({ updateExchangeRates: 'updateExchangeRates' }, (() => {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }));
          });
        });
      }
    });

    const sortingSelect = document.getElementById('sortingMethod');
    const generateSortingSelect = document.getElementById('generate_sort');

    const keys = Object.keys(sortingModes);

    for (const key of keys) {
      const option = document.createElement('option');
      option.value = sortingModes[key].key;
      option.text = sortingModes[key].name;
      sortingSelect.add(option);
      generateSortingSelect.add(option.cloneNode(true));
    }

    document.getElementById('selectButton').addEventListener('click',
      (event) => {
        chrome.storage.local.get('showSelectedItemsTable', ({ showSelectedItemsTable }) => {
          const selectMenu = document.getElementById('functionBarSelectionMenu');
          if (event.target.classList.contains('selectionActive')) {
            unselectAllItems();
            updateSelectedItemsSummary();
            event.target.classList.remove('selectionActive');
            selectMenu.classList.add('hidden');
            document.getElementById('massListing').classList.add('hidden');

            if (isOwnInventory()) {
              document.getElementById('massListingTitle').classList.add('hidden');
              document.getElementById('startListMenu').classList.add('hidden');
              document.getElementById('listingTable').querySelector('.rowGroup').innerHTML = '';
            }
            document.body.removeEventListener('click', listenSelectClicks, false);
          } else {
            // clears the price queue so the user does not have to wait for
            // real time prices to load before the listings prices do
            priceQueue.jobs = [];
            priceQueue.active = false;

            document.body.addEventListener('click', listenSelectClicks, false);
            event.target.classList.add('selectionActive');

            if (isOwnInventory() || showSelectedItemsTable) {
              document.getElementById('massListing').classList.remove('hidden');
              selectMenu.classList.remove('hidden');
            }
            if (isOwnInventory()) {
              document.getElementById('massListingTitle').classList.remove('hidden');
              document.getElementById('startListMenu').classList.remove('hidden');
            }
          }
        });
      });

    sortingSelect.addEventListener('change', () => {
      sortItems(items, sortingSelect.options[sortingSelect.selectedIndex].value);
      addFloatIndicatorsToPage();
      addRealTimePricesToQueue();
    });

    document.getElementById('generate_list').addEventListener('click', () => { document.getElementById('functionBarGenerateMenu').classList.toggle('hidden'); });

    document.getElementById('generate_button').addEventListener('click', generateItemsList);
  } else setTimeout(() => { setInventoryTotal(); }, 1000);
};

const loadFullInventory = () => {
  if (!isSIHActive()) {
    if (document.querySelector('body').getAttribute('allItemsLoaded') === null) {
      const loadFullInventoryScript = `
                g_ActiveInventory.LoadCompleteInventory().done(function () {
                    for (let i = 0; i < g_ActiveInventory.m_cPages; i++) {
                        g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated();
                        g_ActiveInventory.PreloadPageImages(i);
                    }
                    document.querySelector('body').setAttribute('allItemsLoaded', true);
                });
                `;
      if (injectScript(loadFullInventoryScript, true, 'loadFullInventory', 'allItemsLoaded') === null) {
        setTimeout(() => {
          loadFullInventory();
        }, 2000);
      } else doInitSorting();
    } else doInitSorting();
  } else doInitSorting();
};

// sends a message to the "back end" to request inventory contents
const requestInventory = (appID) => {
  const inventoryOwnerID = getInventoryOwnerID();
  if (appID === steamApps.CSGO.appID) {
    chrome.runtime.sendMessage({ inventory: inventoryOwnerID }, (response) => {
      if (response !== 'error') {
        items = items.concat(response.items);
        inventoryTotal = response.total;
        addRightSideElements();
        addPerItemInfo(appID);
        setInventoryTotal();
        addFunctionBar();
        loadFullInventory();
        addPageControlEventListeners('inventory', () => {
          addFloatIndicatorsToPage();
          addRealTimePricesToQueue();
        });
      }
    });
  } else if (appID === steamApps.DOTA2.appID || appID === steamApps.TF2.appID) {
    chrome.runtime.sendMessage({
      getOtherInventory: {
        appID,
        steamID: inventoryOwnerID,
      },
    }, (response) => {
      if (response !== 'error') {
        items = items.concat(response.items);
        addRightSideElements();
        addPerItemInfo(appID);
        addFunctionBar();
        loadFullInventory();
        addPageControlEventListeners('inventory', () => {
          addFloatIndicatorsToPage();
          addRealTimePricesToQueue();
        });
      }
    });
  }
};

const updateTradabilityIndicators = () => {
  const itemElements = document.querySelectorAll('.item.app730.context2');
  if (itemElements.length !== 0) {
    itemElements.forEach((itemElement) => {
      const IDs = getIDsFromElement(itemElement, 'inventory');
      const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
      const itemDateElement = itemElement.querySelector('.perItemDate');

      if (itemDateElement !== null) {
        const previText = itemDateElement.innerText;
        const newText = getShortDate(item.tradability);
        itemDateElement.innerText = newText;

        if (previText !== 'T' && newText === 'T') {
          itemDateElement.classList.remove('not_tradable');
          itemDateElement.classList.add('tradable');
        }
      }
    });
  }
};

const hideOtherExtensionPrices = () => {
  // sih
  if (!document.hidden && isSIHActive()) {
    document.querySelectorAll('.price_flag').forEach((price) => {
      price.remove();
    });
  }

  setTimeout(() => {
    hideOtherExtensionPrices();
  }, 2000);
};

// keeps trying to load the items from the page
// for apps that don't require a separate inventory request
const loadInventoryItems = (appID, contextID) => {
  const inventory = getItemInfoFromPage(appID, contextID);
  if (inventory.length !== 0) {
    items = items.concat(inventory);
    addRealTimePricesToQueue();

    if (inventory.length === 75) {
      loadFullInventory();
      setTimeout(() => {
        loadInventoryItems(appID, contextID);
      }, 2000);
    }
  } else {
    setTimeout(() => {
      loadInventoryItems(appID, contextID);
    }, 1000);
  }
};

logExtensionPresence();
updateWalletCurrency();
initPriceQueue(onListingPricesLoaded);
chrome.storage.local.get('useAlternativeCSGOInventoryEndpoint', ({ useAlternativeCSGOInventoryEndpoint }) => {
  if (useAlternativeCSGOInventoryEndpoint) overRideCSGOInventoryLoading();
});

// listens to manual inventory tab/game changes
const inventoriesMenu = document.querySelector('.games_list_tabs');
if (inventoriesMenu !== null) {
  inventoriesMenu.querySelectorAll('.games_list_tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const appID = getActiveInventoryAppID();
      const contextID = getDefaultContextID(appID);
      if (appID === steamApps.CSGO.appID || appID === steamApps.DOTA2.appID
        || appID === steamApps.TF2.appID) {
        requestInventory(appID);
      } else {
        loadInventoryItems(appID, contextID);
      }
    });
  });
}

// mutation observer observes changes on the right side of the inventory interface
// this is a workaround for waiting for ajax calls to finish when the page changes
const observer = new MutationObserver(() => {
  addRightSideElements();
  addFunctionBar();
  if (getActiveInventoryAppID() !== steamApps.CSGO.appID) {
    // unhides "tags" in non-csgo inventories
    document.querySelectorAll('#iteminfo1_item_tags, #iteminfo0_item_tags, #iteminfo1_item_owner_descriptors, #iteminfo0_item_owner_descriptors')
      .forEach((tagsElement) => {
        tagsElement.classList.remove('hidden');
      });
  }
});

let observer2LastTriggered = Date.now() - 501;
// the mutation observer is only allowed to trigger the logic twice a second
// this is to save on cpu cycles
const observer2 = new MutationObserver(() => {
  if (Date.now() > observer2LastTriggered + 500) {
    addPerItemInfo(getActiveInventoryAppID());
  }
  observer2LastTriggered = Date.now();
});

// does not execute if inventory is private or failed to load the page
// (502 for example, mostly when steam is dead)
if (document.getElementById('no_inventories') === null
  && document.getElementById('iteminfo0') !== null) {
  observer.observe(document.getElementById('iteminfo0'), {
    subtree: false,
    attributes: true,
  });

  observer2.observe(document.getElementById('inventories'), {
    subtree: false,
    attributes: true,
  });
}

repositionNameTagIcons();
addSearchListener('inventory', () => {
  addFloatIndicatorsToPage();
  addRealTimePricesToQueue();
});
overridePopulateActions();
updateLoggedInUserInfo();
updateLoggedInUserName();
addUpdatedRibbon();

if (isOwnInventory()) {
  const moreLink = document.getElementById('inventory_more_link');
  if (moreLink !== null) {
    moreLink.addEventListener('click', () => {
      chrome.runtime.sendMessage({ hasTabsAccess: 'hasTabsAccess' }, ((response) => {
        if (response) {
          const dropDownMenu = document.getElementById('inventory_more_dropdown');
          const viewTradeHistory = document.getElementById('viewTradeHistory');
          if (dropDownMenu !== null && viewTradeHistory === null) {
            dropDownMenu.querySelector('.popup_body.popup_menu').insertAdjacentHTML(
              'afterbegin',
              DOMPurify.sanitize(
                '<a class="popup_menu_item" id="viewTradeHistory">Trade History (CSGO Trader)</a>',
              ),
            );
            document.getElementById('viewTradeHistory').addEventListener('mouseup', () => {
              chrome.runtime.sendMessage({ openInternalPage: 'index.html?page=trade-history' }, () => {});
            });
          }
        }
      }));
    });
  }
  changePageTitle('own_inventory');
  // injects selling script if own inventory
} else {
  changePageTitle('inventory');
  // shows trade offer history summary
  chrome.storage.local.get(
    ['tradeHistoryInventory', `offerHistory_${getInventoryOwnerID()}`, 'apiKeyValid'],
    (result) => {
      let offerHistory = result[`offerHistory_${getInventoryOwnerID()}`];
      const header = document.querySelector('.profile_small_header_text');

      if (result.tradeHistoryInventory) {
        if (offerHistory === undefined) {
          offerHistory = {
            offers_received: 0,
            offers_sent: 0,
            last_received: 0,
            last_sent: 0,
          };
        }

        if (header !== null) {
          if (result.apiKeyValid) {
            header.insertAdjacentHTML('beforeend',
              DOMPurify.sanitize(
                `<div class="trade_partner_info_block"> 
                        <div title="${dateToISODisplay(offerHistory.last_received)}">
                          Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? prettyTimeAgo(offerHistory.last_received) : '-'}
                        </div>
                        <div title="${dateToISODisplay(offerHistory.last_sent)}">
                          Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? prettyTimeAgo(offerHistory.last_sent) : '-'}
                        </div>
                     </div>`,
              ));
          } else {
            header.insertAdjacentHTML('beforeend',
              DOMPurify.sanitize(
                `<div class="trade_partner_info_block" style="color: lightgray"> 
                        <div>
                          <b>CSGOTrader Extension:</b> It looks like you don't have your Steam API Key set yet.
                        </div>
                        <div>
                          If you had that you would see partner offer history here. Check the <a href="https://csgotrader.app/release-notes#1.23">Release Notes</a> for more info.
                        </div>
                      </div>`,
              ));
          }
        }
      }
    },
  );
}

chrome.storage.local.get('hideOtherExtensionPrices', (result) => {
  if (result.hideOtherExtensionPrices) hideOtherExtensionPrices();
});

const activeInventoryAppID = getActiveInventoryAppID();
if (activeInventoryAppID === steamApps.CSGO.appID
  || activeInventoryAppID === steamApps.DOTA2.appID
  || activeInventoryAppID === steamApps.TF2.appID) {
  requestInventory(activeInventoryAppID);
} else loadInventoryItems(activeInventoryAppID, getDefaultContextID(activeInventoryAppID));

// to refresh the trade lock remaining indicators
setInterval(() => {
  if (!document.hidden) updateTradabilityIndicators();
}, 60000);

reloadPageOnExtensionReload();
