import DOMPurify from 'dompurify';

import {
  getItemByAssetID, getAssetIDOfElement, addDopplerPhase,
  makeItemColorful, addSSTandExtIndicators, addPriceIndicator,
  addFloatIndicator, getExteriorFromTags, getQuality,
  getType, isCSGOInventoryActive, getInspectLink, repositionNameTagIcons,
  getDopplerInfo, getActivePage, reloadPageOnExtensionReload, logExtensionPresence,
  updateLoggedInUserInfo, warnOfScammer, addPageControlEventListeners,
  addSearchListener, findElementByAssetID, getPattern, getNameTag,
  removeOfferFromActiveOffers, changePageTitle, getIDsFromElement,
  getItemByIDs,
} from 'utils/utilsModular';
import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import {
  priceQueue, workOnPriceQueue, prettyPrintPrice, addRealTimePriceIndicator,
} from 'utils/pricing';
import doTheSorting from 'utils/sorting';
import { sortingModes } from 'utils/static/sortingModes';
import { trackEvent } from 'utils/analytics';
import itemTypes from 'utils/static/itemTypes';
import { genericMarketLink } from 'utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import { overrideHandleTradeActionMenu } from 'utils/steamOverriding';
import { injectScript, injectStyle } from 'utils/injection';
import { inOtherOfferIndicator } from 'utils/static/miscElements';
import addPricesAndFloatsToInventory from 'utils/addPricesAndFloats';
import { declineOffer } from 'utils/tradeOffers';
import steamApps from 'utils/static/steamApps';

let yourInventory = null;
let theirInventory = null;
const combinedInventories = [];

const getOfferIDScript = "document.querySelector('body').setAttribute('offerID', g_strTradePartnerInventoryLoadURL.split('tradeoffer/')[1].split('/partner')[0])";
const offerID = injectScript(getOfferIDScript, true, 'getOfferID', 'offerID');

const addInOtherOffersInfoBlock = (item, otherOfferItems) => {
  const headline = document.querySelector('.trade_partner_headline');
  if (headline !== null) {
    const inOtherOffer = document.querySelector('.in_other_offer');
    if (inOtherOffer !== null) inOtherOffer.remove(); // removing it if it was added already

    const otherOffers = otherOfferItems.map((otherOfferItem, index) => {
      const offerLink = otherOfferItem.offerOrigin === 'sent'
        ? `https://steamcommunity.com/profiles/${otherOfferItem.owner}/tradeoffers/sent#tradeofferid_${otherOfferItem.inOffer}`
        : `https://steamcommunity.com/tradeoffer/${otherOfferItem.inOffer}/`;

      const afterLinkChars = index === otherOfferItems.length - 1
        ? '' // if it's the last one
        : index !== 0 && index % 4 === 0
          ? ', \n' // if it's the 4th, 8th, etc. add a new line since only 4 fits on a line
          : ', '; // normal case

      return `<a href="${offerLink}" target="_blank">
            ${otherOfferItem.inOffer}${afterLinkChars}
           </a>`;
    });

    const listString = `<div>${otherOffers.join('')}</div>`;

    headline.insertAdjacentHTML(
      'afterend',
      DOMPurify.sanitize(
        `<div class="trade_partner_info_block in_other_offer" style="color: lightgray"> 
               ${item.name} is also in:
               ${listString}
              </div>`,
        { ADD_ATTR: ['target'] },
      ),
    );
  }
};

const getActiveInventory = () => {
  let activeInventory = null;
  document.querySelectorAll('.inventory_ctn').forEach((inventory) => {
    if (inventory.style.display !== 'none' && inventory.id !== 'trade_inventory_unavailable') activeInventory = inventory;
  });
  return activeInventory;
};

const getActiveInventoryIDs = () => {
  const activeInv = getActiveInventory();
  return activeInv === null
    ? null
    : {
      appID: activeInv.id.split('_')[2].split('_')[0],
      contextID: activeInv.id.split('_')[3].split('_')[0],
    };
};

const findElementByIDs = (appID, contextID, assetID) => document.getElementById(`item${appID}_${contextID}_${assetID}`);

