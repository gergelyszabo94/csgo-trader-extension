import {
  getExteriorFromTags, getQuality, getDopplerInfo,
  getType, addDopplerPhase, makeItemColorful, addUpdatedRibbon,
  addSSTandExtIndicators, addPriceIndicator, addFloatIndicator,
  getItemByAssetID, getInspectLink, removeOfferFromActiveOffers,
  logExtensionPresence, updateLoggedInUserInfo, reloadPageOnExtensionReload,
  getNameTag, repositionNameTagIcons, jumpToAnchor,
} from 'utils/utilsModular';
import { prettyTimeAgo } from 'utils/dateTime';
import { genericMarketLink } from 'utils/static/simpleStrings';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import itemTypes from 'utils/static/itemTypes';
import { prettyPrintPrice } from 'utils/pricing';
import { overrideDecline, overrideShowTradeOffer } from 'utils/steamOverriding';
import { trackEvent } from 'utils/analytics';
import { offersSortingModes } from 'utils/static/sortingModes';
import { injectScript, injectStyle } from 'utils/injection';
import { getProperStyleSteamIDFromOfferStyle, getUserSteamID } from 'utils/steamID';
import { inOtherOfferIndicator } from 'utils/static/miscElements';
import addPricesAndFloatsToInventory from 'utils/addPricesAndFloats';
import DOMPurify from 'dompurify';

const userID = getUserSteamID();
let activePage = 'incoming_offers';
if (window.location.href.includes('/tradeoffers/?history=1')) activePage = 'incoming_offers_history';
else if (window.location.href.includes('/tradeoffers/sent/?history=1')) activePage = 'sent_offers_history';
else if (window.location.href.includes('/tradeoffers/sent')) activePage = 'sent_offers';

const isOfferActive = (offerElement) => {
  if (offerElement === null) return null;
  const offerItemsElement = offerElement.querySelector('.tradeoffer_items_ctn');
  if (offerItemsElement !== null) return !offerItemsElement.classList.contains('inactive');
  return false;
};

const getOfferIDFromElement = (element) => {
  return element.id.split('tradeofferid_')[1];
};

const selectItemElementByIDs = (classid, instanceid) => {
  return document.querySelector(`[data-economy-item="classinfo/730/${classid}/${instanceid}"`);
};

const addFloatDataToPage = (job, floatInfo) => {
  addFloatIndicator(selectItemElementByIDs(job.classid, job.instanceid), floatInfo);
};

const matchItemsWithDescriptions = (items) => {
  const itemsToReturn = [];
  items.forEach((item) => {
    // some items don't have descriptions for some reason - will have to be investigated later
    if (item.market_hash_name !== undefined) {
      itemsToReturn.push({
        name: item.name,
        market_hash_name: item.market_hash_name,
        name_color: item.name_color,
        marketlink: genericMarketLink + item.market_hash_name,
        classid: item.classid,
        instanceid: item.instanceid,
        assetid: item.assetid,
        position: item.position,
        side: item.side,
        dopplerInfo: (item.name.includes('Doppler') || item.name.includes('doppler')) ? getDopplerInfo(item.icon_url) : null,
        exterior: getExteriorFromTags(item.tags),
        iconURL: item.icon_url,
        inspectLink: getInspectLink(item),
        quality: getQuality(item.tags),
        isStatrack: item.name.includes('StatTrak™'),
        isSouvenir: item.name.includes('Souvenir'),
        starInName: item.name.includes('★'),
        nametag: getNameTag(item),
        owner: item.owner,
        type: getType(item.tags),
        floatInfo: null,
        patternInfo: null,
        descriptions: item.descriptions,
        inOffer: item.inOffer,
        offerOrigin: item.offerOrigin,
      });
    }
  });

  return itemsToReturn;
};

const isCSGOItemElement = (element) => {
  return element.getAttribute('data-economy-item').includes('classinfo/730/');
};

const getIDsFromElement = (element) => {
  const splitString = element.getAttribute('data-economy-item').split('/');
  return {
    classid: splitString[2] === undefined ? null : splitString[2],
    instanceid: splitString[3] === undefined ? null : splitString[3],
  };
};

