import DOMPurify from 'dompurify';

import {
  addPageControlEventListeners, getItemByAssetID, changePageTitle,
  getAssetIDOfElement, makeItemColorful, addDopplerPhase, addFadePercentage,
  addSSTandExtIndicators, addFloatIndicator, addPriceIndicator,
  getDataFilledFloatTechnical, souvenirExists, copyToClipboard,
  getFloatBarSkeleton, addUpdatedRibbon, updateLoggedInUserName,
  logExtensionPresence, refreshSteamAccessToken, parseCharmInfo,
  updateLoggedInUserInfo, isSIHActive, getActivePage,
  addSearchListener, getPattern, removeFromArray, getFloatAsFormattedString,
  addPaintSeedIndicator, addFloatRankIndicator, getFloatDBLink,
  parseStickerInfo, getInspectLink, getExteriorFromTags, getDopplerInfo,
  getType, getQuality, getNameTag, getBuffLink, getPricempireLink,
}
  from 'utils/utilsModular';
import {
  getItemMarketLink, isDopplerInName, getCollection,
  reloadPageOnExtensionUpdate,
} from 'utils/simpleUtils';
import { getShortDate, dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import {
  stattrak, starChar, souvenir, stattrakPretty, genericMarketLink,
} from 'utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import {
  getPriceAfterFees, userPriceToProperPrice,
  centsToSteamFormattedPrice, prettyPrintPrice, addRealTimePriceToPage,
  priceQueue, workOnPriceQueue, getSteamWalletCurrency, initPriceQueue,
  updateWalletCurrency, getHighestBuyOrder, getLowestListingPrice,
  getPrice, getStickerPriceTotal,
}
  from 'utils/pricing';
import { getItemByIDs, getIDsFromElement, findElementByIDs } from 'utils/itemsToElementsToItems';
import { listItem } from 'utils/market';
import { sortingModes } from 'utils/static/sortingModes';
import doTheSorting from 'utils/sorting';
import { overridePopulateActions } from 'utils/steamOverriding';
import itemTypes from 'utils/static/itemTypes';
import exteriors from 'utils/static/exteriors';
import { injectScript } from 'utils/injection';
import { getUserSteamID } from 'utils/steamID';
import { inOtherOfferIndicator } from 'utils/static/miscElements';
import steamApps from 'utils/static/steamApps';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { getFloatInfoFromCache } from '../../utils/floatCaching';

const inventoryPageSize = 25;
let pricePercentage = 100; // can be changed, for easier discount calculation
let items = [];
let inventoryTotal = 0.0;
const inventoryTotalsAdded = []; // context ids that have been added to the total
let floatDigitsToShow = 4;
let showPaintSeeds = false;
let showFloatRank = false;
let showContrastingLook = true;
let showDuplicates = true;
let showAllExteriorsMenu = false;
let addInstantSellButton = false;
let safeInstantAndQuickSellFlag = true;
// variables for the countdown recursive logic
let countingDown = false;
let countDownID = '';

const floatBar = getFloatBarSkeleton('inventory');
const upperModule = `
<div class="upperModule">
    <div class="descriptor customStickers"></div>
    <div class="duplicate"></div>
    <div class="copyButtons"></div>
    <div class="patternInfo"></div>
    ${floatBar}
</div>
`;

const lowerModule = `<a class="lowerModule">
    <div class="descriptor tradability tradabilityDiv"></div>
    <div class="descriptor countdown"></div>
    <div class="descriptor tradability bookmark">Bookmark and Notify</div>
</a>`;

const tradable = '<span class="tradable">Tradable</span>';
const notTradable = '<span class="not_tradable">Not Tradable</span>';
const tradeLocked = '<span class="not_tradable">Tradelocked</span>';

const updateDuplicateCounts = () => {
  items.forEach((item) => {
    const duplicates = items.filter((i) => i.market_hash_name === item.market_hash_name);
    item.duplicates.num = duplicates.length;
    item.duplicates.instances = duplicates.map((it) => it.assetid);
  });
};

const showListingError = (errorEl, message) => {
  errorEl.innerText = message;
  errorEl.classList.remove('doHide');
};

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

const inventoryOwnerID = getInventoryOwnerID();
const loggedInUserID = getUserSteamID();

// works in inventory and profile pages
const isOwnInventory = () => {
  return loggedInUserID === inventoryOwnerID;
};

const getActiveInventoryAppID = () => {
  const activeTab = document.querySelector('.games_list_tab.active');
  if (activeTab) return activeTab.getAttribute('href').split('#')[1];
  return null;
};

const gotToNextInventoryPage = () => {
  const nextPageButton = document.getElementById('pagebtn_next');
  if (nextPageButton !== null && !nextPageButton.classList.contains('disabled')) nextPageButton.click();
};

const goToPreviousInventoryPage = () => {
  const previPageButton = document.getElementById('pagebtn_previous');
  if (previPageButton !== null && !previPageButton.classList.contains('disabled')) previPageButton.click();
};