const getItemInfoFromPage = (who) => {
  // gathers the app and contexts ids from the active inventory
  // and the items inside the offer
  let sideAppAndContextIDs = [];
  const activeInventoryIDs = getActiveInventoryIDs();
  if (activeInventoryIDs !== null) sideAppAndContextIDs.push(activeInventoryIDs);
  const whose = who === 'You' ? 'your' : 'their';
  const side = document.getElementById(`trade_${whose}s`);

  side.querySelectorAll('.item').forEach((itemEl) => {
    const itemIDs = getIDsFromElement(itemEl);
    if (itemIDs !== null && itemIDs.appID !== 'anonymous') {
      sideAppAndContextIDs = sideAppAndContextIDs.filter((IDs) => {
        return !(IDs.appID === itemIDs.appID && IDs.contextID === itemIDs.contextID);
      });

      sideAppAndContextIDs.push({
        appID: itemIDs.appID,
        contextID: itemIDs.contextID,
      });
    }
  });
  const inventoryInfos = {};

  for (const IDs of sideAppAndContextIDs) {
    const getItemsScript = `
            inventory = User${DOMPurify.sanitize(who)}.getInventory(${IDs.appID},${IDs.contextID});
            assets = inventory.rgInventory;
            steamID = inventory.owner.strSteamId;
            trimmedAssets = [];

            if (assets !== null) {
                for (const asset of Object.values(assets)){
                    trimmedAssets.push({
                        amount: asset.amount,
                        appid:  asset.appid,
                        assetid: asset.id,
                        actions: asset.actions,
                        classid: asset.classid,
                        icon: asset.icon_url,
                        instanceid: asset.instanceid,
                        contextid: asset.contextid,
                        descriptions: asset.descriptions,
                        market_actions: asset.market_actions,
                        market_hash_name: asset.market_hash_name,
                        marketable: asset.marketable,
                        name: asset.name,
                        name_color: asset.name_color,
                        position: asset.pos,
                        type: asset.type,
                        owner: steamID,
                        fraudwarnings: asset.fraudwarnings,
                        tags: asset.tags
                    });
                }
             }
             else trimmedAssets = null;
        document.querySelector('body').setAttribute('offerInventoryInfo', JSON.stringify(trimmedAssets));`;

    const items = JSON.parse(injectScript(getItemsScript, true, 'getOfferItemInfo', 'offerInventoryInfo'));
    if (items === null) return null;

    inventoryInfos[IDs.appID] = {
      contextID: IDs.contextID,
      items,
    };
  }
  return Object.keys(inventoryInfos).length !== 0 ? inventoryInfos : null;
};

const removeSIHStuff = () => {
  document.querySelectorAll('.des-tag, .p-price, .price-tag').forEach((element) => {
    element.remove();
  });
};

const buildInventoryStructure = (inventory) => {
  const inventoryArrayToReturn = [];
  const duplicates = {};

  inventory.forEach((item) => {
    if (duplicates[item.market_hash_name] === undefined) {
      const instances = [item.assetid];
      duplicates[item.market_hash_name] = {
        num: 1,
        instances,
      };
    } else {
      duplicates[item.market_hash_name].num += 1;
      duplicates[item.market_hash_name].instances.push(item.assetid);
    }
  });

  inventory.forEach((item) => {
    inventoryArrayToReturn.push({
      name: item.name,
      market_hash_name: item.market_hash_name,
      name_color: item.name_color,
      marketlink: genericMarketLink + item.market_hash_name,
      classid: item.classid,
      instanceid: item.instanceid,
      assetid: item.assetid,
      appid: item.appid.toString(),
      contextid: item.contextid,
      marketable: item.marketable,
      position: item.position,
      dopplerInfo: (item.name.includes('Doppler') || item.name.includes('doppler')) ? getDopplerInfo(item.icon) : null,
      exterior: getExteriorFromTags(item.tags),
      iconURL: item.icon,
      inspectLink: getInspectLink(item),
      quality: getQuality(item.tags),
      isStatrack: item.name.includes('StatTrak™'),
      isSouvenir: item.name.includes('Souvenir'),
      starInName: item.name.includes('★'),
      nametag: getNameTag(item),
      duplicates: duplicates[item.market_hash_name],
      owner: item.owner,
      type: getType(item.tags),
      floatInfo: null,
      patternInfo: null,
      descriptions: item.descriptions,
    });
  });
  return inventoryArrayToReturn.sort((a, b) => { return a.position - b.position; });
};

const addInOtherTradeIndicator = (itemElement, item, activeOfferItems) => {
  const inOtherOffers = activeOfferItems.filter((offerItem) => {
    return offerItem.assetid === item.assetid && offerItem.inOffer !== offerID;
  });

  if (inOtherOffers.length !== 0) {
    itemElement.insertAdjacentHTML('beforeend', inOtherOfferIndicator);
    itemElement.querySelector('.inOtherOffer').addEventListener('click', () => {
      addInOtherOffersInfoBlock(item, inOtherOffers);
    });
  }
};

const addItemInfo = () => {
  removeSIHStuff();

  const itemElements = document.querySelectorAll('.item.app730.context2');
  if (itemElements.length !== 0) {
    chrome.storage.local.get(['colorfulItems', 'autoFloatOffer', 'showStickerPrice', 'activeOffers', 'itemInOtherOffers'],
      ({
        colorfulItems, showStickerPrice, autoFloatOffer, activeOffers, itemInOtherOffers,
      }) => {
        itemElements.forEach((itemElement) => {
          if (itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false') {
            // in case the inventory is not loaded yet it retires in a second
            if (itemElement.id === undefined) {
              setTimeout(() => {
                addItemInfo();
              }, 1000);
              return false;
            }

            const item = getItemByAssetID(combinedInventories, getAssetIDOfElement(itemElement));
            addDopplerPhase(itemElement, item.dopplerInfo);
            makeItemColorful(itemElement, item, colorfulItems);
            addSSTandExtIndicators(itemElement, item, showStickerPrice);
            addPriceIndicator(itemElement, item.price);
            if (itemInOtherOffers) addInOtherTradeIndicator(itemElement, item, activeOffers.items);
            if (autoFloatOffer) addFloatIndicator(itemElement, item.floatInfo);

            // marks the item "processed" to avoid additional unnecessary work later
            itemElement.setAttribute('data-processed', 'true');
          }
        });
      });
  } else { // in case the inventory is not loaded yet
    setTimeout(() => {
      addItemInfo();
    }, 1000);
  }
};