const addInOtherOffersInfoBlock = (item, otherOfferItems, offerElement) => {
  const offerFooter = offerElement.querySelector('.tradeoffer_footer');

  const inOtherOffer = offerFooter.querySelector('.in_other_offer');
  if (inOtherOffer !== null) inOtherOffer.remove(); // removing it if it was added already

  const otherOffers = otherOfferItems.map((otherOfferItem, index) => {
    let offerLink = '';
    if (activePage === 'incoming_offers') {
      offerLink = otherOfferItem.offerOrigin === 'sent'
        ? `https://steamcommunity.com/profiles/${otherOfferItem.owner}/tradeoffers/sent#tradeofferid_${otherOfferItem.inOffer}`
        : `#tradeofferid_${otherOfferItem.inOffer}`;
    } else if (activePage === 'sent_offers') {
      offerLink = otherOfferItem.offerOrigin === 'sent'
        ? `#tradeofferid_${otherOfferItem.inOffer}`
        : `https://steamcommunity.com/tradeoffer/${otherOfferItem.inOffer}/`;
    }

    const afterLinkChars = index === otherOfferItems.length - 1
      ? '' // if it's the last one
      : index !== 0 && index % 4 === 0
        ? ', \n' // if it's the 4th, 8th, etc. add a new line since only 4 fits on a line
        : ', '; // normal case

    return `<a href="${offerLink}" ${otherOfferItem.offerOrigin === 'sent' ? 'target="_blank"' : ''}>
            ${otherOfferItem.inOffer}${afterLinkChars}
           </a>`;
  });

  const listString = `<div>${otherOffers.join('')}</div>`;

  offerFooter.insertAdjacentHTML(
    'afterbegin',
    DOMPurify.sanitize(
      `<div class="trade_partner_info_block in_other_offer" style="color: lightgray"> 
            ${item.name} is also in:
            ${listString}
          </div>`,
      { ADD_ATTR: ['target'] },
    ),
  );
};

const addInOtherTradeIndicator = (itemElement, item, activeOfferItems) => {
  const offerElement = itemElement.parentElement.parentElement.parentElement.parentElement;
  const offerID = getOfferIDFromElement(offerElement);

  const inOtherOffers = activeOfferItems.filter((offerItem) => {
    return offerItem.assetid === item.assetid && offerItem.inOffer !== offerID;
  });

  if (inOtherOffers.length !== 0) {
    itemElement.insertAdjacentHTML('beforeend', inOtherOfferIndicator);
    itemElement.querySelector('.inOtherOffer').addEventListener('click', () => {
      addInOtherOffersInfoBlock(item, inOtherOffers, offerElement);
    });
  }
};

// class and instance IDs are the only IDs that can be extracted from the page
// they are not enough to match every item exactly all the time
// side of the offer and position must be used to to uniquely match items
const findItem = (items, IDs, side, position) => {
  if (IDs.instanceid !== null) {
    return items.filter((item) => {
      return item.classid === IDs.classid && item.instanceid === IDs.instanceid
        && item.position === position && item.side === side;
    })[0];
  }
  return items.filter((item) => item.classid === IDs.classid)[0];
};

const extractItemsFromOffers = (offers, sentOrReceived) => {
  const itemsToReturn = [];
  if (offers) {
    offers.forEach((offer) => {
      if (offer.items_to_give !== undefined) {
        offer.items_to_give.forEach((item, index) => {
          itemsToReturn.push({
            ...item,
            owner: userID,
            position: index,
            inOffer: offer.tradeofferid,
            side: 'your',
            offerOrigin: sentOrReceived,
          });
        });
      }
      if (offer.items_to_receive !== undefined) {
        offer.items_to_receive.forEach((item, index) => {
          itemsToReturn.push({
            ...item,
            owner: getProperStyleSteamIDFromOfferStyle(offer.accountid_other),
            position: index,
            inOffer: offer.tradeofferid,
            side: 'their',
            offerOrigin: sentOrReceived,
          });
        });
      }
    });
  }

  return itemsToReturn;
};