const cleanUpElements = () => {
  document.querySelectorAll(
    '.upperModule, .lowerModule, .inTradesInfoModule, .otherExteriors, .custom_name,.startingAtVolume,.marketActionInstantSell, .marketActionQuickSell, .listingError, .pricEmpireLink, .buffLink, .inspectOnServer, .multiSellLink, .floatDBLink, .inbrowserInspectLink',
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
    owner: inventoryOwnerID,
    comment: '',
    notify: true,
    notifTime: item.tradability.toString(),
    notifType: 'chrome',
  };

  chrome.storage.local.get('bookmarks', ({ bookmarks }) => {
    chrome.storage.local.set({ bookmarks: [...bookmarks, bookmark] }, () => {
      if (bookmark.itemInfo.tradability !== 'Tradable' && bookmark.itemInfo.tradability !== 'Tradelocked') {
        chrome.runtime.sendMessage({
          setAlarm: {
            name: `${bookmark.itemInfo.appid}_${bookmark.itemInfo.contextid}_${bookmark.itemInfo.assetid}_${bookmark.added}`,
            when: bookmark.itemInfo.tradability,
          },
        }, () => { });
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
                  appid: asset.appid.toString(),
              });
            }
        }
        document.querySelector('body').setAttribute('inventoryInfo', JSON.stringify(trimmedAssets));`;
  return JSON.parse(injectScript(getItemsScript, true, 'getInventory', 'inventoryInfo'));
};

const getCSGOInventoryDataFromPage = () => new Promise((resolve) => {
  chrome.storage.local.get(
    ['itemPricing', 'prices', 'currency', 'exchangeRate', 'pricingProvider', 'pricingMode'],
    ({
      itemPricing, prices, currency, exchangeRate, pricingProvider, pricingMode,
    }) => {
      const itemsFromPage = getItemInfoFromPage(steamApps.CSGO.appID, '2').sort((a, b) => {
        return parseInt(b.assetid) - parseInt(a.assetid);
      });
      const itemsPropertiesToReturn = [];
      const duplicates = {};
      const owner = inventoryOwnerID;
      const floatCacheAssetIDs = [];

      // counts duplicates
      itemsFromPage.forEach((item) => {
        floatCacheAssetIDs.push(item.assetid);

        const marketHashName = item.description.market_hash_name;
        if (duplicates[marketHashName] === undefined) {
          const instances = [item.assetid];
          duplicates[marketHashName] = {
            num: 1,
            instances,
          };
        } else {
          duplicates[marketHashName].num += 1;
          duplicates[marketHashName].instances.push(item.assetid);
        }
      });

      getFloatInfoFromCache(floatCacheAssetIDs).then(
        (floatCache) => {
          inventoryTotal = 0;
          itemsFromPage.forEach((item, index) => {
            const assetID = item.assetid;
            const name = item.description.name;
            const marketHashName = item.description.market_hash_name;
            let tradability = 'Tradable';
            let tradabilityShort = 'T';
            const icon = item.description.icon_url;
            const dopplerInfo = (name.includes('Doppler') || name.includes('doppler')) ? getDopplerInfo(icon) : null;
            const stickers = parseStickerInfo(item.description.descriptions, 'direct', prices, pricingProvider, pricingMode, exchangeRate, currency);
            const charms = parseCharmInfo(item.description.descriptions, 'direct', prices, pricingProvider, pricingMode, exchangeRate, currency);
            let price = null;
            const type = getType(item.description.tags);
            let floatInfo = null;

            if (floatCache[assetID] !== undefined
              && floatCache[assetID] !== null && itemTypes[type.key].float) {
              floatInfo = floatCache[assetID];
            }
            const patternInfo = (floatInfo !== null)
              ? getPattern(marketHashName, floatInfo.paintseed)
              : null;

            if (itemPricing) {
              price = getPrice(marketHashName, dopplerInfo, prices,
                pricingProvider, pricingMode, exchangeRate, currency);
              inventoryTotal += parseFloat(price.price);
            } else price = { price: '', display: '' };

            if (item.description.tradable === 0) {
              tradability = 'Tradelocked';
              tradabilityShort = 'L';
            }
            if (item.description.marketable === 0) {
              tradability = 'Not Tradable';
              tradabilityShort = '';
            }

            itemsPropertiesToReturn.push({
              description: item.description,
              name,
              market_hash_name: marketHashName,
              name_color: item.description.name_color,
              marketlink: getItemMarketLink(steamApps.CSGO.appID, marketHashName),
              appid: item.appid.toString(),
              contextid: '2',
              classid: item.classid,
              instanceid: item.instanceid,
              assetid: assetID,
              commodity: item.description.commodity,
              tradability,
              tradabilityShort,
              marketable: item.description.marketable,
              iconURL: icon,
              dopplerInfo,
              exterior: getExteriorFromTags(item.description.tags),
              inspectLink: getInspectLink({
                actions: item.description.actions,
                owner,
                assetid: assetID,
              }, owner, assetID),
              quality: getQuality(item.description.tags),
              isStatrack: name.includes('StatTrak™'),
              isSouvenir: name.includes('Souvenir'),
              starInName: name.includes('★'),
              stickers,
              stickerPrice: getStickerPriceTotal(stickers, currency),
              charms,
              charmPrice: getStickerPriceTotal(charms, currency),
              totalAddonPrice: getStickerPriceTotal([...stickers, ...charms], currency),
              nametag: getNameTag(item),
              duplicates: duplicates[marketHashName],
              owner,
              price,
              type,
              floatInfo,
              patternInfo,
              collection: getCollection(item.descriptions),
              position: index,
            });
          });
          resolve(itemsPropertiesToReturn);
        },
      );
    },
  );
});

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

  const position = (parseFloat(getFloatAsFormattedString(floatInfo.floatvalue, 2)) * 100) - 2;

  document.querySelectorAll('.floatToolTip').forEach((floatToolTip) => {
    floatToolTip.setAttribute('style', `left: ${position}%`);
  });
  document.querySelectorAll('.floatDropTarget').forEach((floatDropTarget) => {
    floatDropTarget.innerText = getFloatAsFormattedString(floatInfo.floatvalue, floatDigitsToShow);
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
const setStickerInfo = (stickers, charms) => {
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

  if (charms) {
    const charm = charms[0];

    if (charm && charm.pattern) {
      document.querySelectorAll('.customStickers').forEach((customStickers) => {
        const stickerSlots = customStickers.querySelectorAll('.stickerSlot');
        const charmEl = stickerSlots[stickerSlots.length - 1];

        if (charmEl !== undefined) {
          const currentToolTipText = charmEl.getAttribute('data-tooltip');
          charmEl.setAttribute('data-tooltip', `${currentToolTipText} - Pattern: #${charm.pattern}`);
        }
      });
    }
  }
};

// not used right now, inspecton server is a link now
// const setGenInspectInfo = (item) => {
//   const genCommand = generateInspectCommand(
//     item.market_hash_name, item.floatInfo.floatvalue, item.floatInfo.paintindex,
//     item.floatInfo.defindex, item.floatInfo.paintseed, item.floatInfo.stickers,
//   );

//   document.querySelectorAll('.inspectOnServer').forEach((inspectOnServerDiv) => {
//     const inspectGenCommandEl = inspectOnServerDiv.querySelector('.inspectGenCommand');
//     inspectGenCommandEl.title = 'Click to copy !gen command';

//     if (genCommand.includes('undefined')) {
//       // defindex was not used/stored before the inspect on server feature was introduced
//       // and it might not exists in the data stored in the float cache
//       // if that is the case then we clear it from cache
//       removeFromFloatCache(item.assetid);

//       // ugly timeout to get around making removeFromFloatCache async
//       setTimeout(() => {
//         floatQueue.jobs.push({
//           type: 'inventory_floatbar',
//           assetID: item.assetid,
//           inspectLink: item.inspectLink,
//           // they call each other and one of them has to be defined first
//           // eslint-disable-next-line no-use-before-define
//           callBackFunction: dealWithNewFloatData,
//         });

//         if (!floatQueue.active) workOnFloatQueue();
//       }, 1000);
//     } else inspectGenCommandEl.textContent = genCommand;
//     inspectGenCommandEl.setAttribute('genCommand', genCommand);
//   });
// };

const setFloatDBLinkURL = (item) => {
  const floatDBLookupURL = getFloatDBLink(item);

  document.querySelectorAll('.floatDBLink').forEach((floatDBLink) => {
    floatDBLink.querySelector('a').setAttribute('href', DOMPurify.sanitize(floatDBLookupURL));
  });
};

const updateFloatAndPatternElements = (item) => {
  setFloatBarWithData(item.floatInfo);
  setPatternInfo(item.patternInfo);
  setStickerInfo(item.floatInfo.stickers, item.floatInfo.charms);
  setFloatDBLinkURL(item);
};

const hideFloatBars = () => {
  document.querySelectorAll('.floatBar').forEach((floatBarElement) => {
    floatBarElement.classList.add('hidden');
  });
};

