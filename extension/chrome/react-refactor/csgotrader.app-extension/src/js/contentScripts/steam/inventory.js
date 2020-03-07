import {
  addPageControlEventListeners, getItemByAssetID,
  getAssetIDOfElement, makeItemColorful, addDopplerPhase,
  addSSTandExtIndicators, addFloatIndicator, addPriceIndicator,
  getDataFilledFloatTechnical, souvenirExists,
  getSteamWalletCurrency, findElementByAssetID, getFloatBarSkeleton,
  logExtensionPresence, isCSGOInventoryActive,
  updateLoggedInUserID, reloadPageOnExtensionReload, isSIHActive, getActivePage,
  addSearchListener, getPattern, removeFromArray,
}
  from 'js/utils/utilsModular';
import { getShortDate, dateToISODisplay, prettyTimeAgo } from 'js/utils/dateTime';
import {
  stattrak, starChar, souvenir, stattrakPretty, genericMarketLink,
} from 'js/utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from 'js/utils/floatQueueing';
import {
  getPriceOverview, getPriceAfterFees, userPriceToProperPrice,
  centsToSteamFormattedPrice, prettyPrintPrice, steamFormattedPriceToCents,
  priceQueue, workOnPriceQueue,
}
  from 'js/utils/pricing';
import { sortingModes } from 'js/utils/static/sortingModes';
import { doTheSorting } from 'js/utils/sorting';
import { overridePopulateActions } from 'js/utils/steamOverriding';
import { trackEvent } from 'js/utils/analytics';
import itemTypes from 'js/utils/static/itemTypes';
import exteriors from 'js/utils/static/exteriors';
import { injectScript, injectStyle } from 'js/utils/injection';
import { getUserSteamID } from 'js/utils/steamID';

// sends a message to the "back end" to request inventory contents
const requestInventory = () => {
  chrome.runtime.sendMessage({ inventory: getInventoryOwnerID() }, (response) => {
    if (!(response === undefined || response.inventory === undefined || response.inventory === '' || response.inventory === 'error')) {
      items = response.inventory;
      addElements();
      addPerItemInfo();
      setInventoryTotal(items);
      addFunctionBar();
      loadFullInventory();
      addPageControlEventListeners('inventory', addFloatIndicatorsToPage);
    } else {
      console.log("Wasn't able to get the inventory, it's most likely steam not working properly or you loading inventory pages at the same time");
      console.log('Retrying in 30 seconds');

      setTimeout(() => {
        requestInventory(); // this rarely works, consider removing
      }, 30000);
    }
  });
};

const getInventoryOwnerID = () => {
  const inventoryOwnerIDScript = 'document.querySelector(\'body\').setAttribute(\'inventoryOwnerID\', UserYou.GetSteamId());';
  return injectScript(inventoryOwnerIDScript, true, 'inventoryOwnerID', 'inventoryOwnerID');
};

// adds everything that is per item, like trade lock, exterior, doppler phases, border colors
const addPerItemInfo = () => {
  const itemElements = document.querySelectorAll('.item.app730.context2');
  if (itemElements.length !== 0) {
    chrome.storage.local.get(['colorfulItems', 'autoFloatInventory', 'showStickerPrice'], (result) => {
      itemElements.forEach((itemElement) => {
        if (itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false') {
          // in case the inventory is not loaded yet it retries in a second
          if (itemElement.id === undefined) {
            setTimeout(() => {
              addPerItemInfo();
            }, 1000);
            return false;
          }

          const item = getItemByAssetID(items, getAssetIDOfElement(itemElement));
          // adds tradability indicator
          if (item.tradability === 'Tradable') itemElement.insertAdjacentHTML('beforeend', '<div class="perItemDate tradable">T</div>');
          else if (item.tradability !== 'Not Tradable') itemElement.insertAdjacentHTML('beforeend', `<div class="perItemDate not_tradable">${item.tradabilityShort}</div>`);

          addDopplerPhase(itemElement, item.dopplerInfo);
          makeItemColorful(itemElement, item, result.colorfulItems);
          addSSTandExtIndicators(itemElement, item, result.showStickerPrice);
          addPriceIndicator(itemElement, item.price);
          if (result.autoFloatInventory) addFloatIndicator(itemElement, item.floatInfo);

          // marks the item "processed" to avoid additional unnecessary work later
          itemElement.setAttribute('data-processed', 'true');
        }
      });
    });
  }
  // in case the inventory is not loaded yet
  else {
    setTimeout(() => {
      addPerItemInfo();
    }, 1000);
  }
};