const addItemInfo = (items) => {
  let activeItemElements = [];
  document.querySelectorAll('.tradeoffer').forEach((offerElement) => {
    if (isOfferActive(offerElement)) {
      const primary = offerElement.querySelector('.tradeoffer_items.primary');
      const secondary = offerElement.querySelector('.tradeoffer_items.secondary');
      const theirSide = activePage === 'incoming_offers' ? primary : secondary;
      const yourSide = activePage === 'incoming_offers' ? secondary : primary;

      const yourSideItems = [...yourSide.querySelectorAll('.trade_item')].map((itemElement, index) => {
        return { itemElement, side: 'your', position: index };
      });

      const theirSideItems = [...theirSide.querySelectorAll('.trade_item')].map((itemElement, index) => {
        return { itemElement, side: 'their', position: index };
      });

      const activeItemElementsInOffer = yourSideItems.concat(theirSideItems);
      activeItemElements = activeItemElements.concat(activeItemElementsInOffer);
    }
  });

  chrome.storage.local.get(['colorfulItems', 'autoFloatOffer', 'showStickerPrice', 'activeOffers', 'itemInOtherOffers'],
    ({
      colorfulItems, showStickerPrice, autoFloatOffer, activeOffers, itemInOtherOffers,
    }) => {
      activeItemElements.forEach(({ itemElement, side, position }) => {
        if ((itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false') && isCSGOItemElement(itemElement)) {
          const item = findItem(items, getIDsFromElement(itemElement), side, position);

          if (item !== undefined) {
            addDopplerPhase(itemElement, item.dopplerInfo);
            makeItemColorful(itemElement, item, colorfulItems);
            addSSTandExtIndicators(itemElement, item, showStickerPrice);
            addPriceIndicator(itemElement, item.price);
            if (itemInOtherOffers) addInOtherTradeIndicator(itemElement, item, activeOffers.items);

            if (autoFloatOffer && item.inspectLink !== null) {
              if (item.floatInfo === null && itemTypes[item.type.key].float) {
                floatQueue.jobs.push({
                  type: 'offersPage',
                  assetID: item.assetid,
                  classid: item.classid,
                  instanceid: item.instanceid,
                  inspectLink: item.inspectLink,
                  callBackFunction: addFloatDataToPage,
                });
                if (!floatQueue.active) workOnFloatQueue();
              } else addFloatIndicator(itemElement, item.floatInfo);
            }
          }

          // marks the item "processed" to avoid additional unnecessary work later
          itemElement.setAttribute('data-processed', 'true');
        }
      });
    });
};

// sends a message to the "back end" to request offers (history or active only with descriptions)
const getOffersFromAPI = (type) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ getTradeOffers: type }, (response) => {
      if (response.apiKeyValid === false) reject('apiKeyInvalid');
      else if (!(response.offers === undefined || response === 'error')) resolve(response.offers);
      else reject('steamError');
    });
  });
};

const addTotals = (offers, items) => {
  chrome.storage.local.get('currency', (result) => {
    let totalProfit = 0.0;
    let activeOfferCount = 0;
    let numberOfProfitableOffers = 0;

    offers.forEach((offer) => {
      let yourItemsTotal = 0.0;
      let theirItemsTotal = 0.0;
      let yourIncludesItemWIthNoPrice = false;
      let theirIncludesItemWIthNoPrice = false;

      if (offer.items_to_give !== undefined) {
        offer.items_to_give.forEach((item) => {
          if (item.appid === 730) {
            const itemWithAllInfo = getItemByAssetID(items, item.assetid);
            if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) {
              yourItemsTotal += parseFloat(itemWithAllInfo.price.price);
            } else yourIncludesItemWIthNoPrice = true;
          }
        });
      }
      if (offer.items_to_receive !== undefined) {
        offer.items_to_receive.forEach((item) => {
          if (item.appid === 730) {
            const itemWithAllInfo = getItemByAssetID(items, item.assetid);
            if (itemWithAllInfo !== undefined && itemWithAllInfo.price !== undefined) {
              theirItemsTotal += parseFloat(itemWithAllInfo.price.price);
            } else theirIncludesItemWIthNoPrice = true;
          }
        });
      }

      const offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);
      if (isOfferActive(offerElement)) {
        activeOfferCount += 1;
        const primaryHeader = offerElement.querySelector('.tradeoffer_items.primary').querySelector('.tradeoffer_items_header');
        const secondaryHeader = offerElement.querySelector('.tradeoffer_items.secondary').querySelector('.tradeoffer_items_header');
        const theirHeader = activePage === 'incoming_offers' ? primaryHeader : secondaryHeader;
        const yourHeader = activePage === 'incoming_offers' ? secondaryHeader : primaryHeader;

        theirHeader.innerText += ` ${prettyPrintPrice(result.currency, (theirItemsTotal).toFixed(2))}`;
        theirHeader.innerText = theirIncludesItemWIthNoPrice ? theirHeader.innerText += ' - includes items with no price' : theirHeader.innerText;
        yourHeader.innerText += ` ${prettyPrintPrice(result.currency, (yourItemsTotal).toFixed(2))}`;
        yourHeader.innerText = yourIncludesItemWIthNoPrice ? yourHeader.innerText += ' - includes items with no price' : yourHeader.innerText;

        const profitOrLoss = theirItemsTotal - yourItemsTotal;
        const PLPercentage = theirItemsTotal / yourItemsTotal;
        if (profitOrLoss > 0.0) {
          totalProfit += profitOrLoss;
          numberOfProfitableOffers += 1;
        }
        offerElement.querySelector('.tradeoffer_header').insertAdjacentHTML(
          'beforeend',
          DOMPurify.sanitize(
            `<span class="profitOrLoss" data-profit-or-loss="${profitOrLoss}" data-p-l-percentage="${PLPercentage}" data-updated="${offer.time_updated}">
                    ${prettyPrintPrice(result.currency, (profitOrLoss).toFixed(2))}
                </span>`,
          ),
        );
      }
    });

    document.getElementById('tradeoffers_summary').innerHTML = DOMPurify.sanitize(`
            <div id="active_offers_count"><b>Active Offers: </b>${activeOfferCount}</div>
            <div id="profitable_offers_count"><b>Profitable Offers: </b>${numberOfProfitableOffers}</div>
            <div id="potential_profit"><b>Potential profit: </b>${prettyPrintPrice(result.currency, (totalProfit).toFixed(2))}</div>`);
  });
};