const addInventoryTotals = (yourInventoryTotal, theirInventoryTotal) => {
  chrome.storage.local.get(['currency'], ({ currency }) => {
    const yourInventoryTitleDiv = document.getElementById('inventory_select_your_inventory').querySelector('div');
    yourInventoryTitleDiv.style.fontSize = '16px';
    const yourPrettyPrice = prettyPrintPrice(
      currency,
      (yourInventoryTotal).toFixed(0),
    );
    yourInventoryTitleDiv.innerText = `${yourInventoryTitleDiv.innerText} (${yourPrettyPrice})`;

    const theirInventoryTitleDiv = document.getElementById('inventory_select_their_inventory').querySelector('div');
    theirInventoryTitleDiv.style.fontSize = '16px';

    const theirPrettyPrice = prettyPrintPrice(
      currency,
      (theirInventoryTotal).toFixed(0),
    );

    theirInventoryTitleDiv.innerText = `${theirInventoryTitleDiv.innerText} (${theirPrettyPrice})`;
  });
};

// also generates the offer summary
const addInTradeTotals = (whose) => {
  chrome.storage.local.get('currency', ({ currency }) => {
    const itemsInTrade = document.getElementById(`${whose}_slots`).querySelectorAll('.item');
    let inTradeTotal = 0;
    let numberOfItemsInTrade = 0;
    const inTradeItemsSummary = {};

    itemsInTrade.forEach((inTradeItem) => {
      const item = getItemByAssetID(combinedInventories, getAssetIDOfElement(inTradeItem));
      if (item !== undefined) {
        if (item.price !== undefined) inTradeTotal += parseFloat(item.price.price);
        if (inTradeItemsSummary[item.type.key] !== undefined) {
          inTradeItemsSummary[item.type.key] += 1;
        } else inTradeItemsSummary[item.type.key] = 1;
      } else if (inTradeItemsSummary.nonCSGO !== undefined) {
        inTradeItemsSummary.nonCSGO += 1;
      } else inTradeItemsSummary.nonCSGO = 1;
      numberOfItemsInTrade += 1;
    });

    const summaryEl = document.getElementById(`${whose}Summary`);
    const itemList = summaryEl.querySelector('ul');
    itemList.innerHTML = '';
    const numberOfItems = summaryEl.querySelector('.numberOfItems');
    numberOfItems.innerText = numberOfItemsInTrade;
    const inTradeTotalValue = summaryEl.querySelector('.total');
    inTradeTotalValue.innerText = prettyPrintPrice(currency, inTradeTotal);

    for (const [name, value] of Object.entries(inTradeItemsSummary)) {
      const listItem = document.createElement('li');
      const type = itemTypes[name] !== undefined ? itemTypes[name].name : 'Non-CSGO';
      listItem.innerText = `${type}: ${value}`;
      itemList.appendChild(listItem);
    }

    if (document.getElementById(`${whose}InTradeTotal`) === null) {
      let itemsTextDiv;
      if (whose === 'your') itemsTextDiv = document.getElementById('trade_yours').querySelector('h2.ellipsis');
      else itemsTextDiv = document.getElementById('trade_theirs').querySelector('.offerheader').querySelector('h2');
      itemsTextDiv.innerHTML = DOMPurify.sanitize(
        `${itemsTextDiv.innerText.split(':')[0]} (<span id="${whose}InTradeTotal" data-total="${inTradeTotal}">${prettyPrintPrice(currency, inTradeTotal)}</span>):`,
      );
    } else {
      const totalEl = document.getElementById(`${whose}InTradeTotal`);
      totalEl.innerText = prettyPrintPrice(currency, inTradeTotal);
      totalEl.setAttribute('data-total', inTradeTotal);
    }
  });
};

const addPLInfo = () => {
  const yourTotalEl = document.getElementById('yourInTradeTotal');
  const theirTotalEl = document.getElementById('theirInTradeTotal');

  if (yourTotalEl !== null && theirTotalEl !== null) {
    chrome.storage.local.get('currency', ({ currency }) => {
      const yourTotal = parseFloat(yourTotalEl.getAttribute('data-total'));
      const theirTotal = parseFloat(theirTotalEl.getAttribute('data-total'));
      const profitOrLoss = theirTotal - yourTotal;

      const pLClass = profitOrLoss > 0.0 ? 'profit' : 'loss';
      document.getElementById('showSummary').innerHTML = DOMPurify.sanitize(`
        Show trade Summary (<span class="${pLClass}">${prettyPrintPrice(currency, (profitOrLoss).toFixed(2))}</span>)`);
    });
  }
};

const periodicallyUpdateTotals = () => {
  setInterval(() => {
    if (!document.hidden) {
      addInTradeTotals('your');
      addInTradeTotals('their');
      addPLInfo();
    }
  }, 1000);
};

// forces steam to load the item images
const loadAllItemsProperly = () => {
  const loadAllItemsProperlyScript = `
        g_ActiveInventory.pageList.forEach(function (page, index) {
            g_ActiveInventory.pageList[index].images_loaded = false;
            g_ActiveInventory.LoadPageImages(page);
        });`;
  injectScript(loadAllItemsProperlyScript, true, 'loadAllItemsProperly', null);
};