const updateTradabilityIndicators = () => {
  const itemElements = document.querySelectorAll('.item.app730.context2');
  if (itemElements.length !== 0) {
    itemElements.forEach((itemElement) => {
      const item = getItemByAssetID(items, getAssetIDOfElement(itemElement));
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

const addElements = () => {
  // only add elements if the CS:GO inventory is the active one
  if (isCSGOInventoryActive('inventory')) {
    const activeID = getAssetIDofActive();
    if (activeID !== null) {
      const item = getItemByAssetID(items, activeID);

      // removes "tags" and "tradable after" in one's own inventory
      document.querySelectorAll('#iteminfo1_item_tags, #iteminfo0_item_tags, #iteminfo1_item_owner_descriptors, #iteminfo0_item_owner_descriptors').forEach((tagsElement) => {
        tagsElement.remove();
      });

      // cleans up previously added elements
      cleanUpElements(false);

      // removes previously added listeners
      document.querySelectorAll('.showTechnical, .lowerModule').forEach((element) => {
        element.removeEventListener('click');
      });

      // adds float bar, sticker info, nametag
      document.querySelectorAll('.item_desc_icon').forEach((icon) => {
        icon.insertAdjacentHTML('afterend', upperModule);
      });

      // listens to click on "show technical"
      document.querySelectorAll('.showTechnical').forEach((showTechnical) => {
        showTechnical.addEventListener('click', () => {
          document.querySelectorAll('.floatTechnical').forEach((floatTechnical) => {
            floatTechnical.classList.toggle('hidden');
          });
        });
      });

      // allows the float pointer's text to go outside the boundaries of the item - they would not be visible otherwise on high-float items
      // also removes background from the right side of the page
      document.querySelectorAll('.item_desc_content').forEach((item_desc_content) => {
        item_desc_content.setAttribute('style', 'overflow: visible; background-image: url()');
      });

      // adds the lower module that includes tradability, countdown  and bookmarking
      document.querySelectorAll('#iteminfo1_item_actions, #iteminfo0_item_actions').forEach((action) => {
        action.insertAdjacentHTML('afterend', lowerModule);
      });

      document.querySelectorAll('.lowerModule').forEach((module) => {
        module.addEventListener('click', (event) => {
          addBookmark(event.target);
        });
      });

      if (item) {
        // adds the nametag text to nametags
        document.querySelectorAll('.nametag').forEach((nametag) => {
          if (item.nametag !== undefined) {
            nametag.innerText = item.nametag;
            document.querySelectorAll('.fraud_warning').forEach((fraud_warning) => {
              fraud_warning.outerHTML = '';
            });
          } else nametag.style.display = 'none';
        });

        // repositions stickers
        if (item.stickers.length !== 0) {
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
              customStickers.innerHTML += `
                                    <div class="stickerSlot" data-tooltip="${stickerInfo.name} (${stickerInfo.price.display})">
                                        <a href="${stickerInfo.marketURL}" target="_blank">
                                            <img src="${stickerInfo.iconURL}" class="stickerIcon">
                                        </a>
                                    </div>
                                    `;
            });
          });
        }

        // adds duplicates counts
        document.querySelectorAll('.duplicate').forEach((duplicate) => {
          duplicate.style.display = 'block';
          duplicate.innerText = `x${item.duplicates.num}`;
        });

        // sets the tradability info
        document.querySelectorAll('.tradabilityDiv').forEach((tradabilityDiv) => {
          if (item.tradability === 'Tradable') {
            tradabilityDiv.innerHTML = tradable;
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'none';
            });
          } else if (item.tradability === 'Not Tradable') {
            tradabilityDiv.innerHTML = notTradable;
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'none';
            });
          } else {
            const tradableAt = new Date(item.tradability).toString().split('GMT')[0];
            tradabilityDiv.innerHTML = `<span class='not_tradable'>Tradable After ${tradableAt}</span>`;
            countDown(tradableAt);
            document.querySelectorAll('.countdown').forEach((countdown) => {
              countdown.style.display = 'block';
            });
          }
        });


        // adds doppler phase  to the name and makes it a link to the market listings page
        const name = getItemByAssetID(getItemInfoFromPage(), activeID).description.name;
        changeName(name, item.name_color, item.marketlink, item.dopplerInfo);

        // removes sih "Get Float" button - does not really work since it's loaded after this script..
        if (isSIHActive()) {
          document.querySelectorAll('.float_block').forEach((e) => e.remove());
          setTimeout(() => {
            document.querySelectorAll('.float_block').forEach((e) => e.remove());
          }, 1000);
        }
        if (item.floatInfo === null) {
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
          addFloatIndicator(findElementByAssetID(item.assetid), item.floatInfo);
        }

        // it takes the visible descriptors and checks if the collection includes souvenirs
        let textOfDescriptors = '';
        document.querySelectorAll('.descriptor').forEach((descriptor) => {
          if (descriptor.parentNode.classList.contains('item_desc_descriptors') && descriptor.parentNode.parentNode.parentNode.parentNode.style.display !== 'none') {
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
          document.querySelectorAll('#iteminfo1_item_descriptors, #iteminfo0_item_descriptors').forEach((descriptor) => {
            descriptor.insertAdjacentHTML('afterend', otherExteriors);
          });
        }

        // adds "starting at" and sales volume to everyone's inventory
        if (!isOwnInventory()) addStartingAtPrice(item.market_hash_name);
      }
    } else console.log('Could not get assetID of active item');
  } else {
    document.querySelectorAll('.countdown').forEach((countdown) => {
      countdown.style.display = 'none';
    });
  }
};

const cleanUpElements = (nonCSGOInventory) => {
  document.querySelectorAll('.upperModule, .lowerModule, .otherExteriors, .custom_name, .startingAtVolume').forEach((element) => {
    element.remove();
  });

  if (nonCSGOInventory) {
    document.querySelectorAll('.hover_item_name').forEach((name) => {
      name.classList.remove('hidden');
    });
  }
};