const sortOffers = (sortingMode) => {
  const activeOffers = [...document.querySelectorAll('.tradeoffer')].filter((offerElement) => isOfferActive(offerElement));
  let sortedOffers = [];

  if (sortingMode === 'profit_amount') {
    sortedOffers = activeOffers.sort((a, b) => {
      const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      return profitOnB - profitOnA;
    });
  } else if (sortingMode === 'loss_amount') {
    sortedOffers = activeOffers.sort((a, b) => {
      const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      return profitOnA - profitOnB;
    });
  } else if (sortingMode === 'profit_percentage') {
    sortedOffers = activeOffers.sort((a, b) => {
      const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      return pLB - pLA;
    });
  } else if (sortingMode === 'loss_percentage') {
    sortedOffers = activeOffers.sort((a, b) => {
      const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      return pLA - pLB;
    });
  } else if (sortingMode === 'default') {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
      const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
      return updatedB - updatedA;
    });
  } else if (sortingMode === 'reverse') {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
      const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
      return updatedA - updatedB;
    });
  }

  sortedOffers.reverse();

  // removes offer elements
  activeOffers.forEach((offer) => {
    offer.remove();
  });
  document.querySelector('.profile_leftcol').querySelectorAll('.tradeoffer_rule').forEach((rulerElement) => {
    rulerElement.remove();
  });

  // adds sorted offer elements to page
  const offerSection = document.querySelector('.profile_leftcol');
  sortedOffers.forEach((offer) => {
    const currentTopOffer = offerSection.querySelector('.tradeoffer');
    if (currentTopOffer !== null) currentTopOffer.insertAdjacentElement('beforebegin', offer);
    else offerSection.insertAdjacentElement('beforeend', offer);
  });
};