const sortItems = (method, type) => {
  if (isCSGOInventoryActive('offer')) {
    if (type === 'offer') {
      const activeInventory = getActiveInventory();
      const items = activeInventory.querySelectorAll('.item.app730.context2');
      const offerPages = activeInventory.querySelectorAll('.inventory_page');
      doTheSorting(combinedInventories, Array.from(items), method, offerPages, type);
    } else {
      const items = document.getElementById(`trade_${type}s`).querySelectorAll('.item.app730.context2');
      doTheSorting(combinedInventories, Array.from(items), method, document.getElementById(`${type}_slots`), type);
      const inventoryTab = document.querySelector(`[href="#${type}_inventory"]`);
      if (inventoryTab !== null) inventoryTab.classList.add('sorted');
    }

    loadAllItemsProperly();
  }
};

const addFloatDataToPage = (job, floatInfo) => {
  addFloatIndicator(findElementByAssetID(job.assetID), floatInfo);

  // add float and pattern info to page variable
  const item = getItemByAssetID(combinedInventories, job.assetID);
  item.floatInfo = floatInfo;
  item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintseed);
};

const addFloatIndicatorsToPage = (type) => {
  chrome.storage.local.get('autoFloatOffer', ({ autoFloatOffer }) => {
    if (autoFloatOffer && isCSGOInventoryActive('offer')) {
      let itemElements;
      if (type === 'page') {
        const page = getActivePage('offer', getActiveInventory);
        if (page !== null) itemElements = page.querySelectorAll('.item.app730.context2');
        else {
          setTimeout(() => {
            addFloatIndicatorsToPage(type);
          }, 1000);
        }
      } else {
        const page = document.getElementById(`trade_${type}s`);
        if (page !== null) itemElements = page.querySelectorAll('.item.app730.context2');
        else {
          setTimeout(() => {
            addFloatIndicatorsToPage(type);
          }, 1000);
        }
      }
      itemElements.forEach((itemElement) => {
        const item = getItemByAssetID(combinedInventories, getAssetIDOfElement(itemElement));
        if (item.inspectLink !== null) {
          if (item.floatInfo === null && itemTypes[item.type.key].float) {
            floatQueue.jobs.push({
              type: 'offer',
              assetID: item.assetid,
              inspectLink: item.inspectLink,
              callBackFunction: addFloatDataToPage,
            });
          } else addFloatIndicator(itemElement, item.floatInfo);
        }
      });
      if (!floatQueue.active) workOnFloatQueue();
    }
  });
};

const addRealTimePriceToPage = (marketHashName, price, appID, assetID, contextID) => {
  addRealTimePriceIndicator(findElementByIDs(appID, contextID, assetID), price);
};

const addRealTimePricesToQueue = (type) => {
  chrome.storage.local.get(
    ['realTimePricesAutoLoadOffer', 'realTimePricesMode'],
    ({ realTimePricesAutoLoadOffer, realTimePricesMode }) => {
      if (realTimePricesAutoLoadOffer) {
        let itemElements;
        if (type === 'page') {
          const page = getActivePage('offer', getActiveInventory);
          if (page !== null) itemElements = page.querySelectorAll('.item');
          else {
            setTimeout(() => {
              addRealTimePricesToQueue(type);
            }, 1000);
          }
        } else {
          const page = document.getElementById(`trade_${type}s`);
          if (page !== null) itemElements = page.querySelectorAll('.item');
          else {
            setTimeout(() => {
              addRealTimePricesToQueue(type);
            }, 1000);
          }
        }

        itemElements.forEach((itemElement) => {
          const IDs = getIDsFromElement(itemElement);
          const item = getItemByIDs(combinedInventories, IDs.appID, IDs.contextID, IDs.assetID);

          if (item.marketable === 1) {
            priceQueue.jobs.push({
              type: `offer_${realTimePricesMode}`,
              assetID: item.assetid,
              appID: item.appid,
              contextID: item.contextid,
              market_hash_name: item.market_hash_name,
              retries: 0,
              callBackFunction: addRealTimePriceToPage,
            });
          }
        });
        if (!priceQueue.active) workOnPriceQueue();
      }
    },
  );
};

// removes buggy slots that remain behind and break the ui
const removeLeftOverSlots = () => {
  setTimeout(() => {
    document.querySelectorAll('.itemHolder.trade_slot').forEach((slot) => {
      if (slot.parentNode.id !== 'your_slots' && slot.parentNode.id !== 'their_slots') slot.remove();
    });
  }, 500);
};

// moves items to/from being in the offer
const moveItem = (item) => {
  const clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent('dblclick', true, true);
  item.dispatchEvent(clickEvent);
};