// gets the asset id of the item that is currently selected
const getAssetIDofActive = () => {
  return getAssetIDOfElement(document.querySelector('.activeInfo'));
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

// it hides the original item name element and replaces it with one that is a link to it's market page and adds the doppler phase to the name
const changeName = (name, color, link, dopplerInfo) => {
  const newNameElement = dopplerInfo !== null
    ? `<a class="hover_item_name custom_name" style="color: #${color}" href="${link}" target="_blank">${name} (${dopplerInfo.name})</a>`
    : `<a class="hover_item_name custom_name" style="color: #${color}" href="${link}" target="_blank">${name}</a>`;

  document.querySelectorAll('.hover_item_name').forEach((name) => {
    name.insertAdjacentHTML('afterend', newNameElement);
    name.classList.add('hidden');
  });
};

const addBookmark = (module) => {
  // analytics
  trackEvent({
    type: 'event',
    action: 'AddBookmark',
  });

  const item = getItemByAssetID(items, getAssetIDofActive());
  const bookmark = {
    itemInfo: item,
    owner: getInventoryOwnerID(),
    comment: '',
    notify: true,
    notifTime: item.tradability.toString(),
    notifType: 'chrome',
  };

  chrome.storage.local.get('bookmarks', (result) => {
    chrome.storage.local.set({ bookmarks: [...result.bookmarks, bookmark] }, () => {
      if (bookmark.itemInfo.tradability !== 'Tradable') {
        chrome.runtime.sendMessage({
          setAlarm: {
            name: bookmark.itemInfo.assetid,
            when: bookmark.itemInfo.tradability,
          },
        }, (response) => {});
      }

      chrome.runtime.sendMessage({ openInternalPage: 'index.html?page=bookmarks' }, (response) => {
        if (response.openInternalPage === 'no_tabs_api_access') module.querySelector('.descriptor.tradability.bookmark').innerText = 'Bookmarked! Open the bookmarks menu to see what you have saved!';
      });
    });
  });
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

  // csgofloat
  document.querySelectorAll('.csgofloat-itemfloat, .csgofloat-itemseed').forEach((csFElement) => {
    csFElement.style.display = 'none';
  });
};

const setInventoryTotal = (items) => {
  const inventoryTotalValueElement = document.getElementById('inventoryTotalValue');
  chrome.runtime.sendMessage({ inventoryTotal: items }, (response) => {
    if (!(response === undefined || response.inventoryTotal === undefined || response.inventoryTotal === '' || response.inventoryTotal === 'error' || inventoryTotalValueElement === null)) {
      inventoryTotalValueElement.innerText = response.inventoryTotal;
    } else {
      setTimeout(() => {
        setInventoryTotal(items);
      }, 1000);
    }
  });
};

const addFunctionBar = () => {
  if (document.getElementById('inventory_function_bar') === null) {
    const hand_pointer = chrome.runtime.getURL('images/hand-pointer-solid.svg');
    const table = chrome.runtime.getURL('images/table-solid.svg');

    document.querySelector('.filter_ctn.inventory_filters').insertAdjacentHTML('afterend', `
                <div id="inventory_function_bar">
                    <div id="functionBarValues" class="functionBarRow">
                        <span id="selectedTotal"><span>Selected Items Value: </span><span id="selectedTotalValue">0.00</span></span>
                        <span id="inventoryTotal"><span>Total Inventory Value: </span><span id="inventoryTotalValue">0.00</span></span>
                    </div>
                    <div id="functionBarActions" class="functionBarRow">
                        <span id="selectMenu">
                            <img id ="selectButton" class="clickable" src="${hand_pointer}" title="Start Selecting Items">
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
                                <input id="generate_duplicates" type="checkbox">
                                <span>Non-Marketable</span>
                                <input id="generate_non_market" type="checkbox">
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
                            <textarea class="hidden-copy-textarea" id="generated_list_copy_textarea"></textarea>
                    </div>
                    <div id="massListing" class="hidden">
                    <h2>Mass Market Listing - Select Items to Start</h2>
                    <h3>Check out the <a href="https://csgotrader.app/release-notes#1.22" target="_blank">Release Notes</a> for a quick guide about the Mass Listing feature</h3>
                    <div class="hidden not_tradable" id="currency_mismatch_warning">Warning: Your Steam Wallet currency and CSGO Trader currency are not the same. <span class="underline" id="changeCurrency">Click here to fix this</span></div>
                        <table id="listingTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Extension price</th>
                                    <th>Starting at</th>
                                    <th>Quick sell</th>
                                    <th>Instant Sell</th>
                                    <th>Your price</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                        <span>
                            <span style="font-weight: bold">Total:</span> To list <span id="numberOfItemsToSell">0</span> item(s) worth <span id="saleTotal">0</span>
                            and receive <span id="saleTotalAfterFees">0</span> after fees
                            <span id="sellButton" class="clickable">Start Mass Listing</span>
                        </span>
                        <div id="massSellError" class="hidden not_tradable"></div>
                    </div>
                </div>
                `);

    document.getElementById('sellButton').addEventListener('click', (event) => {
      event.target.innerText = 'Mass Listing in Progress...';
      const startSellingScript = 'sellNext()';
      injectScript(startSellingScript, true, 'startSelling', false);
    });

    // shows currency mismatch warning and option to change currency
    chrome.storage.local.get('currency', (result) => {
      const walletCurrency = getSteamWalletCurrency();
      if (walletCurrency !== result.currency) {
        document.getElementById('currency_mismatch_warning').classList.remove('hidden');
        document.getElementById('changeCurrency').addEventListener('click', () => {
          chrome.storage.local.set({ currency: walletCurrency }, () => {
            window.location.reload();
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

    document.getElementById('selectButton').addEventListener('click', (event) => {
      if (event.target.classList.contains('selectionActive')) {
        // analytics
        trackEvent({
          type: 'event',
          action: 'SelectionStopped',
        });

        unselectAllItems();
        updateSelectedItemsSummary();
        event.target.classList.remove('selectionActive');

        if (isOwnInventory()) {
          document.getElementById('massListing').classList.add('hidden');
          document.getElementById('listingTable').querySelector('tbody').innerHTML = '';
        }
        document.body.removeEventListener('click', listenSelectClicks, false);
      } else {
        // analytics
        trackEvent({
          type: 'event',
          action: 'SelectionInitiated',
        });

        document.body.addEventListener('click', listenSelectClicks, false);
        event.target.classList.add('selectionActive');
        if (isOwnInventory()) document.getElementById('massListing').classList.remove('hidden');
      }
    });

    sortingSelect.addEventListener('change', () => {
      // analytics
      trackEvent({
        type: 'event',
        action: 'InventorySorting',
      });

      sortItems(items, sortingSelect.options[sortingSelect.selectedIndex].value);
      addFloatIndicatorsToPage(getActivePage('inventory'));
    });

    document.getElementById('generate_list').addEventListener('click', () => { document.getElementById('functionBarGenerateMenu').classList.toggle('hidden'); });

    document.getElementById('generate_button').addEventListener('click', generateItemsList);
  } else setTimeout(() => { setInventoryTotal(items); }, 1000);
};

const updateSelectedItemsSummary = () => {
  const selectedItems = document.querySelectorAll('.item.app730.context2.selected');
  const numberOfSelectedItems = selectedItems.length;
  let selectedTotal = 0;

  document.getElementById('numberOfItemsToSell').innerText = numberOfSelectedItems.toString();

  selectedItems.forEach((itemElement) => {
    const item = getItemByAssetID(items, getAssetIDOfElement(itemElement));
    selectedTotal += parseFloat(item.price.price);

    if (item.marketable === 1) {
      const listingRow = getListingRow(item.market_hash_name);

      if (listingRow === null) {
        addListingRow(item);
        addToPriceQueueIfNeeded(item);
      } else {
        const previIDs = listingRow.getAttribute('data-assetids');
        if (!previIDs.includes(item.assetid)) {
          listingRow.setAttribute('data-assetids', `${previIDs},${item.assetid}`);
          listingRow.querySelector('.itemAmount').innerText = previIDs.split(',').length + 1;
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

const unselectAllItems = () => {
  document.querySelectorAll('.item.app730.context2').forEach((item) => {
    item.classList.remove('selected');
  });
};

const sortItems = (items, method) => {
  if (isCSGOInventoryActive('inventory')) {
    const itemElements = document.querySelectorAll('.item.app730.context2');
    const inventoryPages = document.getElementById('inventories').querySelectorAll('.inventory_page');
    doTheSorting(items, Array.from(itemElements), method, Array.from(inventoryPages), 'inventory');
    addPerItemInfo();
  }
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

const doInitSorting = () => {
  chrome.storage.local.get('inventorySortingMode', (result) => {
    sortItems(items, result.inventorySortingMode);
    document.querySelector(`#sortingMethod [value="${result.inventorySortingMode}"]`).selected = true;
    document.querySelector(`#generate_sort [value="${result.inventorySortingMode}"]`).selected = true;
    addFloatIndicatorsToPage(getActivePage('inventory'));
  });
};

const generateItemsList = () => {
  // analytics
  trackEvent({
    type: 'event',
    action: 'GenerateList',
  });

  const generateSorting = document.getElementById('generate_sort');
  const sortingMode = generateSorting.options[generateSorting.selectedIndex].value;
  const sortedItems = doTheSorting(items, Array.from(document.querySelectorAll('.item.app730.context2')), sortingMode, null, 'simple_sort');
  const copyTextArea = document.getElementById('generated_list_copy_textarea');
  copyTextArea.value = '';

  const delimiter = document.getElementById('generate_delimiter').value;

  const limit = document.getElementById('generate_limit').value;

  const exteriorSelect = document.getElementById('generate_exterior');
  const exteriorSelected = exteriorSelect.options[exteriorSelect.selectedIndex].value;
  const exteriorType = exteriorSelected === 'full' ? 'name' : 'short';

  const showPrice = document.getElementById('generate_price').checked;
  const showTradability = document.getElementById('generate_tradability').checked;
  const includeDupes = document.getElementById('generate_duplicates').checked;
  const includeNonMarketable = document.getElementById('generate_non_market').checked;

  let lineCount = 0;
  let characterCount = 0;
  const namesAlreadyInList = [];

  let csvContent = 'data:text/csv;charset=utf-8,';
  const headers = `Name,Exterior${showPrice ? ',Price' : ''}${showTradability ? ',Tradability' : ''}${includeDupes ? '' : ',Duplicates'}\n`;
  csvContent += headers;

  sortedItems.forEach((itemElement) => {
    const item = getItemByAssetID(items, getAssetIDOfElement(itemElement));
    const price = (showPrice && item.price !== null) ? ` ${delimiter} ${item.price.display}` : '';
    const priceCSV = (showPrice && item.price !== null) ? `,${item.price.display}` : '';
    const exterior = (item.exterior !== undefined && item.exterior !== null) ? item.exterior[exteriorType] : '';
    const tradableAt = new Date(item.tradability).toString().split('GMT')[0];
    const tradability = (showTradability && tradableAt !== 'Invalid Date') ? `${delimiter} ${tradableAt}` : '';
    const tradabilityCSV = (showTradability && tradableAt !== 'Invalid Date') ? `,${tradableAt}` : '';
    const duplicate = (!includeDupes && item.duplicates.num !== 1) ? `${delimiter} x${item.duplicates.num}` : '';
    const duplicateCSV = (!includeDupes && item.duplicates.num !== 1) ? `,x${item.duplicates.num}` : '';
    const line = `${item.name} ${delimiter} ${exterior}${price}${tradability} ${duplicate}\n`;
    const lineCSV = `"${item.name}",${exterior}${priceCSV}${tradabilityCSV}${duplicateCSV}\n`;

    if (lineCount < limit) {
      if (includeDupes || (!includeDupes && !namesAlreadyInList.includes(item.market_hash_name))) {
        if ((!includeNonMarketable && item.tradability !== 'Not Tradable') || (item.tradability === 'Not Tradable' && includeNonMarketable)) {
          namesAlreadyInList.push(item.market_hash_name);
          copyTextArea.value += line;
          csvContent += lineCSV;
          characterCount += line.length;
          lineCount++;
        }
      }
    }
  });
  const encodedURI = encodeURI(csvContent);
  const downloadButton = document.getElementById('generate_download');
  downloadButton.setAttribute('href', encodedURI);
  downloadButton.classList.remove('hidden');
  downloadButton.setAttribute('download', `${getInventoryOwnerID()}_csgo_items.csv`);

  copyTextArea.select();
  document.execCommand('copy');

  document.getElementById('generation_result').innerText = `${lineCount} lines (${characterCount} chars) generated and copied to clipboard`;
};

const setFloatBarWithData = (floatInfo) => {
  const floatTechnicalElement = getDataFilledFloatTechnical(floatInfo);

  document.querySelectorAll('.floatTechnical').forEach((floatTechnical) => {
    floatTechnical.innerHTML = floatTechnicalElement;
  });

  const position = (floatInfo.floatvalue.toFixedNoRounding(2) * 100) - 2;
  document.querySelectorAll('.floatToolTip').forEach((floatToolTip) => {
    floatToolTip.setAttribute('style', `left: ${position}%`);
  });
  document.querySelectorAll('.floatDropTarget').forEach((floatDropTarget) => {
    floatDropTarget.innerText = floatInfo.floatvalue.toFixedNoRounding(4);
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
      const wear = stickerInfo.wear !== undefined ? Math.trunc(Math.abs(1 - stickerInfo.wear) * 100) : 100;

      document.querySelectorAll('.customStickers').forEach((customStickers) => {
        const currentSticker = customStickers.querySelectorAll('.stickerSlot')[index];

        if (currentSticker !== undefined) {
          const currentToolTipText = currentSticker.getAttribute('data-tooltip');
          currentSticker.setAttribute('data-tooltip', `${currentToolTipText} - Condition: ${wear}%`);
          currentSticker.querySelector('img').setAttribute('style', `opacity: ${(wear > 10) ? wear / 100 : (wear / 100) + 0.1}`);
        }
      });
    });
  }
};

const hideFloatBars = () => {
  document.querySelectorAll('.floatBar').forEach((floatBar) => {
    floatBar.classList.add('hidden');
  });
};

const addFloatIndicatorsToPage = (page) => {
  chrome.storage.local.get('autoFloatInventory', (result) => {
    if (result.autoFloatInventory) {
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
  });
};

const updateFloatAndPatternElements = (item) => {
  setFloatBarWithData(item.floatInfo);
  setPatternInfo(item.patternInfo);
  setStickerInfo(item.floatInfo.stickers);
};

const getItemInfoFromPage = () => {
  const getItemsSccript = `
        inventory = UserYou.getInventory(730,2);
        assets = inventory.m_rgAssets;
        assetKeys= Object.keys(assets);
        trimmedAssets = [];
                
        for(let assetKey of assetKeys){
            trimmedAssets.push({
                amount: assets[assetKey].amount,
                assetid: assets[assetKey].assetid,
                contextid: assets[assetKey].contextid,
                description: assets[assetKey].description
            });
        }
        document.querySelector('body').setAttribute('inventoryInfo', JSON.stringify(trimmedAssets));`;
  return JSON.parse(injectScript(getItemsSccript, true, 'getInventory', 'inventoryInfo'));
};

// adds market info in other inventories
const addStartingAtPrice = (market_hash_name) => {
  getPriceOverview('730', market_hash_name).then(
    (priceOverview) => {
      // removes previous leftover elements
      document.querySelectorAll('.startingAtVolume').forEach((previousElement) => previousElement.remove());

      // adds new elements
      document.querySelectorAll('.item_owner_actions').forEach((marketActions) => {
        marketActions.style.display = 'block';
        const startingAt = priceOverview.lowest_price === undefined ? 'Unknown' : priceOverview.lowest_price;
        const volume = priceOverview.volume === undefined ? 'Unknown amount' : priceOverview.volume;

        marketActions.insertAdjacentHTML('afterbegin', `
                    <div class="startingAtVolume">
                        <div style="height: 24px;"><a href="https://steamcommunity.com/market/listings/730/${market_hash_name}">View in Community Market</a></div>
                        <div style="min-height: 3em; margin-left: 1em;">Starting at: ${startingAt}<br>Volume: ${volume} sold in the last 24 hours<br></div>
                    </div>
                `);
      });
    }, (error) => { console.log(error); },
  );
};

// works in inventory and profile pages
const isOwnInventory = () => {
  return getUserSteamID() === getInventoryOwnerID();
};

// ready made for possible future usage, unused atm
//
// const sellItem = (assetID, price) => {
//     const callSellItemOnPageScript = `sellItemOnPage(${price}, ${assetID})`;
//     injectScript(callSellItemOnPageScript, true, 'callSellItemOnPage', false);
// };

const addListingRow = (item) => {
  const row = `
        <tr data-assetids="${item.assetid}" data-sold-ids="" data-item-name="${item.market_hash_name}">
            <td class="itemName"><a href="https://steamcommunity.com/market/listings/730/${item.market_hash_name}" target="_blank">${item.market_hash_name}</a></td>
            <td class="itemAmount">1</td>
            <td class="itemExtensionPrice selected clickable" data-price-in-cents="${userPriceToProperPrice(item.price.price)}" data-listing-price="${getPriceAfterFees(userPriceToProperPrice(item.price.price))}">${item.price.display}</td>
            <td class="itemStartingAt clickable">Loading...</td>
            <td class="itemQuickSell clickable">Loading...</td>
            <td class="itemInstantSell clickable">Loading...</td>
            <td class="itemUserPrice"><input type="text" class="userPriceInput"></td>
        </tr>`;

  document.getElementById('listingTable').querySelector('tbody').insertAdjacentHTML('beforeend', row);
  const listingRow = getListingRow(item.market_hash_name);

  listingRow.querySelector('.itemUserPrice').querySelector('input[type=text]').addEventListener('change', (event) => {
    const priceInt = userPriceToProperPrice(event.target.value);
    event.target.parentElement.setAttribute('data-price-in-cents', priceInt);
    event.target.parentElement.setAttribute('data-listing-price', getPriceAfterFees(priceInt));
    event.target.value = centsToSteamFormattedPrice(priceInt);
    event.target.parentElement.classList.add('selected');
    event.target.parentElement.parentElement.querySelectorAll('.itemExtensionPrice,.itemStartingAt,.itemQuickSell,.itemInstantSell').forEach((priceType) => priceType.classList.remove('selected'));
    updateMassSaleTotal();
  });

  listingRow.querySelectorAll('.itemExtensionPrice,.itemStartingAt,.itemQuickSell,.itemInstantSell').forEach((priceType) => {
    priceType.addEventListener('click', (event) => {
      event.target.classList.add('selected');
      event.target.parentNode.querySelectorAll('td').forEach((column) => {
        if (column !== event.target) column.classList.remove('selected');
      });
      updateMassSaleTotal();
    });
  });
};

const getListingRow = (name) => {
  return document.getElementById('listingTable').querySelector(`tr[data-item-name="${name}"]`);
};

const addStartingAtAndQuickSellPrice = (success, market_hash_name, starting_at_price) => {
  const listingRow = getListingRow(market_hash_name);

  if (listingRow !== null) { // the user might have unselected the item while it as in the queue and now there is nowhere to add the price to
    const startingAtElement = listingRow.querySelector('.itemStartingAt');
    const quickSell = listingRow.querySelector('.itemQuickSell');

    if (starting_at_price !== undefined && !success) {
      const priceInCents = steamFormattedPriceToCents(starting_at_price);
      const quickSellPrice = steamFormattedPriceToCents(starting_at_price) - 1;

      startingAtElement.innerText = starting_at_price;
      startingAtElement.setAttribute('data-price-set', true.toString());
      startingAtElement.setAttribute('data-price-in-cents', priceInCents);
      startingAtElement.setAttribute('data-listing-price', getPriceAfterFees(priceInCents).toString());
      quickSell.setAttribute('data-price-in-cents', quickSellPrice.toString());
      quickSell.setAttribute('data-listing-price', getPriceAfterFees(quickSellPrice).toString());
      quickSell.innerText = centsToSteamFormattedPrice(quickSellPrice);

      // if the quicksell price is higher than the extension price then select that one as default instead
      const extensionPrice = parseInt(listingRow.querySelector('.itemExtensionPrice').getAttribute('data-price-in-cents'));
      if (extensionPrice < quickSellPrice) quickSell.click();
    } else startingAtElement.setAttribute('data-price-set', false.toString());
  }
};

const addToPriceQueueIfNeeded = (item) => {
  const listingRow = getListingRow(item.market_hash_name);
  const startingAtElement = listingRow.querySelector('.itemStartingAt');
  const instantElement = listingRow.querySelector('.itemInstantSell');

  if (startingAtElement.getAttribute('data-price-set') !== true && startingAtElement.getAttribute('data-price-in-progress') !== true) { // check if price is already set or in progress
    startingAtElement.setAttribute('data-price-in-progress', true.toString());

    priceQueue.jobs.push({
      type: 'inventory_mass_sell_starting_at',
      appID: '730',
      market_hash_name: item.market_hash_name,
      callBackFunction: addStartingAtAndQuickSellPrice,
    });
    workOnPriceQueue();
  }

  if (instantElement.getAttribute('data-price-set') !== true && instantElement.getAttribute('data-price-in-progress') !== true) { // check if price is already set or in progress
    instantElement.setAttribute('data-price-in-progress', true.toString());

    priceQueue.jobs.push({
      type: 'inventory_mass_sell_instant_sell',
      appID: '730',
      market_hash_name: item.market_hash_name,
      callBackFunction: addInstantSellPrice,
    });
    workOnPriceQueue();
  }
};

const removeUnselectedItemsFromTable = () => {
  document.getElementById('listingTable').querySelector('tbody').querySelectorAll('tr').forEach((listingRow) => {
    const assetIDs = listingRow.getAttribute('data-assetids').split(',');
    const remainingIDs = assetIDs.filter((assetID) => findElementByAssetID(assetID).classList.contains('selected'));

    if (remainingIDs.length === 0) listingRow.remove();
    else {
      listingRow.setAttribute('data-assetids', remainingIDs.toString());
      listingRow.querySelector('.itemAmount').innerText = remainingIDs.length;
    }
  });
};

const updateMassSaleTotal = () => {
  let total = 0;
  let totalAfterFees = 0;
  document.getElementById('listingTable').querySelector('tbody').querySelectorAll('tr').forEach((listingRow) => {
    total += parseInt(listingRow.querySelector('.selected').getAttribute('data-price-in-cents')) * parseInt(listingRow.querySelector('.itemAmount').innerText);
    totalAfterFees += parseInt(listingRow.querySelector('.selected').getAttribute('data-listing-price')) * parseInt(listingRow.querySelector('.itemAmount').innerText);
  });
  document.getElementById('saleTotal').innerText = centsToSteamFormattedPrice(total);
  document.getElementById('saleTotalAfterFees').innerText = centsToSteamFormattedPrice(totalAfterFees);
};

const addInstantSellPrice = (success, market_hash_name, highest_order) => {
  const listingRow = getListingRow(market_hash_name);

  if (listingRow !== null) { // the user might have unselected the item while it as in the queue and now there is nowhere to add the price to
    const instantElement = listingRow.querySelector('.itemInstantSell');

    if (highest_order !== undefined && !success) {
      instantElement.innerText = centsToSteamFormattedPrice(highest_order);
      instantElement.setAttribute('data-price-set', true.toString());
      instantElement.setAttribute('data-price-in-cents', highest_order);
      instantElement.setAttribute('data-listing-price', getPriceAfterFees(highest_order).toString());
    } else instantElement.setAttribute('data-price-set', false.toString());

    instantElement.setAttribute('data-price-in-progress', false.toString());
  }
};

const addFloatDataToPage = (job, floatQueue, floatInfo) => {
  addFloatIndicator(findElementByAssetID(job.assetID), floatInfo);

  // add float and pattern info to page variable
  const item = getItemByAssetID(items, job.assetID);
  item.floatInfo = floatInfo;
  item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintseed);

  if (job.type === 'inventory_floatbar') {
    if (getAssetIDofActive() === job.assetID) updateFloatAndPatternElements(item);
  } else {
    // check if there is a floatbar job for the same item and remove it
    floatQueue.jobs.find((floatJob, index) => {
      if (floatJob.type === 'inventory_floatbar' && job.assetID === floatJob.assetID) {
        updateFloatAndPatternElements(item);
        removeFromArray(floatQueue, index);
      }
      return null;
    });
  }
};

const dealWithNewFloatData = (job, floatInfo, floatQueue) => {
  if (floatInfo !== 'nofloat') addFloatDataToPage(job, floatQueue, floatInfo);
  else if (job.type === 'inventory_floatbar') hideFloatBars();
};

const floatBar = getFloatBarSkeleton('inventory');
const upperModule = `
<div class="upperModule">
    <div class="nametag"></div>
    <div class="descriptor customStickers"></div>
    <div class="duplicate">x1</div>
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

logExtensionPresence();

// mutation observer observes changes on the right side of the inventory interface, this is a workaround for waiting for ajax calls to finish when the page changes
const observer = new MutationObserver(() => {
  if (isCSGOInventoryActive('inventory')) {
    addElements();
    addFunctionBar();
  } else cleanUpElements(true);
});

const observer2 = new MutationObserver(() => {
  addPerItemInfo();
});

// does not execute if inventory is private or failed to load the page (502 for example, mostly when steam is dead)
if (document.getElementById('no_inventories') === null && document.getElementById('iteminfo0') !== null) {
  observer.observe(document.getElementById('iteminfo0'), {
    subtree: false,
    attributes: true,
  });

  observer2.observe(document.getElementById('inventories'), {
    subtree: false,
    attributes: true,
  });
}

injectStyle(`
    .slot_app_fraudwarning{
        top: 19px !important;
        left: 75px !important;
    }`, 'nametagWarning');
addSearchListener('inventory', addFloatIndicatorsToPage);
overridePopulateActions();
updateLoggedInUserID();
trackEvent({
  type: 'pageview',
  action: 'InventoryView',
});

// injects selling script if own inventory
if (isOwnInventory()) {
  const sellItemScriptString = `
        function sellItemOnPage(name, assetID, price) {
            let myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        
            fetch(
                'https://steamcommunity.com/market/sellitem/',
                {
                    "body":'sessionid=' + g_sessionID + '&appid=730&contextid=2&amount=1&assetid=' + assetID + '&price=' + price,
                    "headers": myHeaders,
                    "method":"POST"
                }
            ).then((response) => {
                if (!response.ok) {
                    console.log('error');
                }
                else return response.json();
            }).then((body) => {
                if (body.success) {
                    let soldFromRow = document.getElementById('listingTable').querySelector('tbody').querySelector('[data-item-name="' + name + '"]');
                    let assetIDs = soldFromRow.getAttribute('data-assetids').split(',');
                    let soldIDs = soldFromRow.getAttribute('data-sold-ids').split(',');
                    soldIDs = soldIDs[0] === '' ? [] : soldIDs;
            
                    soldIDs.push(assetID);
                    if (assetIDs.toString() === soldIDs.toString()) soldFromRow.classList.add('strikethrough');
                    let quantityElement = soldFromRow.querySelector('.itemAmount');
                    quantityElement.innerText = parseInt(quantityElement.innerText) - 1;
                    
                    // flashing the quantity as a visual feedback when it changes
                    quantityElement.classList.add('whiteBackground');
                    setTimeout(() => quantityElement.classList.remove('whiteBackground'), 200);
                    
                    soldFromRow.setAttribute('data-sold-ids', soldIDs.toString());
                    let itemElement = document.getElementById('730_2_' + assetID);
                    itemElement.classList.add('sold');
                    itemElement.classList.remove('selected');
            
                    sellNext();
                 }
                 else {
                    console.log(body);
                    let warningElement = document.getElementById('massSellError');
                    warningElement.innerText = body.message;
                    warningElement.classList.remove('hidden');
                 }
            }).catch(err => {
                console.log(err);
            });
        }
        
        function sellNext() {
            for (let listingRow of document.getElementById('listingTable').querySelector('tbody').querySelectorAll('tr')) {
                let assetIDs = listingRow.getAttribute('data-assetids').split(',');
                let soldIDs = listingRow.getAttribute('data-sold-ids').split(',');
        
                for (let assetID of assetIDs) {
                    if (!soldIDs.includes(assetID)) {
                        sellItemOnPage(listingRow.getAttribute('data-item-name'), assetID, listingRow.querySelector('.selected').getAttribute('data-listing-price'));
                        return;
                    }
                }
            }
            document.getElementById('sellButton').innerText = 'Start Mass Listing';
        }`;
  injectScript(sellItemScriptString, false, 'sellItemScript', false);
}

if (!isOwnInventory()) {
  // shows trade offer history summary
  chrome.storage.local.get(['tradeHistoryInventory', `offerHistory_${getInventoryOwnerID()}`, 'apiKeyValid'], (result) => {
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
          header.insertAdjacentHTML('beforeend', `
                        <div class="trade_partner_info_block"> 
                            <div title="${dateToISODisplay(offerHistory.last_received)}">Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? prettyTimeAgo(offerHistory.last_received) : '-'}</div>
                            <div title="${dateToISODisplay(offerHistory.last_sent)}">Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? prettyTimeAgo(offerHistory.last_sent) : '-'}</div>
                        </div>`);
        } else {
          header.insertAdjacentHTML('beforeend', `
                        <div class="trade_partner_info_block" style="color: lightgray"> 
                            <div><b>CSGOTrader Extension:</b> It looks like you don't have your Steam API Key set yet.</div>
                            <div>If you had that you would see partner offer history here. Check the <a href="https://csgotrader.app/release-notes#1.23">Release Notes</a> for more info.</div>
                        </div>`);
        }
      }
    }
  });
}

chrome.storage.local.get('hideOtherExtensionPrices', (result) => {
  if (result.hideOtherExtensionPrices) hideOtherExtensionPrices();
});

let items = [];
requestInventory();

// to refresh the trade lock remaining indicators
setInterval(() => {
  if (!document.hidden) updateTradabilityIndicators();
}, 60000);

// variables for the countdown recursive logic
let countingDown = false;
let countDownID = '';

const listenSelectClicks = (event) => {
  if (event.target.parentElement.classList.contains('item') && event.target.parentElement.classList.contains('app730') && event.target.parentElement.classList.contains('context2')) {
    if (event.ctrlKey) {
      const marketHashNameToLookFor = getItemByAssetID(items, getAssetIDOfElement(event.target.parentNode)).market_hash_name;
      document.querySelectorAll('.item.app730.context2').forEach((item) => {
        if (getItemByAssetID(items, getAssetIDOfElement(item)).market_hash_name === marketHashNameToLookFor) {
          item.classList.toggle('selected');
        }
      });
    } else event.target.parentElement.classList.toggle('selected');
    updateSelectedItemsSummary();
  }
};

reloadPageOnExtensionReload();