const addPartnerOfferSummary = (offers, nthRun) => {
  if (nthRun < 2) {
    chrome.storage.local.get('tradeHistoryOffers', (firstResult) => {
      if (firstResult.tradeHistoryOffers) {
        offers.forEach((offer) => {
          const partnerID = getProperStyleSteamIDFromOfferStyle(offer.accountid_other);
          const storageKey = `offerHistory_${partnerID}`;
          chrome.storage.local.get(storageKey, (secondResult) => {
            const offerHistorySummary = secondResult[storageKey];
            if (offerHistorySummary !== undefined) {
              const offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);

              // removes elements from previous runs
              offerElement.querySelectorAll('.offerHistory').forEach((offerHistoryElement) => {
                offerHistoryElement.remove();
              });

              if (isOfferActive(offerElement)) {
                const receivedElement = offerHistorySummary.offers_received === 0
                  ? '<span  class="offerHistory">Received: 0</span>'
                  : `<span class="offerHistory">Received: ${offerHistorySummary.offers_received} Last: ${prettyTimeAgo(offerHistorySummary.last_received)}</span>`;
                offerElement.querySelector('.tradeoffer_items.primary').insertAdjacentHTML('beforeend', DOMPurify.sanitize(receivedElement));

                let sentElement = `<span  class="offerHistory">Sent: ${offerHistorySummary.offers_sent} Last: ${prettyTimeAgo(offerHistorySummary.last_sent)}</span>`;
                if (offerHistorySummary.offers_sent === 0) sentElement = '<span  class="offerHistory">Sent: 0</span>';
                offerElement.querySelector('.tradeoffer_items.secondary').insertAdjacentHTML('beforeend', DOMPurify.sanitize(sentElement));
              }
            }
          });
        });
      }
    });
    if (nthRun === 0) setTimeout(() => { addPartnerOfferSummary(offers, 1); }, 15000);
  }
};

const updateOfferHistoryData = () => {
  getOffersFromAPI('historical').then(
    (offers) => {
      chrome.storage.local.get('tradeHistoryLastUpdate', (firstResult) => {
        const allOffers = offers.trade_offers_received.concat(offers.trade_offers_sent);
        const offerHistoryToAdd = {};

        allOffers.forEach((offer) => {
          if (offer.time_updated > firstResult.tradeHistoryLastUpdate) {
            const partnerID = getProperStyleSteamIDFromOfferStyle(offer.accountid_other);
            const offerSummary = {
              timestamp: offer.time_updated,
              partner: partnerID,
              ours: offer.is_our_offer,
            };
            if (offerHistoryToAdd[partnerID] !== undefined) {
              offerHistoryToAdd[partnerID].push(offerSummary);
            } else offerHistoryToAdd[partnerID] = [offerSummary];
          }
        });

        for (const [steamID, offersToAdd] of Object.entries(offerHistoryToAdd)) {
          const storageKey = `offerHistory_${steamID}`;

          let received = 0;
          let lastReceived = 0;
          let sent = 0;
          let lastSent = 0;

          offersToAdd.forEach((offer) => {
            if (offer.ours) {
              sent += 1;
              lastSent = offer.timestamp > lastSent ? offer.timestamp : lastSent;
            } else {
              received += 1;
              lastReceived = offer.timestamp > lastReceived ? offer.timestamp : lastReceived;
            }
          });

          chrome.storage.local.get(storageKey, (secondResult) => {
            const offerSummaryFromStorage = secondResult[storageKey];

            if (offerSummaryFromStorage === undefined) {
              chrome.storage.local.set({
                [storageKey]: {
                  offers_received: received,
                  offers_sent: sent,
                  last_received: lastReceived,
                  last_sent: lastSent,
                },
              }, () => {});
            } else {
              chrome.storage.local.set({
                [storageKey]: {
                  offers_received: offerSummaryFromStorage.offers_received + received,
                  offers_sent: offerSummaryFromStorage.offers_sent + sent,
                  last_received: lastReceived > offerSummaryFromStorage.last_received
                    ? lastReceived
                    : offerSummaryFromStorage.last_received,
                  last_sent: lastSent > offerSummaryFromStorage.last_sent
                    ? lastSent
                    : offerSummaryFromStorage.last_sent,
                },
              }, () => {});
            }
          });
        }
        chrome.storage.local.set(
          { tradeHistoryLastUpdate: Math.floor(Date.now() / 1000) }, () => {},
        );
      });
    }, (error) => {
      if (error === 'apiKeyInvalid') {
        console.log('API key invalid');
      }
    },
  );
};

// info about the active offers is kept in storage
// so we can check if an item is present in another offer
const updateActiveOffers = (offers, items) => {
  chrome.storage.local.set({
    activeOffers: {
      lastFullUpdate: Math.floor(Date.now() / 1000),
      items,
      sent: offers.trade_offers_sent,
      received: offers.trade_offers_received,
      descriptions: offers.descriptions,
    },
  }, () => {});
};

logExtensionPresence();
repositionNameTagIcons();
overrideDecline();
overrideShowTradeOffer();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'TradeOffersPageView',
});