const singleClickControlClickHandler = (event) => {
  if (event.ctrlKey) {
    const marketHashNameToLookFor = getItemByAssetID(
      combinedInventories,
      getAssetIDOfElement(event.target.parentNode),
    ).market_hash_name;
    let inInventory;
    if (event.target.parentNode.parentNode.parentNode.parentNode.id === 'their_slots') inInventory = document.getElementById('their_slots');
    else if (event.target.parentNode.parentNode.parentNode.parentNode.id === 'your_slots') inInventory = document.getElementById('your_slots');
    else inInventory = getActiveInventory();

    inInventory.querySelectorAll('.item.app730.context2').forEach((item) => {
      if (getItemByAssetID(
        combinedInventories,
        getAssetIDOfElement(item),
      ).market_hash_name === marketHashNameToLookFor) {
        moveItem(item);
      }
    });

    removeLeftOverSlots();
  } else moveItem(event.target);
};

const rightClickControlHandler = (event) => {
  if (event.ctrlKey) {
    event.preventDefault();
    // prevents the default behavior from happening
    // which would be the context menu appearing in this case
    event.target.parentNode.classList.toggle('cstSelected');
    return false;
  }
};

// single click move, move same with ctrl+click, ctrl +right click to select item for mass moving
const singleClickControlClick = () => {
  document.querySelectorAll('.item.app730.context2').forEach((item) => {
    item.removeEventListener('click', singleClickControlClickHandler);
    item.removeEventListener('click', rightClickControlHandler, false);
  });

  document.querySelectorAll('.item.app730.context2').forEach((item) => {
    item.addEventListener('click', singleClickControlClickHandler);
    item.addEventListener('contextmenu', rightClickControlHandler, false);
  });
};