// also adds pattern
const addFloatDataToPage = (job, activeFloatQueue, floatInfo) => {
  if (floatInfo !== null && floatInfo !== undefined) {
    const itemElement = findElementByIDs(steamApps.CSGO.appID, '2', job.assetID, 'inventory');

    // add float and pattern info to page variable
    const item = getItemByAssetID(items, job.assetID);
    item.floatInfo = floatInfo;
    item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintseed);

    addFloatIndicator(itemElement, floatInfo, floatDigitsToShow, showContrastingLook);
    addFadePercentage(itemElement, item.patternInfo, showContrastingLook);
    if (showPaintSeeds) addPaintSeedIndicator(itemElement, item.floatInfo, showContrastingLook);
    if (showFloatRank) addFloatRankIndicator(itemElement, item.floatInfo, showContrastingLook);

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

const addRightSideElements = (reRun) => {
  const activeIDs = getIDsOfActiveItem();
  if (activeIDs !== null) {
    // cleans up previously added elements
    cleanUpElements();
    const item = getItemByIDs(items, activeIDs.appID, activeIDs.contextID, activeIDs.assetID);
    const activeInventoryAppID = getActiveInventoryAppID();

    // removes previously added listeners
    document.querySelectorAll('.showTechnical, .lowerModule, .marketActionInstantSell, .marketActionQuickSell, .copyItemID, .copyItemName, .copyItemLink').forEach((element) => {
      element.removeEventListener('click');
    });

    // adds float bar, sticker info
    const separators = document.querySelectorAll('.inventory_page_right [role="separator"][aria-orientation="horizontal"]');
    if (separators.length === 1 && !reRun) {
      setTimeout(() => addRightSideElements(true), 300);
    }
    separators.forEach((separator) => {
      separator.classList.add('doHide');
      document.querySelectorAll('.inventory_page_right [src$="protected_items_badge2.png"]').forEach((protectedBadge) => {
        protectedBadge.parentNode.parentNode.remove();
      });
      separator.insertAdjacentHTML('afterend', DOMPurify.sanitize(upperModule));
    });

    if (activeInventoryAppID !== steamApps.CSGO.appID) {
      document.querySelectorAll('.floatBar, .duplicate').forEach((unWantedElement) => {
        unWantedElement.remove();
      });
    }

    if (activeInventoryAppID === steamApps.CSGO.appID
      || activeInventoryAppID === steamApps.DOTA2.appID
      || activeInventoryAppID === steamApps.TF2.appID
    ) {
      if (item && showAllExteriorsMenu) {
        // it takes the visible item and checks if the collection includes souvenirs
        let textOfDescriptors = '';
        document.querySelectorAll('div[data-featuretarget="iteminfo"][style]:not([style*="display: none"])').forEach((itemInfo) => {
          textOfDescriptors = itemInfo.textContent;
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
          document.querySelectorAll('.inventory_page_right [href^="steam://rungame"]').forEach((inspectButton) => {
            inspectButton.parentNode.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(otherExteriors, { ADD_ATTR: ['target'] }));
          });
        }
      }

      // adds the lower module that includes tradability, countdown  and bookmarking, inspect buttons
      document.querySelectorAll('.inventory_page_right [href^="steam://rungame"]').forEach((inspectButton) => {
        inspectButton.parentNode.insertAdjacentHTML('afterend', DOMPurify.sanitize(lowerModule));

        if (item && item.inspectLink) {
          const inspectOnserverLink = inspectButton.cloneNode(true);
          inspectOnserverLink.href = `https://www.cs2inspects.com/?apply=${item.inspectLink}`;
          inspectOnserverLink.textContent = 'Inspect on Server...';
          inspectOnserverLink.setAttribute('target', '_blank');
          inspectOnserverLink.classList.add('inspectOnServer');

          inspectButton.insertAdjacentElement('afterend', inspectOnserverLink);

          const inspectInBrowserLink = inspectButton.cloneNode(true);
          inspectInBrowserLink.href = `https://swap.gg/screenshot?inspectLink=${item.inspectLink}`;
          inspectInBrowserLink.textContent = 'Inspect in Browser...';
          inspectInBrowserLink.setAttribute('target', '_blank');
          inspectInBrowserLink.classList.add('inbrowserInspectLink');

          inspectButton.insertAdjacentElement('afterend', inspectInBrowserLink);
        }
      });

      document.querySelectorAll('.lowerModule').forEach((module) => {
        module.addEventListener('click', (event) => {
          addBookmark(event.target);
        });
      });

      if (activeInventoryAppID === steamApps.CSGO.appID) {
        // hides "tags"
        // it's going to be interesting if these generated class names change at some point..
        // we will see, it's not a very important element, so good for testing purposes
        document.querySelectorAll('div.Cgo8G5L7D0oP0OHVGcq_D._3JCkAyd9cnB90tRcDLPp4W._38cfDT7owcq-7PHlx-Bx2j._3nHL7awgK1Qei1XivGvHMK > span._1maNP9UvDekHzld1kwwQnw.f6hU22EA7Z8peFWZVBJU')
          .forEach((tagsElement) => {
            if (!tagsElement.classList.contains('doHide')) tagsElement.classList.add('doHide');
          });

        // listens to click on "show technical"
        document.querySelectorAll('.showTechnical').forEach((showTechnical) => {
          showTechnical.addEventListener('click', () => {
            document.querySelectorAll('.floatTechnical').forEach((floatTechnical) => {
              floatTechnical.classList.toggle('doHide');
            });
          });
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
          // repositions stickers and charms
          if ((item.stickers !== undefined && item.stickers.length !== 0)
            || (item.charms !== undefined && item.charms.length !== 0)) {
            // removes the original stickers and charms elements
            // they even both have the same id, which means that only one can be selected by id
            const originalStickerEls = document.querySelectorAll('#sticker_info, #keychain_info');

            if (originalStickerEls.length > 0) {
              originalStickerEls.forEach((stickerEl) => {
                stickerEl.parentNode.remove();
              });
            }

            // sometimes it is added slowly so it does not get removed the first time..
            setTimeout(() => {
              if (originalStickerEls.length > 0) {
                originalStickerEls.forEach((stickerEl) => {
                  if (stickerEl.parentNode !== null) stickerEl.parentNode.remove();
                });
              }
            }, 1000);

            // adds own sticker elements
            const combinedAddons = [...item.stickers, ...item.charms];

            combinedAddons.forEach((stickerInfo) => {
              document.querySelectorAll('.customStickers').forEach((customStickers) => {
                customStickers.innerHTML += DOMPurify.sanitize(`
                                    <div class="stickerSlot" data-tooltip="${stickerInfo.fullName} (${stickerInfo.price.display})">
                                        <a href="${stickerInfo.marketURL}" target="_blank">
                                            <img src="${stickerInfo.iconURL}" class="stickerIcon">
                                        </a>
                                    </div>
                                    `, { ADD_ATTR: ['target'] });
              });
            });
          }

          // adds csgoskins link to collection
          if (item.collection) {
            document.querySelectorAll('div[style="--text-color: var(--color-text-body-description); --white-space: pre-wrap; color: rgb(157, 161, 169);"] > span[style="display: contents;"')
              .forEach((collectionEl) => {
                const collectionName = collectionEl.textContent;
                const parsedCollection = collectionName
                  .toString()
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^\w-]+/g, '')
                  .replace(/--+/g, '-')
                  .replace(/^-+/, '')
                  .replace(/-+$/, '');
                collectionEl.innerHTML = '';
                collectionEl.insertAdjacentHTML(
                  'afterbegin',
                  DOMPurify.sanitize(
                    `<a href="https://pricempire.com/cs2-skin-search/skin-collections/${parsedCollection}?utm_source=csgotrader.app" target="_blank">${collectionName}</a>`,
                    { ADD_ATTR: ['target'] },
                  ),
                );
              });
          }

          // removes sih "Get Float" button
          // does not really work since it's loaded after this script..
          if (isSIHActive()) {
            document.querySelectorAll('.float_block').forEach((e) => e.remove());
            setTimeout(() => {
              document.querySelectorAll('.float_block').forEach((e) => e.remove());
            }, 1000);
          }
          if (item.floatInfo === null || item.floatInfo === undefined) {
            if (item.inspectLink !== null && item.type && itemTypes[item.type.key].float) {
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
            const itemElement = findElementByIDs(steamApps.CSGO.appID, '2', item.assetid, 'inventory');
            addFloatIndicator(itemElement, item.floatInfo, floatDigitsToShow, showContrastingLook);
            if (showPaintSeeds) {
              addPaintSeedIndicator(itemElement, item.floatInfo, showContrastingLook);
            }
            if (showFloatRank) {
              addFloatRankIndicator(itemElement, item.floatInfo, showContrastingLook);
            }
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
          } else if (item.tradability === 'Tradelocked') {
            tradabilityDiv.innerHTML = DOMPurify.sanitize(tradeLocked);
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

      if (showDuplicates) {
        document.querySelectorAll('.duplicate').forEach((duplicate) => {
          if (item.duplicates !== undefined) {
            duplicate.style.display = 'block';
            duplicate.innerText = `x${item.duplicates.num}`;
          } else duplicate.style.display = 'none';
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

      if (isOwnInventory() && item.marketable) {
        if (addInstantSellButton) {
          document.querySelectorAll('div[data-featuretarget="iteminfo"][style]:not([style*="display: none"]) button[data-accent-color="green"]').forEach((originalSellButton) => {
            const instantSellButton = originalSellButton.cloneNode(true);
            instantSellButton.classList.add('marketActionInstantSell');
            instantSellButton.innerText = 'Instant Sell';
            instantSellButton.setAttribute('title', 'List the item on the market to be bought by the highest buy order');

            const quickSellButton = originalSellButton.cloneNode(true);
            quickSellButton.classList.add('marketActionQuickSell');
            quickSellButton.innerText = 'Quick Sell';
            quickSellButton.style['margin-left'] = '5px';
            quickSellButton.setAttribute('title', 'List the item to be the cheapest on the market');

            originalSellButton.insertAdjacentElement('afterend', instantSellButton);
            originalSellButton.insertAdjacentElement('afterend', quickSellButton);

            const listingErrorDiv = document.createElement('div');
            listingErrorDiv.classList.add('listingError', 'doHide');
            originalSellButton.parentNode.insertAdjacentElement('afterend', listingErrorDiv);

            instantSellButton.addEventListener('click', () => {
              if (safeInstantAndQuickSellFlag && !window.confirm('Are you sure you want to Instant Sell this item?')) return; // eslint-disable-line no-alert

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
                    instantSellButton.innerText = 'Listing created!';
                  }).catch((err) => {
                    console.log(err);
                    showListingError(listingErrorDiv, err.message);
                  });
                } else {
                  showListingError(listingErrorDiv, 'No buy orders to sell to.');
                }
              }).catch((err) => {
                console.log(err);
                showListingError(listingErrorDiv, err.message);
              });
            });

            quickSellButton.addEventListener('click', () => {
              if (safeInstantAndQuickSellFlag && !window.confirm('Are you sure you want to Quick Sell this item?')) return; // eslint-disable-line no-alert

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
                  quickSellButton.innerText = 'Listing created!';
                }).catch((err) => {
                  console.log(err);
                  showListingError(listingErrorDiv, err.message);
                });
              }).catch((err) => {
                console.log(err);
                const errorMessage = err.status === 429
                  ? 'Too many requests, try again later.'
                  : 'Could not get lowest listing price';
                showListingError(listingErrorDiv, errorMessage);
              });
            });
          });
        }

        if (item.commodity) {
          const multiSellLink = `
                <div class="descriptor multiSellLink">
                    <a href="https://steamcommunity.com/market/multisell?appid=${item.appid}&contextid=${item.contextid}&items%5B%5D=${encodeURIComponent(item.market_hash_name)}&qty%5B%5D=250" target="_blank">
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

      // adds the in-offer module
      chrome.storage.local.get(['activeOffers', 'itemInOffersInventory', 'showPriceEmpireLinkInInventory',
        'showBuffLookupInInventory', 'inventoryShowCopyButtons', 'showFloatDBLookupInInventory'], ({
        activeOffers, itemInOffersInventory,
        showPriceEmpireLinkInInventory, showBuffLookupInInventory, inventoryShowCopyButtons,
        showFloatDBLookupInInventory,
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

        if (activeInventoryAppID === steamApps.CSGO.appID) {
          const buffLink = `
        <div class="buffLink" style="margin-top: -20px;">
            <a href="${getBuffLink(item.market_hash_name)}" target="_blank" style="color: yellow;">
                Lookup item on Buff
              </a>
        </div>
      `;
          const floatDBLink = getFloatDBLink(item);
          const floatDBLinkEL = `
              <div class="floatDBLink" style="margin-top: -10px;">
                  <a href="${floatDBLink}" target="_blank" style="color: yellow;">
                      Lookup in FloatDB
                    </a>
              </div>
            `;
          const priceEmpireLink = `
        <div class="pricEmpireLink" style="margin-top: -10px;">
            <a href="https://pricempire.com/${getPricempireLink(item.type.key, item.name, (item.dopplerInfo && item.dopplerInfo.name) ? `-${item.dopplerInfo.name}` : '', item.exterior?.name.toLowerCase())}?utm_source=csgotrader.app&r=76561198036030455" target="_blank" style="color: yellow;">
                Check prices on PRICEMPIRE.COM
              </a>
        </div>
      `;

          document.querySelectorAll('.inventory_page_right [href^="steam://rungame"]').forEach((inspectButton) => {
            if (showBuffLookupInInventory) inspectButton.parentNode.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(buffLink, { ADD_ATTR: ['target'] }));
            if (showFloatDBLookupInInventory) inspectButton.parentNode.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(floatDBLinkEL, { ADD_ATTR: ['target'] }));
            if (showPriceEmpireLinkInInventory) inspectButton.parentNode.insertAdjacentHTML('beforebegin', DOMPurify.sanitize(priceEmpireLink, { ADD_ATTR: ['target'] }));
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
  chrome.storage.local.get('autoFloatInventory', ({ autoFloatInventory }) => {
    if (autoFloatInventory) {
      const page = getActivePage('inventory');
      if (page !== null) {
        page.querySelectorAll('.item.app730.context2, .item.app730.context16').forEach((itemElement) => {
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
            } else {
              addFloatIndicator(
                itemElement, item.floatInfo, floatDigitsToShow, showContrastingLook,
              );
              if (showPaintSeeds) {
                addPaintSeedIndicator(itemElement, item.floatInfo, showContrastingLook);
              }
              if (showFloatRank) {
                addFloatRankIndicator(itemElement, item.floatInfo, showContrastingLook);
              }
            }
          }
        });
        if (!floatQueue.active) workOnFloatQueue();
      }
    }
  });
};

const addRealTimePricesToQueue = () => {
  const selectButton = document.getElementById('selectButton');
  if (selectButton !== null && !selectButton.classList.contains('selectionActive')) {
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
                    showContrastingLook,
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
  const itemElements = document.querySelectorAll(`.item.app${appID}.context2, .item.app${appID}.context16`);
  if (itemElements.length !== 0) {
    chrome.storage.local.get([
      'colorfulItems', 'autoFloatInventory', 'showStickerPrice', 'activeOffers', 'currency',
      'itemInOffersInventory', 'showShortExteriorsInventory', 'showTradeLockIndicatorInInventories',
      'resizeAndRepositionProtectedIcon',
    ],
    ({
      colorfulItems, showStickerPrice, autoFloatInventory,
      activeOffers, itemInOffersInventory, showShortExteriorsInventory,
      showTradeLockIndicatorInInventories, currency, resizeAndRepositionProtectedIcon,
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
          if (!item) return false;

          if (showTradeLockIndicatorInInventories) {
            // adds tradability indicator
            if (item.tradability !== 'Tradable' && item.tradability !== 'Not Tradable') {
              const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';
              itemElement.insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize(`<div class="perItemDate ${contrastingLookClass} not_tradable">${item.tradabilityShort}</div>`),
              );
            }
          }

          if (appID === steamApps.CSGO.appID) {
            addDopplerPhase(itemElement, item.dopplerInfo, showContrastingLook);
            addFadePercentage(itemElement, item.patternInfo, showContrastingLook);
            makeItemColorful(itemElement, item, colorfulItems);
            addSSTandExtIndicators(
              itemElement, item, showStickerPrice,
              showShortExteriorsInventory, showContrastingLook,
            );
            addPriceIndicator(
              itemElement, item.price, currency, showContrastingLook, pricePercentage,
            );
            if (itemInOffersInventory) {
              addInOtherTradeIndicator(itemElement, item, activeOffers.items);
            }
            if (autoFloatInventory) {
              addFloatIndicator(
                itemElement, item.floatInfo, floatDigitsToShow, showContrastingLook,
              );
            }

            if (showPaintSeeds) {
              addPaintSeedIndicator(itemElement, item.floatInfo, showContrastingLook);
            }
            if (showFloatRank) {
              addFloatRankIndicator(itemElement, item.floatInfo, showContrastingLook);
            }

            if (resizeAndRepositionProtectedIcon) {
              // resizes and repositions the protected icon
              const protectedIcon = itemElement.querySelector('div.provisional_item_badge');
              if (protectedIcon) {
                protectedIcon.style['background-size'] = '20px';
                protectedIcon.style.left = '4px';
                protectedIcon.style.bottom = '59px';
              }
            }
          }

          // marks the item "processed" to avoid additional unnecessary work later
          itemElement.setAttribute('data-processed', 'true');
          itemElement.setAttribute('data-price-ratio', pricePercentage);
        } else if (itemElement.getAttribute('data-processed') === 'true'
            && parseFloat(itemElement.getAttribute('data-price-ratio')) !== pricePercentage) {
          const currentPriceIndicatorEl = itemElement.querySelector('.priceIndicator');
          const IDs = getIDsFromElement(itemElement, 'inventory');
          const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);

          if (currentPriceIndicatorEl) {
            currentPriceIndicatorEl.remove();
            addPriceIndicator(
              itemElement, item.price, currency, showContrastingLook, pricePercentage,
            );
            itemElement.setAttribute('data-price-ratio', pricePercentage);
          }
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
    const totalPercentageApplied = inventoryTotal * (pricePercentage / 100);

    inventoryTotalValueElement.innerText = prettyPrintPrice(
      currency,
      (totalPercentageApplied).toFixed(0),
    );
  });
};

const unselectAllItems = () => {
  document.querySelectorAll('.item.app730.context2, .item.app730.context16').forEach((item) => {
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
                  data-price-in-cents="${item.price ? userPriceToProperPrice((item.price.price * (pricePercentage / 100)).toString()).toString() : '0'}"
                  data-listing-price="${item.price ? getPriceAfterFees(userPriceToProperPrice((item.price.price * (pricePercentage / 100)).toString())).toString() : '0'}"
                  >
                  ${item.price ? (item.price.price * (pricePercentage / 100)).toFixed(2) : '0'}
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

  // update multisell link
  const appID = getActiveInventoryAppID();
  const contextID = getDefaultContextID(appID);
  let multisellLink = `https://steamcommunity.com/market/multisell?appid=${appID}&contextid=${contextID}`;

  selectedItems.forEach((itemElement) => {
    const IDs = getIDsFromElement(itemElement, 'inventory');
    const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
    if (item) {
      if (item.price) {
        selectedTotal += parseFloat((item.price.price * (pricePercentage / 100)).toFixed(2));
      }
      const listingRow = getListingRow(item.appid, item.contextid, item.market_hash_name);
      if (item.commodity) multisellLink += `&items%5B%5D=${encodeURIComponent(item.market_hash_name)}`;

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
  });

  multisellLink += '&qty%5B%5D=250';
  document.getElementById('multiSellLink').setAttribute('href', multisellLink);

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
    const itemElements = document.querySelectorAll('.item.app730.context2, .item.app730.context16');
    let inventoryPages = [];
    const context2Pages = document.getElementById(`inventory_${inventoryOwnerID}_730_2`)?.querySelectorAll('.inventory_page');
    if (context2Pages && context2Pages.length > 0) inventoryPages = inventoryPages.concat(...context2Pages);
    const context16Pages = document.getElementById(`inventory_${inventoryOwnerID}_730_16`)?.querySelectorAll('.inventory_page');
    if (context16Pages && context16Pages.length > 0) inventoryPages = inventoryPages.concat(...context16Pages);
    const context0Pages = document.getElementById(`inventory_${inventoryOwnerID}_730_0`)?.querySelectorAll('.inventory_page');
    if (context0Pages && context0Pages.length > 0) inventoryPages = inventoryPages.concat(...context0Pages);
    doTheSorting(inventoryItems, Array.from(itemElements), method, inventoryPages, 'inventory');
    addPerItemInfo(activeAppID);
  }
};

const doInitSorting = () => {
  chrome.storage.local.get('inventorySortingMode', ({ inventorySortingMode }) => {
    sortItems(items, inventorySortingMode);
    document.querySelector(`#sortingMethod [value="${inventorySortingMode}"]`).selected = true;
    document.querySelector(`#generate_sort [value="${inventorySortingMode}"]`).selected = true;
    addFloatIndicatorsToPage();
    addRealTimePricesToQueue();
  });
};

const generateItemsList = () => {
  const generateSorting = document.getElementById('generate_sort');
  const sortingMode = generateSorting.options[generateSorting.selectedIndex].value;
  const sortedItems = doTheSorting(items,
    Array.from(document.querySelectorAll('.item.app730.context2, .item.app730.context16')),
    sortingMode, null, 'simple_sort');
  let copyText = '';

  const delimiter = document.getElementById('generate_delimiter').value;

  const limit = document.getElementById('generate_limit').value;

  const exteriorSelect = document.getElementById('generate_exterior');
  const exteriorSelected = exteriorSelect.options[exteriorSelect.selectedIndex].value;
  const exteriorType = exteriorSelected === 'full' ? 'name' : 'short';

  const showPrice = document.getElementById('generate_price').checked;
  const showStickerPrice = document.getElementById('generate_sticker_price').checked;
  const showTradability = document.getElementById('generate_tradability').checked;
  const showFloat = document.getElementById('generate_float').checked;
  const includeDupes = document.getElementById('generate_duplicates').checked;
  const includeNonMarketable = document.getElementById('generate_non_market').checked;
  const selectedOnly = document.getElementById('selected_only').checked;
  const includeItemLinks = document.getElementById('include_inventory_links').checked;

  let lineCount = 0;
  let characterCount = 0;
  const namesAlreadyInList = [];

  let csvContent = 'data:text/csv;charset=utf-8,';
  const headers = `Name,Exterior${showPrice ? ',Price' : ''}${showFloat && includeDupes ? ',Float value' : ''}${showStickerPrice ? ',Sticker Price' : ''}${showTradability ? ',Tradability' : ''}${includeDupes ? '' : ',Duplicates'}${includeItemLinks ? ',Link' : ''}\n`;
  csvContent += headers;

  sortedItems.forEach((itemElement) => {
    const IDs = getIDsFromElement(itemElement, 'inventory');
    const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
    const customName = isDopplerInName(item.name)
      ? `${item.name} (${item.dopplerInfo.name})`
      : item.name;
    const price = (showPrice && item.price !== null)
      ? ` ${delimiter} ${(item.price.price * (pricePercentage / 100)).toFixed(2)}`
      : showPrice
        ? ` ${delimiter}`
        : '';
    const priceCSV = (showPrice && item.price !== null)
      ? `,${(item.price.price * (pricePercentage / 100)).toFixed(2)}`
      : showPrice
        ? ','
        : '';
    const stickerPrice = (showStickerPrice && item.stickerPrice !== null)
      ? ` ${delimiter} ${item.stickerPrice.display}`
      : showStickerPrice
        ? ` ${delimiter}`
        : '';
    const stickerPriceCSV = (showStickerPrice && item.stickerPrice !== null)
      ? `,${item.stickerPrice.display}`
      : showStickerPrice
        ? ','
        : '';
    const float = (showFloat && includeDupes && item.floatInfo !== null)
      ? ` ${delimiter} ${item.floatInfo.floatvalue}`
      : showFloat
        ? ` ${delimiter}`
        : '';
    const floatCSV = (showFloat && includeDupes && item.floatInfo !== null)
      ? `,${item.floatInfo.floatvalue}`
      : showFloat
        ? ','
        : '';
    const exterior = (item.exterior !== undefined && item.exterior !== null) ? item.exterior[exteriorType] : '';
    const tradableAt = new Date(item.tradability).toString().split('GMT')[0];
    const inventoryLink = `https://steamcommunity.com/profiles/${item.owner}/inventory/#${item.appid}_${item.contextid}_${item.assetid}`;
    const itemInventoryLink = includeItemLinks ? `${delimiter} ${inventoryLink}` : '';
    const tradability = (showTradability && tradableAt !== 'Invalid Date')
      ? `${delimiter} ${tradableAt}`
      : showTradability
        ? ` ${delimiter}`
        : '';
    const tradabilityCSV = (showTradability && tradableAt !== 'Invalid Date')
      ? `,${tradableAt}`
      : showTradability
        ? ','
        : '';
    const duplicate = (!includeDupes && item.duplicates.num !== 1)
      ? `${delimiter} x${item.duplicates.num}`
      : includeDupes
        ? ` ${delimiter}`
        : '';
    const duplicateCSV = (!includeDupes && item.duplicates.num !== 1) ? `,x${item.duplicates.num}` : '';
    const line = `${includeDupes ? customName : item.name} ${delimiter} ${exterior}${price}${float}${stickerPrice}${tradability} ${duplicate} ${itemInventoryLink}\n`;
    const lineCSV = `"${includeDupes ? customName : item.name}",${exterior}${priceCSV}${floatCSV}${stickerPriceCSV}${tradabilityCSV}${duplicateCSV}${itemInventoryLink}\n`;

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
  downloadButton.setAttribute('download', `${inventoryOwnerID}_csgo_items.csv`);

  copyToClipboard(copyText);

  document.getElementById('generation_result')
    .innerText = `${lineCount} lines (${characterCount} chars) generated and copied to clipboard`;
};

const addFunctionBar = () => {
  if (document.getElementById('inventory_function_bar') === null) {
    const handPointer = chrome.runtime.getURL('images/hand-pointer-solid.svg');
    const table = chrome.runtime.getURL('images/table-solid.svg');
    const fullSreen = chrome.runtime.getURL('images/expand-solid.svg');
    const groupItems = chrome.runtime.getURL('images/layer-group-solid-full.svg');

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
                            <img id ="selectButton" class="clickable inventoryFunctionBarIcon" src="${handPointer}" title="Start Selecting Items">
                        </span>
                        <span id="generate_menu">
                            <img id ="generate_list" class="clickable inventoryFunctionBarIcon" src="${table}" title="Generate list of inventory items">
                        </span>
                        <span id="screenshotView">
                            <img id="screenshotViewButton" class="clickable inventoryFunctionBarIcon" src="${fullSreen}" title="View inventory in full screen for screenshots">
                        </span>
                        <span id="groupItems">
                            <img id="groupItemsButton" class="clickable inventoryFunctionBarIcon" src="${groupItems}" title="Group identical commodity items">
                        </span>
                        <span style="font-size: 0.9rem;">
                            Price:
                            <input type="number" id="pricePercentage" min="0" style="width: 40px;" value = ${pricePercentage} title="Show item prices at this ratio">
                            %
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
                        <span id="selectEverything" class="clickable underline" title="Select every time in this inventoy" style="margin-right: 30px">
                            Select Everything
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
                                <div>
                                    <span>Delimiter</span>
                                    <input id="generate_delimiter" value="-">
                                    <span>Exterior:</span>
                                    <select id="generate_exterior">
                                        <option value="full">Full length</option>
                                        <option value="short">Shortened</option>
                                    </select>
                                    
                                    <span><b>Show:</b> Price</span>
                                    <input type="checkbox" id="generate_price">
                                    <span> Sticker Price</span>
                                    <input type="checkbox" id="generate_sticker_price">
                                    <span> Tradability</span>
                                    <input type="checkbox" id="generate_tradability">
                                    <span title="Only works with copy to clipboard, not .csv download">Links</span>
                                    <input id="include_inventory_links" type="checkbox" checked>
                                    <span> Float</span>
                                    <input type="checkbox" id="generate_float" title="Only works when Include: Duplicates is enabled">
                                </div>
                                <div>
                                  <span><b>Include:</b> Duplicates</span>
                                  <input id="generate_duplicates" type="checkbox" checked>
                                  <span>Non-Marketable</span>
                                  <input id="generate_non_market" type="checkbox">
                                  <span>Selected only</span>
                                  <input id="selected_only" type="checkbox" checked>
                                </div>
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
                      Warning: Your Steam Wallet currency and CS2 Trader currency are not the same.
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
                                <div class="cell"><input type="checkbox" id="lowestListingCheckBox"/></div>
                                <div class="cell">Based on startint at</div>
                                <div class="cell"><input type="checkbox" id="midPriceCheckBox"/></div>
                                <div class="cell"><input type="checkbox" id="instantSellCheckBox"/></div>
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
                                <a href="" id="multiSellLink" title="Sell commodity items in bulk">MultiSell</a>
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

    document.getElementById('selectEverything').addEventListener('click', () => {
      const inventories = document.getElementById('inventories');
      if (inventories) {
        inventories.querySelectorAll('.inventory_page').forEach((page) => {
          page.querySelectorAll('.item').forEach((item) => {
            if (!item.classList.contains('cstSelected')) item.classList.add('cstSelected');
          });
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

    document.getElementById('pricePercentage').addEventListener('change', (event) => {
      pricePercentage = event.target.value;
      setInventoryTotal();
      addPerItemInfo(getActiveInventoryAppID());
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

    document.getElementById('screenshotViewButton').addEventListener('click', () => {
      const previousModal = document.getElementById('fullScreenInventoryModal');

      if (previousModal) previousModal.remove();

      const modalHTML = DOMPurify.sanitize(`
                    <div id="fullScreenInventoryModal" class="modal_frame" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: block;">
                        <div id="modalContentTitleBar" style="color: white; padding: 4px 2px 4px 8px; text-align: left; background-color: #304a66;>
                          <span id="modalContentTitle">Full Screen Inventory View</span>
                          <span id="modalContentDismiss" class="modalContentDismissImage clickable" style="position: absolute; top: 5px; right: -4px; width: 18px; height: 14px;">
                            <img src="https://community.akamai.steamstatic.com/public/images/x9x9.gif" width="9" height="9" border="0" alt="Close">
                          </span>
                        </div>
                        <div id="modalContentFrameContainer" style="margin-left: 5px; max-height: calc(100% - 40px); overflow: auto;">
                        </div>
                    </div>`);
      document.querySelector('body').insertAdjacentHTML('beforeend', modalHTML);
      document.getElementById('fullScreenInventoryModal').style.display = 'block';

      document.getElementById('modalContentDismiss').addEventListener('click', () => {
        document.getElementById('fullScreenInventoryModal').remove();
      });

      const modalContentEl = document.getElementById('modalContentFrameContainer');
      const userCSInventoryEl = Array.from(document.getElementById('inventories').children)
        .find((el) => el.style.display === 'block' || el.style.display === '');

      userCSInventoryEl.querySelectorAll('div.itemHolder').forEach((itemHolder) => {
        const clonedElement = itemHolder.cloneNode(true);
        modalContentEl.appendChild(clonedElement);
      });
    });

    let doGrouping = false;
    const groupedHidden = new Set();
    const originalPageMap = new Map(); // holder => {page, index}

    document.getElementById('groupItemsButton').addEventListener('click', () => {
      doGrouping = !doGrouping;

      const inventories = document.getElementById('inventories');
      if (!inventories) return;

      const inventoryPages = Array.from(inventories.querySelectorAll('.inventory_page'));
      const allItemHolders = Array.from(inventories.querySelectorAll('.itemHolder'));

      if (doGrouping) {
        groupedHidden.clear();
        originalPageMap.clear();

        // Track original page and index for each holder
        allItemHolders.forEach((holder) => {
          const parentPage = holder.closest('.inventory_page');
          if (parentPage) {
            const index = Array.from(parentPage.children).indexOf(holder);
            originalPageMap.set(holder, { page: parentPage, index });
          }
        });

        // Hide duplicate commodity items except the first instance, collect visible holders
        const visibleItemHolders = [];
        allItemHolders.forEach((holder) => {
          const itemElement = holder.querySelector('.item.app730');
          if (!itemElement) return;

          const IDs = getIDsFromElement(itemElement, 'inventory');
          const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);

          if (item && item.commodity && item.duplicates.num > 1) {
            if (item.duplicates.instances[0] === item.assetid) {
              holder.style.display = '';
              visibleItemHolders.push(holder);
              // Add duplicate count indicator
              const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';
              if (!itemElement.querySelector('.commodityDuplicateInfo')) {
                itemElement.insertAdjacentHTML(
                  'beforeend', DOMPurify.sanitize(
                    `<div class="commodityDuplicateInfo">
                  <span class="commodityDuplicateIndicator ${contrastingLookClass}">x${item.duplicates.num}</span>
                </div>`,
                  ),
                );
              }
            } else {
              holder.style.display = 'none';
              groupedHidden.add(holder);
            }
          } else {
            holder.style.display = '';
            visibleItemHolders.push(holder);
          }
        });

        // Globally fill pages with visible items
        let visibleIndex = 0;
        inventoryPages.forEach((page) => {
          // Remove all visible itemHolders from this page
          Array.from(page.querySelectorAll('.itemHolder')).forEach((holder) => {
            if (holder.style.display !== 'none') page.removeChild(holder);
          });

          // Fill page with up to inventoryPageSize visible items
          let filled = 0;
          while (filled < inventoryPageSize && visibleIndex < visibleItemHolders.length) {
            page.appendChild(visibleItemHolders[visibleIndex]);
            filled += 1;
            visibleIndex += 1;
          }
          // Invisible items remain in their original page and position
        });
      } else {
        // Restore all itemHolders to their original page and position
        // 1. Group holders by original page
        const holdersByPage = new Map();
        allItemHolders.forEach((holder) => {
          // Remove duplicate indicator if present
          const itemElement = holder.querySelector('.item.app730');
          if (itemElement) {
            const duplicateInfo = itemElement.querySelector('.commodityDuplicateInfo');
            if (duplicateInfo) duplicateInfo.remove();
          }
          holder.style.display = '';
          const original = originalPageMap.get(holder);
          if (original) {
            if (!holdersByPage.has(original.page)) holdersByPage.set(original.page, []);
            holdersByPage.get(original.page).push({ holder, index: original.index });
          }
        });

        // 2. For each page, sort holders by original index and re-append in order
        holdersByPage.forEach((holders, page) => {
          holders.sort((a, b) => a.index - b.index);
          holders.forEach(({ holder }) => {
            page.appendChild(holder);
          });
        });

        groupedHidden.clear();
        originalPageMap.clear();
      }
    });

    document.getElementById('generate_list').addEventListener('click', () => { document.getElementById('functionBarGenerateMenu').classList.toggle('hidden'); });

    document.getElementById('generate_button').addEventListener('click', generateItemsList);
  } else setTimeout(() => { setInventoryTotal(); }, 1000);
};

const onFullCSGOInventoryLoad = () => {
  if (steamApps.CSGO.appID === getActiveInventoryAppID()) {
    if (!isOwnInventory()) {
      getCSGOInventoryDataFromPage().then((inv) => {
        chrome.runtime.sendMessage({
          loadFloats: {
            items: inv,
            steamID: inventoryOwnerID,
            isOwn: false,
            type: 'inventory',
          },
        }, () => { });
        items = inv;
        updateDuplicateCounts();
        addRightSideElements();
        addPerItemInfo(steamApps.CSGO.appID);
        setInventoryTotal();
        addFunctionBar();
        addPageControlEventListeners('inventory', () => {
          addFloatIndicatorsToPage();
          addRealTimePricesToQueue();
        });
        doInitSorting();
      }).catch((err) => { console.log(err); });
    } else doInitSorting();
  }
};

// triggers steam's mechanism for loading complete inventories
// by default only the first 3 pages (75 items) are loaded
const loadFullInventory = () => {
  if (!isSIHActive()) {
    // basically checking if first call
    if (document.querySelector('body').getAttribute('allItemsLoaded') === null) {
      const initPageElementsScript = `
        for (let i = 0; i < g_ActiveInventory.m_cPages; i++) {
          g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated();
          g_ActiveInventory.PreloadPageImages(i);
        }`;
      const loadFullInventoryScript = `
                g_ActiveInventory.LoadMoreAssets(1000).done(function () {
                  ${initPageElementsScript}
                  document.querySelector('body').setAttribute('allItemsLoaded', true);
                });
                `;

      if (injectScript(loadFullInventoryScript, true, 'loadFullInventory', 'allItemsLoaded') === null) {
        setTimeout(() => {
          loadFullInventory();
        }, 2000);
      } else onFullCSGOInventoryLoad();

      // in other people's inventories the pages don't get initialized by the first injection
      // for some reason, this is a workaround
      setTimeout(() => {
        injectScript(initPageElementsScript, true, 'loadFullInventory', 'allItemsLoaded');
      }, 100);
    } else onFullCSGOInventoryLoad();
  } else doInitSorting();
};

// sends a message to the "back end" to request inventory contents
const requestInventory = (appID, contextID) => {
  if (appID === steamApps.CSGO.appID) {
    // only use this for loading for own inventory
    // since the other endpoint does not provide any more details now
    // this avoids an additional request
    // hopefully fewer restricitions by steam
    if (isOwnInventory()) {
      chrome.runtime.sendMessage({ inventory: inventoryOwnerID, contextID }, (response) => {
        if (response !== 'error') {
          if (!inventoryTotalsAdded.includes(contextID)) {
            inventoryTotal += response.total;
            inventoryTotalsAdded.push(contextID);
          }

          items = items.concat(response.items);
          updateDuplicateCounts();
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
    } else loadFullInventory();
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
  const itemElements = document.querySelectorAll('.item.app730.context2, .item.app730.context16');
  if (itemElements.length !== 0) {
    itemElements.forEach((itemElement) => {
      const IDs = getIDsFromElement(itemElement, 'inventory');
      const item = getItemByIDs(items, IDs.appID, IDs.contextID, IDs.assetID);
      const itemDateElement = itemElement.querySelector('.perItemDate');

      if (itemDateElement !== null) {
        const previText = itemDateElement.innerText;
        if (previText !== 'L') {
          const newText = getShortDate(item.tradability);
          itemDateElement.innerText = newText;

          if (previText !== 'T' && newText === 'T') {
            itemDateElement.classList.remove('not_tradable');
            itemDateElement.classList.add('tradable');
          }
        }
      }
    });
  }
};

const hideOtherExtensionPrices = () => {
  // sih
  if (!document.hidden) {
    if (isSIHActive()) {
      document.querySelectorAll('.price_flag, .item-info, .sih_item_sticker, .trade-lock-badge').forEach((sihElement) => {
        sihElement.remove();
      });
    }

    // csfloat
    document.querySelectorAll('csfloat-inventory-item-holder-metadata').forEach((csfloatElement) => {
      csfloatElement.style.display = 'none';
    });

    // market.csgo extension item styling
    document.querySelectorAll('style').forEach((styleElement) => {
      if (styleElement.textContent.includes('[id*="730_2"]:has(.inventory_page)')) {
        styleElement.remove();
      }
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

const defaultActiveInventoryAppID = getActiveInventoryAppID();
logExtensionPresence();
updateWalletCurrency();
listenToAcceptTrade();
refreshSteamAccessToken();
reloadPageOnExtensionUpdate();

if (defaultActiveInventoryAppID !== null) {
  initPriceQueue(onListingPricesLoaded);
  chrome.storage.local.get([
    'numberOfFloatDigitsToShow', 'inventoryShowDuplicateCount',
    'showPaintSeedOnItems', 'showFloatRankOnItems', 'contrastingLook',
    'showAllExteriorsInventory', 'inventoryInstantQuickButtons',
    'safeInstantQuickSell',
  ], ({
    numberOfFloatDigitsToShow, inventoryShowDuplicateCount,
    showPaintSeedOnItems, showFloatRankOnItems, contrastingLook,
    showAllExteriorsInventory, inventoryInstantQuickButtons,
    safeInstantQuickSell,
  }) => {
    floatDigitsToShow = numberOfFloatDigitsToShow;
    showPaintSeeds = showPaintSeedOnItems;
    showFloatRank = showFloatRankOnItems;
    showContrastingLook = contrastingLook;
    showDuplicates = inventoryShowDuplicateCount;
    showAllExteriorsMenu = showAllExteriorsInventory;
    addInstantSellButton = inventoryInstantQuickButtons;
    safeInstantAndQuickSellFlag = safeInstantQuickSell;
  });

  // listens to manual inventory tab/game changes
  const inventoriesMenu = document.querySelector('.games_list_tabs');
  if (inventoriesMenu !== null) {
    inventoriesMenu.querySelectorAll('.games_list_tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const appID = getActiveInventoryAppID();
        const contextID = getDefaultContextID(appID);
        if (appID === steamApps.CSGO.appID) {
          requestInventory(appID, '2');
          requestInventory(appID, '16');
        } else if (appID === steamApps.DOTA2.appID || appID === steamApps.TF2.appID) {
          requestInventory(appID, '2');
        } else {
          loadInventoryItems(appID, contextID);
        }
      });
    });
  }

  // mutation observer observes changes on the right side of the inventory interface
  // this is a workaround for waiting for ajax calls to finish when the page changes
  let lastStyle = '';

  const observer = new MutationObserver((mutationRecord) => {
    mutationRecord.forEach((mutation) => {
      if ((!lastStyle.includes('display: none;') && mutation.target.getAttribute('style').includes('display: none;'))
        || (lastStyle.includes('display: none;') && !mutation.target.getAttribute('style').includes('display: none;'))) {
        lastStyle = mutation.target.getAttribute('style');
        addRightSideElements();
        addFunctionBar();

        if (getActiveInventoryAppID() !== steamApps.CSGO.appID) {
          // unhides "tags" in non-csgo inventories
          document.querySelectorAll('#iteminfo1_item_tags, #iteminfo0_item_tags, #iteminfo1_item_owner_descriptors, #iteminfo0_item_owner_descriptors')
            .forEach((tagsElement) => {
              tagsElement.classList.remove('hidden');
            });
        }
      }
    });
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
                  '<a class="popup_menu_item" id="viewTradeHistory">Trade History (CS2 Trader)</a>',
                ),
              );
              document.getElementById('viewTradeHistory').addEventListener('mouseup', () => {
                chrome.runtime.sendMessage({ openInternalPage: 'index.html?page=trade-history' }, () => { });
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
      ['tradeHistoryInventory', `offerHistory_${inventoryOwnerID}`, 'apiKeyValid'],
      (result) => {
        let offerHistory = result[`offerHistory_${inventoryOwnerID}`];
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
                          <b>CS2Trader Extension:</b> It looks like you don't have your Steam API Key set yet.
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

  chrome.storage.local.get(['hideOtherExtensionPrices', 'moveWithArrowKeysInventory'], (results) => {
    if (results.hideOtherExtensionPrices) hideOtherExtensionPrices();
    if (results.moveWithArrowKeysInventory) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();

          const activePage = getActivePage('inventory');
          let activePageActiveItem = null;
          let activeItemIndex = -1;

          if (activePage !== null) {
            activePage.querySelectorAll('.item.app730.context2, .item.app730.context16').forEach((itemElement, index) => {
              if (itemElement.classList.contains('activeInfo')) {
                activePageActiveItem = itemElement;
                activeItemIndex = index;
              }
            });
          }

          // when the active item is not on the active page
          if (!event.ctrlKey && activePageActiveItem === null) {
            const currentActivePage = getActivePage('inventory');
            currentActivePage.querySelectorAll('.item')[0].querySelector('a').click();
          }

          // inventory page are 5 items per row, 5 rows per page = 25 items per page
          switch (event.key) {
            case 'ArrowLeft':
              if (event.ctrlKey) goToPreviousInventoryPage();
              else if (activeItemIndex === 0) { // when it's the first item on the page
                goToPreviousInventoryPage();
              } else if (activeItemIndex > 0) {
                activePage.querySelectorAll('.item')[activeItemIndex - 1].querySelector('a').click();
              }
              break;
            case 'ArrowRight':
              if (event.ctrlKey) gotToNextInventoryPage();
              else if (activeItemIndex >= 0 && activeItemIndex < 24) {
                activePage.querySelectorAll('.item')[activeItemIndex + 1].querySelector('a').click();
              } else if (activeItemIndex === 24) { // when it's the last item on the page
                gotToNextInventoryPage();
              }
              break;
            case 'ArrowUp':
              if (activeItemIndex >= 0 && activeItemIndex < 5) {
                activePage.querySelectorAll('.item')[activeItemIndex + 20].querySelector('a').click();
              } else if (activeItemIndex >= 5 && activeItemIndex < 20) {
                activePage.querySelectorAll('.item')[activeItemIndex - 5].querySelector('a').click();
              }
              break;
            case 'ArrowDown':
              if (activeItemIndex >= 0 && activeItemIndex < 20) {
                activePage.querySelectorAll('.item')[activeItemIndex + 5].querySelector('a').click();
              } else if (activeItemIndex >= 20) {
                activePage.querySelectorAll('.item')[activeItemIndex - 20].querySelector('a').click();
              }
              break;
            default: break;
          }
        }
      });
    }
  });

  if (defaultActiveInventoryAppID === steamApps.CSGO.appID) {
    requestInventory(defaultActiveInventoryAppID, '2');
    requestInventory(defaultActiveInventoryAppID, '16');
  } else if (defaultActiveInventoryAppID === steamApps.DOTA2.appID
    || defaultActiveInventoryAppID === steamApps.TF2.appID) {
    requestInventory(defaultActiveInventoryAppID);
  } else {
    loadInventoryItems(
      defaultActiveInventoryAppID,
      getDefaultContextID(defaultActiveInventoryAppID),
    );
  }

  // to refresh the trade lock remaining indicators
  setInterval(() => {
    if (!document.hidden) updateTradabilityIndicators();
  }, 60000);
} else console.log('Could not get active inventory app ID, private inventory? Functions disabled.');