// chrome background tab throttling causes steam's own js files to load later
// than the these injections, so it does not override the functions
// this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
// this is a dirty but working fix for that
let thisManyTimes = 15;
const intervalID = setInterval(() => {
  if (thisManyTimes > 0) {
    overrideShowTradeOffer();
    overrideDecline();
  } else clearInterval(intervalID);
  thisManyTimes -= 1;
}, 1000);

// makes our items the same size (larger) as their items
if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
  chrome.storage.local.get('tradeOffersLargerItems', (result) => {
    if (result.tradeOffersLargerItems) {
      injectStyle(`.tradeoffer_items.secondary .trade_item{
                     width: 96px;
                     height: 96px;
                     margin-right: 8px;
                     margin-bottom: 8px;`, 'itemsSameSize');

      // adjust the icon sizes accordingly
      document.querySelectorAll('.tradeoffer_items.secondary').forEach((secondaryElement) => {
        secondaryElement.querySelectorAll('.trade_item').forEach((itemElement) => {
          const iconElement = itemElement.querySelector('img');
          iconElement.src = iconElement.src.replace('73fx73f', '96fx96f');
          iconElement.setAttribute('srcset', iconElement.getAttribute('srcset').replace('73fx73f', '96fx96f'));
        });
      });
    }
  });
}

// makes clicking on profile avatars open profiles on a new tab
document.querySelectorAll('.playerAvatar').forEach((avatarDiv) => {
  const link = avatarDiv.querySelector('a');
  if (link !== null) link.setAttribute('target', '_blank');
});

// makes the middle of the active trade offers a bit bigger
// making it the same size as a declined offer so it does not jerk the page when declining
if (activePage === 'incoming_offers') {
  document.querySelectorAll('.tradeoffer_items_rule').forEach((rule) => {
    rule.style.height = '46px';
  });
}

// adds "accept trade" action to offers
if (activePage === 'incoming_offers') {
  document.querySelectorAll('.tradeoffer').forEach((offerElement) => {
    if (isOfferActive(offerElement)) {
      const offerID = getOfferIDFromElement(offerElement);
      const partnerID = getProperStyleSteamIDFromOfferStyle(offerElement.querySelector('.playerAvatar').getAttribute('data-miniprofile'));
      offerElement.querySelector('.tradeoffer_footer_actions').insertAdjacentHTML(
        'afterbegin',
        `<a href="javascript:AcceptTradeOffer( '${DOMPurify.sanitize(offerID)}', '${DOMPurify.sanitize(partnerID)}' );" class="whiteLink">Accept Trade</a> | `,
      );
    }
  });
}

// injects accept trade functionality to page
const acceptTradeScriptString = `
                function AcceptTradeOffer(offerID, partnerID){
                    let myHeaders = new Headers();
                    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
                    
                    fetch(
                        'https://steamcommunity.com/tradeoffer/' + offerID + '/accept',
                        {"referrer":'https://steamcommunity.com/tradeoffer/' + offerID + '/',
                            "body":'sessionid=' + g_sessionID + '&serverid=1&tradeofferid=' + offerID + '&partner=' + partnerID + '&captcha=',
                            "headers": myHeaders,
                            "method":"POST"}
                    ).then((response) => {
                        if (!response.ok) {
                            console.log('error');
                        }
                        else return response.json();
                    }).then((body) => {
                        let offerElement = document.getElementById('tradeofferid_' + offerID);
                        let offerContent = offerElement.querySelector('.tradeoffer_items_ctn');
                        offerContent.classList.remove('active');
                        offerContent.classList.add('inactive');
                        let middleElement = offerContent.querySelector('.tradeoffer_items_rule');
                        middleElement.classList.remove('tradeoffer_items_rule');
                        middleElement.classList.add('tradeoffer_items_banner');
                        middleElement.style.height = '';
                        offerElement.querySelector('.tradeoffer_footer').style.display = 'none';
                
                        if (body.needs_email_confirmation || body.needs_mobile_confirmation)  middleElement.innerText = 'Accepted - Awaiting Confirmation';
                        else  {
                            middleElement.innerText = 'Trade Accepted';
                            middleElement.classList.add('accepted');
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                }`;
if (activePage === 'incoming_offers') injectScript(acceptTradeScriptString, false, 'acceptTradeScript', false);