const doInitSorting = () => {
  chrome.storage.local.get(['offerSortingMode', 'switchToOtherInventory'], (result) => {
    if (result.switchToOtherInventory) {
      const inventoryTab = document.getElementById('inventory_select_their_inventory');
      inventoryTab.click();
      sortItems(result.offerSortingMode, 'their');
      inventoryTab.classList.add('sorted');
    } else {
      const inventoryTab = document.getElementById('inventory_select_your_inventory');
      sortItems(result.offerSortingMode, 'your');
      inventoryTab.classList.add('sorted');
    }
    sortItems(result.offerSortingMode, 'offer');

    addFloatIndicatorsToPage('their');
    addFloatIndicatorsToPage('your');
    addFloatIndicatorsToPage('page');
    addRealTimePricesToQueue('their');
    addRealTimePricesToQueue('your');
    addRealTimePricesToQueue('page');

    document.querySelector(`#offer_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;
    document.querySelector(`#offer_your_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;
    document.querySelector(`#offer_their_sorting_mode [value="${result.offerSortingMode}"]`).selected = true;

    singleClickControlClick();
  });
};

const getInventories = () => {
  yourInventory = getItemInfoFromPage('You');
  theirInventory = getItemInfoFromPage('Them');

  if (yourInventory !== null && theirInventory !== null) {
    const yourBuiltInventory = {
      ...yourInventory,
      [steamApps.CSGO.appID]: (
        yourInventory[steamApps.CSGO.appID] !== undefined
        && yourInventory[steamApps.CSGO.appID] !== null
      )
        ? {
          contextID: yourInventory[steamApps.CSGO.appID].contextID,
          items: buildInventoryStructure(yourInventory[steamApps.CSGO.appID].items),
        }
        : {
          contextID: '2',
          items: [],
        },
    };
    const theirBuiltInventory = {
      ...theirInventory,
      [steamApps.CSGO.appID]: (
        theirInventory[steamApps.CSGO.appID] !== undefined
        && theirInventory[steamApps.CSGO.appID] !== null
      )
        ? {
          contextID: theirInventory[steamApps.CSGO.appID].contextID,
          items: buildInventoryStructure(theirInventory[steamApps.CSGO.appID].items),
        }
        : {
          contextID: '2',
          items: [],
        },
    };

    addPricesAndFloatsToInventory(
      yourBuiltInventory[steamApps.CSGO.appID].items,
    ).then(({ items, total }) => {
      const yourInventoryWithPrices = {
        ...yourBuiltInventory,
        [steamApps.CSGO.appID]: {
          contextID: yourBuiltInventory[steamApps.CSGO.appID].contextID,
          items,
        },
      };
      addPricesAndFloatsToInventory(
        theirBuiltInventory[steamApps.CSGO.appID].items,
      ).then((theirInventoryRes) => {
        const theirInventoryWithPrices = {
          ...theirBuiltInventory,
          [steamApps.CSGO.appID]: {
            contextID: theirBuiltInventory[steamApps.CSGO.appID].contextID,
            items: theirInventoryRes.items,
          },
        };

        for (const app of Object.values(yourInventoryWithPrices)) {
          app.items.forEach((item) => {
            combinedInventories.push(item);
          });
        }

        for (const app of Object.values(theirInventoryWithPrices)) {
          app.items.forEach((item) => {
            combinedInventories.push(item);
          });
        }

        addItemInfo();
        addInventoryTotals(total, theirInventoryRes.total);
        addInTradeTotals('your');
        addInTradeTotals('their');
        addPLInfo();
        periodicallyUpdateTotals();
        doInitSorting();
      });
    });
  } else if (document.getElementById('error_msg') === null) {
    setTimeout(() => {
      getInventories();
    }, 500);
  }
};

const addAPartysFunctionBar = (whose) => {
  // inserts "your" function bar
  document.getElementById(`trade_${whose}s`).querySelector('.offerheader').insertAdjacentHTML(
    'afterend',
    DOMPurify.sanitize(
      `<div id="offer_${whose}_function_bar">
                <div id="offer_${whose}_sorting">
                    <span>Sorting:</span>
                    <select id="offer_${whose}_sorting_mode"></select>
                </div>
                <div id="offer_${whose}_remove">
                    <span>Remove: </span>
                    <span class="offer_action clickable" id="remove_${whose}_everything_button">Everything</span>
                    <input type="number" id="remove_${whose}_number_of_keys" class="keyNumberInput">
                    <span class="offer_action clickable" id="remove_${whose}_keys">Keys</span>
                    <input type="number" id="remove_${whose}_number_of_selected" class="keyNumberInput">
                    <span class="offer_action clickable" id="remove_${whose}_selected" title="Select items with Ctrl + Right Click">Selected</span>
                </div>
            </div>`,
    ),
  );

  // remove your/their everything functionality
  document.getElementById(`remove_${whose}_everything_button`).addEventListener('click', () => {
    document.getElementById(`trade_${whose}s`).querySelectorAll('.item').forEach((item) => { moveItem(item); });
    removeLeftOverSlots();
  });

  // remove your/their keys functionality
  document.getElementById(`remove_${whose}_keys`).addEventListener('click', () => {
    const numberOfKeys = document.getElementById(`remove_${whose}_number_of_keys`).value;
    let keysRemoved = 0;
    document.getElementById(`trade_${whose}s`).querySelectorAll('.item').forEach((item) => {
      if (keysRemoved < numberOfKeys
        && getItemByAssetID(
          combinedInventories,
          getAssetIDOfElement(item),
        ).type.internal_name === itemTypes.key.internal_name) {
        moveItem(item);
        keysRemoved += 1;
      }
      removeLeftOverSlots();
    });
  });

  // remove your/their selected items functionality
  document.getElementById(`remove_${whose}_selected`).addEventListener('click', () => {
    const numberOfSelected = document.getElementById(`remove_${whose}_number_of_selected`).value;
    const itemElements = document.getElementById(`trade_${whose}s`).querySelectorAll('.item');
    let selectedRemoved = 0;

    const selectedItems = [...itemElements].map((item) => {
      if (item.classList.contains('cstSelected')) {
        return getItemByAssetID(combinedInventories, getAssetIDOfElement(item)).market_hash_name;
      }
      return null;
    });

    itemElements.forEach((item) => {
      if (selectedRemoved < numberOfSelected
        && selectedItems.includes(getItemByAssetID(
          combinedInventories,
          getAssetIDOfElement(item),
        ).market_hash_name)) {
        moveItem(item);
        selectedRemoved += 1;
      }
      removeLeftOverSlots();
    });
  });
};

const addFunctionBars = () => {
  if (document.getElementById('responsivetrade_itemfilters') !== null) {
    if (document.getElementById('offer_function_bar') === null) {
      // inserts left side function bar
      document.getElementById('responsivetrade_itemfilters').insertAdjacentHTML(
        'beforebegin',
        DOMPurify.sanitize(
          `<div id="offer_function_bar">
                  <div id="offer_sorting">
                      <span>Sorting:</span>
                      <select id="offer_sorting_mode"></select>
                  </div>
                  <div id="offer_take">
                      <span>Take: </span>
                      <span class="offer_action clickable" id="take_all_button">All page</span>
                      <span class="offer_action clickable" id="take_everything_button">Everything</span>
                      <input type="number" id="take_number_of_keys" class="keyNumberInput">
                      <span class="offer_action clickable" id="take_keys">Keys</span>
                      <input type="number" id="take_number_of_selected" class="keyNumberInput">
                      <span class="offer_action clickable" id="take_selected" title="Select items with Ctrl + Right Click">Selected</span>
                  </div>
                </div>`,
        ),
      );

      // take all from page functionality
      document.getElementById('take_all_button').addEventListener('click', () => {
        let activePage = null;

        getActiveInventory().querySelectorAll('.inventory_page').forEach((page) => {
          if (page.style.display !== 'none') activePage = page;
        });
        activePage.querySelectorAll('.item').forEach((item) => { moveItem(item); });
      });

      // take everything functionality
      document.getElementById('take_everything_button').addEventListener('click', () => {
        getActiveInventory().querySelectorAll('.item').forEach((item) => {
          moveItem(item);
        });
      });

      // add keys functionality
      document.getElementById('take_keys').addEventListener('click', () => {
        const numberOfKeys = document.getElementById('take_number_of_keys').value;
        let keysTaken = 0;
        getActiveInventory().querySelectorAll('.item').forEach((item) => {
          if (keysTaken < numberOfKeys
            && getItemByAssetID(
              combinedInventories,
              getAssetIDOfElement(item),
            ).type.internal_name === itemTypes.key.internal_name) {
            moveItem(item);
            keysTaken += 1;
          }
        });
      });

      // add selected functionality
      document.getElementById('take_selected').addEventListener('click', () => {
        const numberOfSelected = document.getElementById('take_number_of_selected').value;
        const itemElements = getActiveInventory().querySelectorAll('.item');
        let selectedTaken = 0;

        // goes through the items and collects the names of the selected ones
        const selectedItems = [...itemElements].map((item) => {
          if (item.classList.contains('cstSelected')) {
            return getItemByAssetID(
              combinedInventories,
              getAssetIDOfElement(item),
            ).market_hash_name;
          }
          return null;
        });

        itemElements.forEach((item) => {
          if (selectedTaken < numberOfSelected
            && selectedItems.includes(getItemByAssetID(
              combinedInventories,
              getAssetIDOfElement(item),
            ).market_hash_name)) {
            moveItem(item);
            selectedTaken += 1;
          }
        });
      });

      addAPartysFunctionBar('your');
      addAPartysFunctionBar('their');

      const sortingSelect = document.getElementById('offer_sorting_mode');
      const yourSortingSelect = document.getElementById('offer_your_sorting_mode');
      const theirSortingSelect = document.getElementById('offer_their_sorting_mode');

      const keys = Object.keys(sortingModes);
      for (const key of keys) {
        const option = document.createElement('option');
        if (key !== 'tradability_desc' && key !== 'tradability_asc') {
          option.value = sortingModes[key].key;
          option.text = sortingModes[key].name;
          sortingSelect.appendChild(option);
          yourSortingSelect.appendChild(option.cloneNode(true));
          theirSortingSelect.appendChild(option.cloneNode(true));
        }
      }
      sortingSelect.addEventListener('change', () => {
        // analytics
        trackEvent({
          type: 'event',
          action: 'OfferSorting',
        });

        sortItems(sortingSelect.options[sortingSelect.selectedIndex].value, 'offer');
        addFloatIndicatorsToPage('page');
      });
      yourSortingSelect.addEventListener('change', () => {
        // analytics
        trackEvent({
          type: 'event',
          action: 'OfferSorting',
        });

        sortItems(yourSortingSelect.options[yourSortingSelect.selectedIndex].value, 'your');
        addFloatIndicatorsToPage('your');
      });
      theirSortingSelect.addEventListener('change', () => {
        // analytics
        trackEvent({
          type: 'event',
          action: 'OfferSorting',
        });

        sortItems(theirSortingSelect.options[theirSortingSelect.selectedIndex].value, 'their');
        addFloatIndicatorsToPage('their');
      });
    }
  } else {
    setTimeout(() => {
      addFunctionBars();
    }, 500);
  }
};

// future proofing
// const getOfferID = () => {
//     return window.location.href.split('tradeoffer/')[1].split('/')[0];
// };

// gets the other party's steam id in a trade offer
const getTradePartnerSteamID = () => {
  const tradePartnerSteamIDScript = 'document.querySelector(\'body\').setAttribute(\'tradePartnerSteamID\', g_ulTradePartnerSteamID);';
  return injectScript(tradePartnerSteamIDScript, true, 'tradePartnerSteamID', 'tradePartnerSteamID');
};

// add an info card to the top of the offer about offer history with the user (sent/received)
const addPartnerOfferSummary = () => {
  chrome.storage.local.get(['tradeHistoryOffers', `offerHistory_${getTradePartnerSteamID()}`, 'apiKeyValid'], (result) => {
    let offerHistory = result[`offerHistory_${getTradePartnerSteamID()}`];
    const headline = document.querySelector('.trade_partner_headline');

    if (result.tradeHistoryOffers) {
      if (offerHistory === undefined) {
        offerHistory = {
          offers_received: 0,
          offers_sent: 0,
          last_received: 0,
          last_sent: 0,
        };
      }

      if (headline !== null) {
        if (result.apiKeyValid) {
          headline.insertAdjacentHTML(
            'afterend',
            DOMPurify.sanitize(
              `<div class="trade_partner_info_block" style="color: lightgray"> 
                        <div title="${dateToISODisplay(offerHistory.last_received)}">Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? prettyTimeAgo(offerHistory.last_received) : '-'}</div>
                        <div title="${dateToISODisplay(offerHistory.last_sent)}">Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? prettyTimeAgo(offerHistory.last_sent) : '-'}</div>
                    </div>`,
            ),
          );
        } else {
          headline.insertAdjacentHTML(
            'afterend',
            DOMPurify.sanitize(
              `<div class="trade_partner_info_block" style="color: lightgray"> 
                        <div><b>CSGOTrader Extension:</b> It looks like you don't have your Steam API Key set yet.</div>
                        <div>If you had that you would see partner offer history here. Check the <a href="https://csgotrader.app/release-notes#1.23">Release Notes</a> for more info.</div>
                    </div>`,
            ),
          );
        }
      }
    }
  });
};

// adds an info card if there is an incoming friend request
// from the trade partner
const addFriendRequestInfo = () => {
  const partnerSteamID = getTradePartnerSteamID();
  chrome.storage.local.get(['friendRequests'], ({ friendRequests }) => {
    // checks if there is an incoming friend request from this user
    const friendRequestFromPartner = friendRequests.inviters.filter((inviter) => {
      return inviter.steamID === partnerSteamID;
    });

    if (friendRequestFromPartner.length === 1) {
      const headline = document.querySelector('.trade_partner_headline');
      if (headline !== null) {
        headline.insertAdjacentHTML(
          'afterend',
          DOMPurify.sanitize(
            `<div class="trade_partner_info_block" style="color: lightgray"> 
                    <a href="https://steamcommunity.com/profiles/${partnerSteamID}" target="_blank">
                        You have an incoming friend request from this user
                    </a>    
                  </div>`,
            { ADD_ATTR: ['target'] },
          ),
        );
      }
    }
  });
};

logExtensionPresence();

// initiates all logic that needs access to item info
getInventories();

// adds "get float value" action item
overrideHandleTradeActionMenu();

repositionNameTagIcons();

injectStyle(`
    a.inventory_item_link {
        top: 20px !important;
    }`, 'itemLinkSmaller');
updateLoggedInUserInfo();
trackEvent({
  type: 'pageview',
  action: 'TradeOfferView',
});

const getPartnerNameScript = "document.querySelector('body').setAttribute('partnerName', g_strTradePartnerPersonaName)";
const partnerName = injectScript(getPartnerNameScript, true, 'partnerName', 'partnerName');
if (partnerName !== null) changePageTitle('trade_offer', partnerName);

// changes background and adds a banner if steamrep banned scammer detected
chrome.storage.local.get('markScammers', (result) => {
  if (result.markScammers) warnOfScammer(getTradePartnerSteamID(), 'offer');
});

setInterval(() => {
  chrome.storage.local.get('hideOtherExtensionPrices', (result) => {
    if (result.hideOtherExtensionPrices && !document.hidden) removeSIHStuff();
  });
}, 2000);

document.querySelectorAll('.inventory_user_tab').forEach((inventoryTab) => {
  inventoryTab.addEventListener('click', () => {
    addItemInfo();
    if (!inventoryTab.classList.contains('sorted')) {
      const sortingSelect = document.getElementById('offer_sorting_mode');
      sortItems(sortingSelect.options[sortingSelect.selectedIndex].value, 'offer');
      inventoryTab.classList.add('sorted');
    }
  });
});

const inventorySelector = document.getElementById('appselect');
if (inventorySelector !== null) {
  document.getElementById('appselect').addEventListener('click', () => {
    setTimeout(() => {
      if (isCSGOInventoryActive('offer')) addItemInfo();
    }, 2000);
  });
}

chrome.storage.local.get('tradeOfferHeaderToLeft', (result) => {
  if (result.tradeOfferHeaderToLeft) {
    injectStyle(`
    @media (min-width: 1500px) {
        body, .pagecontent {
            width: 100%
        }

        .trade_partner_header {
            width: 450px;
            float: left;
            margin: 20px;
        }

        .trade_area {
            float: left;
            width: 936px;
            margin-top: 20px;
        }

        .trade_partner_info_block {
            float: none;
        }

        .trade_partner_recently_changed_name, .trade_partner_headline_sub, .trade_partner_headline_sub .nickname_block {
            display: block;
        }

        .trade_partner_info_text {
            white-space: unset;
        }
    }
`, 'headerToSide');
  }
});

addPageControlEventListeners('offer', addFloatIndicatorsToPage);
addSearchListener('offer', addFloatIndicatorsToPage);

const theirInventoryTab = document.getElementById('inventory_select_their_inventory');
if (theirInventoryTab !== null) {
  // if the offer is "active"
  document.getElementById('inventory_select_their_inventory').addEventListener('click', () => {
    singleClickControlClick();
    setTimeout(() => { addFloatIndicatorsToPage('page'); }, 500);
  });
}

// if it's an existing trade offer with an id and not a new one to be created
if (offerID !== 'new') {
  const declineButton = document.getElementById('btn_decline_trade_offer');
  if (declineButton !== null) {
    declineButton.addEventListener('click', () => {
      removeOfferFromActiveOffers(offerID);
    });

    document.querySelector('.readystate.modify_trade_offer').addEventListener('click', () => {
      declineButton.setAttribute('onclick', '');
      declineButton.style.display = 'inline-block';
      declineButton.addEventListener('click', () => {
        declineOffer(offerID).then(() => {
          removeOfferFromActiveOffers(offerID);
          if (window.opener !== null) window.close();
          else window.location.reload();
        });
      });
    });
  }
}

// trade summary
const filterMenu = document.getElementById('nonresponsivetrade_itemfilters');
if (filterMenu !== null) {
  filterMenu.insertAdjacentHTML('beforebegin',
    `<div id="offerSummary">
            <div>
                <span class="clickable bold" id="showSummary">
                    Show trade summary
                </span>
            </div>
            <div id="summary" class="hidden">
              <div id="yourSummary" class="sideSummary">
                  <span class="bold underline">Your items</span>
                  <ul class="summaryList"></ul>
                  <div class="summaryTotal">
                    <span class="numberOfItems">1</span>
                    item(s) worth
                    <span class="total">$</span>
                  </div>
              </div>
              <div id="theirSummary" class="sideSummary">
                  <span class="bold underline">Their items</span>
                  <ul class="summaryList"></ul>
                   <div class="summaryTotal">
                    <span class="numberOfItems">1</span>
                    item(s) worth
                    <span class="total">$</span>
                  </div>
              </div>
            </div>
          </div>`);
  document.getElementById('showSummary').addEventListener('click', () => {
    document.getElementById('summary').classList.remove('hidden');
  });
}

addFunctionBars();
addPartnerOfferSummary();
addFriendRequestInfo();

reloadPageOnExtensionReload();