if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
  chrome.storage.local.get('itemInOtherOffers', ({ itemInOtherOffers }) => {
    if (itemInOtherOffers) {
      // adds listeners to cancel/decline buttons
      // and removes the offer from active offers when clicked
      const buttons = [];
      document.querySelectorAll('.tradeoffer_footer_actions').forEach((offerActionsElement) => {
        const actions = offerActionsElement.querySelectorAll('a');
        buttons.push(actions[actions.length - 1]); // they are always the last
      });

      buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
          removeOfferFromActiveOffers(getOfferIDFromElement(
            event.target.parentElement.parentElement.parentElement,
          ));
        });
      });
    }
  });


  const tradeOffersList = document.querySelector('.profile_leftcol');
  if (tradeOffersList !== null && document.querySelector('.profile_fatalerror') === null) {
    updateOfferHistoryData();

    tradeOffersList.insertAdjacentHTML(
      'afterbegin',
      DOMPurify.sanitize(
        `<div id="tradeoffers_summary" class="trade_offers_module">Waiting for Steam API...</div>
            <div id="tradeOffersSortingMenu" class="trade_offers_module hidden">
                <span>Sorting: </span>
                <select id="offerSortingMethod"/>
            </div>`,
      ),
    );

    // populates and adds listener to sorting select
    const sortingSelect = document.getElementById('offerSortingMethod');

    for (const mode of Object.values(offersSortingModes)) {
      const option = document.createElement('option');
      option.value = mode.key;
      option.text = mode.name;
      sortingSelect.add(option);
    }

    sortingSelect.addEventListener('change', () => {
      // analytics
      trackEvent({
        type: 'event',
        action: 'TradeOffersPageSorting',
      });

      sortOffers(sortingSelect.options[sortingSelect.selectedIndex].value);
    });

    getOffersFromAPI('active').then(
      (offers) => {
        let allItemsInOffer = extractItemsFromOffers(offers.trade_offers_sent, 'sent');
        allItemsInOffer = allItemsInOffer.concat(
          extractItemsFromOffers(offers.trade_offers_received, 'received'),
        );

        const itemsWithMoreInfo = [];
        if (allItemsInOffer) {
          allItemsInOffer.forEach((item) => {
            const itemDescription = offers.descriptions.find((description) => {
              return description.classid === item.classid
                && description.instanceid === item.instanceid;
            });
            itemsWithMoreInfo.push({ ...item, ...itemDescription });
          });
        }

        const matchedItems = matchItemsWithDescriptions(itemsWithMoreInfo);

        addPricesAndFloatsToInventory(matchedItems).then(({ items }) => {
          const itemsWithAllInfo = items;
          updateActiveOffers(offers, itemsWithAllInfo);
          addItemInfo(itemsWithAllInfo);

          if (activePage === 'incoming_offers') {
            addTotals(offers.trade_offers_received, itemsWithAllInfo);
            addPartnerOfferSummary(offers.trade_offers_received, 0);
          } else if (activePage === 'sent_offers') {
            addTotals(offers.trade_offers_sent, itemsWithAllInfo);
            addPartnerOfferSummary(offers.trade_offers_sent, 0);
          }

          document.getElementById('tradeoffers_summary').innerHTML = DOMPurify.sanitize('<b>Trade offer summary:</b>');

          chrome.storage.local.get('tradeOffersSortingMode', ({ tradeOffersSortingMode }) => {
            document.querySelector(`#offerSortingMethod [value="${tradeOffersSortingMode}"]`).selected = true;
            sortOffers(tradeOffersSortingMode);
            if (activePage === 'sent_offers') jumpToAnchor(window.location.hash);
            document.getElementById('tradeOffersSortingMenu').classList.remove('hidden');
          });
        });
      }, (error) => {
        if (error === 'apiKeyInvalid') {
          document.getElementById('tradeoffers_summary').innerHTML = DOMPurify.sanitize(
            `<b>CSGOTrader Extension:</b> You don't have your Steam API key set.<br> 
                     For more functionality on this page you must set your API key.
                     You can do so by <a href="https://steamcommunity.com/dev/apikey" target="_blank">clicking here</a>.
                     Check what you are missing in the <a href="https://csgotrader.app/release-notes#1.20" target="_blank">Release Notes</a>`,
            { ADD_ATTR: ['target'] },
          );
        }
      },
    );
  }
}

reloadPageOnExtensionReload();
