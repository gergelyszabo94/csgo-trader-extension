import {
  addDopplerPhase, makeItemColorful, addUpdatedRibbon,
  addSSTandExtIndicators, addPriceIndicator, addFloatIndicator,
  removeOfferFromActiveOffers, removeLinkFilterFromLinks,
  logExtensionPresence, updateLoggedInUserInfo, reloadPageOnExtensionReload,
  repositionNameTagIcons, jumpToAnchor, changePageTitle, isChromium,
  updateLoggedInUserName,
} from 'utils/utilsModular';
import { prettyTimeAgo } from 'utils/dateTime';
import floatQueue, { workOnFloatQueue } from 'utils/floatQueueing';
import itemTypes from 'utils/static/itemTypes';
import {
  addRealTimePriceToPage, prettyPrintPrice, priceQueue, workOnPriceQueue,
} from 'utils/pricing';
import { overrideShowTradeOffer } from 'utils/steamOverriding';
import { offersSortingModes } from 'utils/static/sortingModes';
import { injectStyle } from 'utils/injection';
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { inOtherOfferIndicator } from 'utils/static/miscElements';
import { acceptOffer, declineOffer } from 'utils/tradeOffers';
import DOMPurify from 'dompurify';
import steamApps from 'utils/static/steamApps';
import { getIDsFromElement } from 'utils/itemsToElementsToItems';

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

const getLimitedIDsFromElement = (element) => {
  const splitString = element.getAttribute('data-economy-item').split('/');
  return {
    appid: splitString[1] === undefined ? null : splitString[1],
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

// app, class and instance IDs are the only IDs that can be extracted from the page
// they are not enough to match every item exactly all the time
// side of the offer and position must be used to to uniquely match items
const findItem = (items, IDs, side, position) => {
  if (IDs.instanceid !== null) {
    return items.filter((item) => {
      return item.appid === IDs.appid && item.classid === IDs.classid
        && item.instanceid === IDs.instanceid
        && item.position === position && item.side === side;
    })[0];
  }
  return items.filter((item) => item.classid === IDs.classid)[0];
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

  chrome.storage.local.get(['colorfulItems', 'autoFloatOffer', 'showStickerPrice', 'activeOffers', 'itemInOtherOffers', 'showShortExteriorsOffers'],
    ({
      colorfulItems, showStickerPrice, autoFloatOffer,
      activeOffers, itemInOtherOffers, showShortExteriorsOffers,
    }) => {
      activeItemElements.forEach(({ itemElement, side, position }) => {
        if ((itemElement.getAttribute('data-processed') === null || itemElement.getAttribute('data-processed') === 'false')) {
          const item = findItem(items, getLimitedIDsFromElement(itemElement), side, position);
          if (item) {
            if (item.appid === steamApps.CSGO.appID) {
              addDopplerPhase(itemElement, item.dopplerInfo);
              makeItemColorful(itemElement, item, colorfulItems);
              addSSTandExtIndicators(itemElement, item, showStickerPrice, showShortExteriorsOffers);
              addPriceIndicator(itemElement, item.price);
              if (itemInOtherOffers) {
                addInOtherTradeIndicator(itemElement, item, activeOffers.items);
              }

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
            // it gives the element an id and adds the name
            // so the real time prices can be loaded
            itemElement.id = `item${item.appid}_${item.contextid}_${item.assetid}`;
            itemElement.setAttribute('data-market-hash-name', item.market_hash_name);
            itemElement.setAttribute('data-marketable', item.marketable);
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
      else if (!(response.offers === undefined || response === 'error')) {
        resolve({ offers: response.offers, itemsWithAllInfo: response.items });
      } else reject('steamError');
    });
  });
};

const addTotals = (offers) => {
  chrome.storage.local.get('currency', ({ currency }) => {
    let activeOfferCount = 0;
    let totalProfit = 0.0;
    let numberOfProfitableOffers = 0;

    offers.forEach((offer) => {
      const offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);
      if (isOfferActive(offerElement)) {
        activeOfferCount += 1;
        const primaryHeader = offerElement.querySelector('.tradeoffer_items.primary').querySelector('.tradeoffer_items_header');
        const secondaryHeader = offerElement.querySelector('.tradeoffer_items.secondary').querySelector('.tradeoffer_items_header');
        const theirHeader = activePage === 'incoming_offers' ? primaryHeader : secondaryHeader;
        const yourHeader = activePage === 'incoming_offers' ? secondaryHeader : primaryHeader;

        theirHeader.innerText += ` ${prettyPrintPrice(currency, (offer.theirItemsTotal).toFixed(2))}`;
        theirHeader.innerText = offer.theirIncludesItemWIthNoPrice ? theirHeader.innerText += ' - includes items with no price' : theirHeader.innerText;
        yourHeader.innerText += ` ${prettyPrintPrice(currency, (offer.yourItemsTotal).toFixed(2))}`;
        yourHeader.innerText = offer.yourIncludesItemWIthNoPrice ? yourHeader.innerText += ' - includes items with no price' : yourHeader.innerText;

        let pLClass = 'loss';
        if (offer.profitOrLoss > 0.0) {
          totalProfit += offer.profitOrLoss;
          numberOfProfitableOffers += 1;
          pLClass = 'profit';
        }
        offerElement.querySelector('.tradeoffer_items_ctn').insertAdjacentHTML(
          'afterbegin',
          DOMPurify.sanitize(
            `<span
                    class="profitOrLoss ${pLClass}"
                    data-profit-or-loss="${offer.profitOrLoss}"
                    data-receiving-total="${offer.theirItemsTotal}"
                    data-giving-total="${offer.yourItemsTotal}"
                    data-p-l-percentage="${offer.PLPercentage}"
                    data-updated="${offer.time_updated}"
                    title="Projected P/L">
                    ${prettyPrintPrice(currency, (offer.profitOrLoss).toFixed(2))} ${offer.PLPercentageFormatted}
                </span>`,
          ),
        );
      }
    });

    document.getElementById('tradeoffers_summary').innerHTML = DOMPurify.sanitize(`
            <div id="active_offers_count"><b>Active Offers: </b>${activeOfferCount}</div>
            <div id="profitable_offers_count"><b>Profitable Offers: </b>${numberOfProfitableOffers}</div>
            <div id="potential_profit"><b>Potential profit: </b>${prettyPrintPrice(currency, (totalProfit).toFixed(2))}</div>`);
  });
};

const sortOffers = (sortingMode) => {
  const activeOffers = [...document.querySelectorAll('.tradeoffer')].filter((offerElement) => isOfferActive(offerElement));
  let sortedOffers = [];

  if (sortingMode === offersSortingModes.profit_amount.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      return profitOnB - profitOnA;
    });
  } else if (sortingMode === offersSortingModes.loss_amount.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const profitOnA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      const profitOnB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-profit-or-loss'));
      return profitOnA - profitOnB;
    });
  } else if (sortingMode === offersSortingModes.profit_percentage.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      return pLB - pLA;
    });
  } else if (sortingMode === offersSortingModes.loss_percentage.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const pLA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      const pLB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-p-l-percentage'));
      return pLA - pLB;
    });
  } else if (sortingMode === offersSortingModes.default.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
      const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
      return updatedB - updatedA;
    });
  } else if (sortingMode === offersSortingModes.reverse.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseInt(a.querySelector('.profitOrLoss').getAttribute('data-updated'));
      const updatedB = parseInt(b.querySelector('.profitOrLoss').getAttribute('data-updated'));
      return updatedA - updatedB;
    });
  } else if (sortingMode === offersSortingModes.receiving_value.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-receiving-total'));
      const updatedB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-receiving-total'));
      return updatedB - updatedA;
    });
  } else if (sortingMode === offersSortingModes.giving_value.key) {
    sortedOffers = activeOffers.sort((a, b) => {
      const updatedA = parseFloat(a.querySelector('.profitOrLoss').getAttribute('data-giving-total'));
      const updatedB = parseFloat(b.querySelector('.profitOrLoss').getAttribute('data-giving-total'));
      return updatedB - updatedA;
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

// adds receive/sent offers and the last time they happened
// also adds "incoming friend request from" message
const addPartnerOfferSummary = (offers) => {
  chrome.storage.local.get(['tradeHistoryOffers', 'friendRequests'], ({ tradeHistoryOffers, friendRequests }) => {
    if (tradeHistoryOffers) {
      offers.forEach((offer) => {
        const partnerID = getProperStyleSteamIDFromOfferStyle(offer.accountid_other);
        const offerElement = document.getElementById(`tradeofferid_${offer.tradeofferid}`);

        // checks if there is an incoming friend request from this user
        const friendRequestFromPartner = friendRequests.inviters.filter((inviter) => {
          return inviter.steamID === partnerID;
        });
        if (friendRequestFromPartner.length === 1) {
          const friendRequestFrom = offerElement.querySelector('.friendRequestFrom');
          if (friendRequestFrom !== null) friendRequestFrom.remove();

          offerElement.querySelector('.tradeoffer_header').insertAdjacentHTML(
            'afterend',
            '<div class="friendRequestFrom">You have an incoming friend request from this user</div>',
          );
        }

        const storageKey = `offerHistory_${partnerID}`;
        chrome.storage.local.get(storageKey, (result) => {
          const offerHistorySummary = result[storageKey];
          if (offerHistorySummary !== undefined) {
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
  setTimeout(() => { addPartnerOfferSummary(offers); }, 60000);
};

const updateOfferHistoryData = () => {
  getOffersFromAPI('historical').then(
    ({ offers }) => {
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

const periodicallyUpdateRealTimeTotals = (offerEl) => {
  setInterval(() => {
    chrome.storage.local.get(['userSteamWalletCurrency'], ({ userSteamWalletCurrency }) => {
      const offerPrimarySide = offerEl.querySelector('.tradeoffer_items.primary');
      const offerSecondarySide = offerEl.querySelector('.tradeoffer_items.secondary');
      let primaryTotal = 0;
      let secondaryTotal = 0;

      offerPrimarySide.querySelectorAll('.trade_item').forEach((itemEl) => {
        const realTimePrice = itemEl.getAttribute('data-realtime-price');
        if (realTimePrice !== null) primaryTotal += parseInt(realTimePrice);
      });
      const primaryTotalEl = offerPrimarySide.querySelector('.offerRealTimeTotal');
      const primaryTotalFormatted = prettyPrintPrice(
        userSteamWalletCurrency,
        (primaryTotal / 100).toFixed(2),
      );
      if (primaryTotalEl !== null) primaryTotalEl.innerText = primaryTotalFormatted; else {
        offerPrimarySide.insertAdjacentHTML('beforeend', DOMPurify.sanitize(
          `<div class="offerRealTimeTotal">${primaryTotalFormatted}</div>`,
        ));
      }

      const secondaryTotalEl = offerSecondarySide.querySelector('.offerRealTimeTotal');
      offerSecondarySide.querySelectorAll('.trade_item').forEach((itemEl) => {
        const realTimePrice = itemEl.getAttribute('data-realtime-price');
        if (realTimePrice !== null) secondaryTotal += parseInt(realTimePrice);
      });
      const secondaryTotalFormatted = prettyPrintPrice(
        userSteamWalletCurrency,
        (secondaryTotal / 100).toFixed(2),
      );
      if (secondaryTotalEl !== null) secondaryTotalEl.innerText = secondaryTotalFormatted;
      else {
        offerSecondarySide.insertAdjacentHTML('beforeend', DOMPurify.sanitize(
          `<div class="offerRealTimeTotal">${secondaryTotalFormatted}</div>`,
        ));
      }
    });
  }, 3000);
};

logExtensionPresence();
repositionNameTagIcons();
overrideShowTradeOffer();
updateLoggedInUserInfo();
updateLoggedInUserName();
addUpdatedRibbon();
removeLinkFilterFromLinks();

if (activePage === 'incoming_offers') changePageTitle('trade_offers', 'Incoming Trade Offers');
else if (activePage === 'sent_offers') changePageTitle('trade_offers', 'Sent Trade Offers');
else if (activePage === 'incoming_offers_history') changePageTitle('trade_offers', 'Incoming Trade Offers History');
else if (activePage === 'sent_offers_history') changePageTitle('trade_offers', 'Sent Trade Offers History');

// chrome background tab throttling causes steam's own js files to load later
// than the these injections, so it does not override the functions
// this only happens when the tab is opened in the background, https://www.chromestatus.com/feature/5527160148197376
// this is a dirty but working fix for that
let thisManyTimes = 15;
const intervalID = setInterval(() => {
  if (thisManyTimes > 0) {
    overrideShowTradeOffer();
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

if (activePage === 'incoming_offers') {
  // makes the middle of the active trade offers a bit bigger
  // making it the same size as a declined offer so it does not jerk the page when declining
  document.querySelectorAll('.tradeoffer_items_rule').forEach((rule) => {
    rule.style.height = '46px';
  });

  // offer accepting does not work in firefox for some reason
  // and I can't even find a way to debug it...
  if (isChromium()) {
    // adds "accept trade" action to offers
    document.querySelectorAll('.tradeoffer').forEach((offerElement) => {
      if (isOfferActive(offerElement)) {
        const offerID = getOfferIDFromElement(offerElement);
        const partnerID = getProperStyleSteamIDFromOfferStyle(offerElement.querySelector('.playerAvatar').getAttribute('data-miniprofile'));
        offerElement.querySelector('.tradeoffer_footer_actions').insertAdjacentHTML(
          'afterbegin',
          `<span id="accept_${offerID}" class="whiteLink">Accept Trade</span> | `,
        );

        const acceptButton = document.getElementById(`accept_${offerID}`);

        acceptButton.addEventListener('click', () => {
          let message = '';
          const offerContent = offerElement.querySelector('.tradeoffer_items_ctn');
          const middleElement = offerContent.querySelector('.tradeoffer_items_rule');

          acceptOffer(offerID, partnerID).then((res) => {
            if (res.needs_email_confirmation || res.needs_mobile_confirmation) message = 'Accepted - Awaiting Confirmation';
            else {
              message = 'Trade Accepted';
              middleElement.classList.add('accepted');
            }
            offerElement.querySelector('.tradeoffer_footer').style.display = 'none';
          }).catch((err) => {
            console.log(err);
            message = 'Could not accept trade offer, most likely Steam is having problems.';
          }).finally(() => {
            offerContent.classList.remove('active');
            offerContent.classList.add('inactive');

            middleElement.classList.remove('tradeoffer_items_rule');
            middleElement.classList.add('tradeoffer_items_banner');
            middleElement.style.height = '';
            middleElement.innerText = message;
          });
        });
      }
    });
  }

  // overrides steam's trade offer declining logic to skip the confirmation
  // (when set to do so in the options)
  chrome.storage.local.get(['quickDeclineOffer'], ({ quickDeclineOffer }) => {
    if (quickDeclineOffer) {
      document.querySelectorAll('.tradeoffer_footer_actions').forEach((actionsEl) => {
        const actions = actionsEl.querySelectorAll('a.whiteLink');
        const declineButton = actions[actions.length - 1];

        // the original decline button is getting removed and replaced by a new button
        const declineText = declineButton.innerText;
        const oldHref = declineButton.getAttribute('href');
        const offerID = oldHref.split(' \'')[1].split('\'')[0];
        declineButton.remove();

        const newDeclineButton = document.createElement('span');
        newDeclineButton.classList.add('whiteLink');
        newDeclineButton.innerText = declineText;
        actionsEl.appendChild(newDeclineButton);

        newDeclineButton.addEventListener('click', () => {
          let message = '';
          const offerElement = document.getElementById(`tradeofferid_${offerID}`);
          const offerContent = offerElement.querySelector('.tradeoffer_items_ctn');

          declineOffer(offerID).then(() => {
            message = 'Trade Declined';
            offerElement.querySelector('.tradeoffer_footer').style.display = 'none';
          }).catch((err) => {
            console.log(err);
            message = 'Could not decline offer, most likely Steam is having problems.';
          }).finally(() => {
            offerContent.classList.remove('active');
            offerContent.classList.add('inactive');

            const middleElement = offerContent.querySelector('.tradeoffer_items_rule');
            middleElement.classList.remove('tradeoffer_items_rule');
            middleElement.classList.add('tradeoffer_items_banner');
            middleElement.style.height = '';
            middleElement.innerText = message;
          });
        });
      });
    }
  });
}

if (activePage === 'incoming_offers' || activePage === 'sent_offers') {
  // adds the "load realtime price" action to offers
  document.querySelectorAll('.tradeoffer').forEach((offerElement) => {
    if (isOfferActive(offerElement)) {
      const offerID = getOfferIDFromElement(offerElement);
      offerElement.querySelector('.tradeoffer_footer_actions').insertAdjacentHTML(
        'afterbegin',
        DOMPurify.sanitize(`<span id="load_prices_${offerID}" class="whiteLink">Load Prices</span> | `),
      );

      const loadPricesButton = document.getElementById(`load_prices_${offerID}`);

      loadPricesButton.addEventListener('click', () => {
        chrome.storage.local.get(['realTimePricesMode'], ({ realTimePricesMode }) => {
          offerElement.querySelectorAll('.trade_item').forEach((itemEl) => {
            const marketable = itemEl.getAttribute('data-marketable');
            if (marketable === 'true' || marketable === '1') {
              const IDs = getIDsFromElement(itemEl, 'offer');
              const marketName = itemEl.getAttribute('data-market-hash-name');
              itemEl.setAttribute('data-realtime-price', '0');

              priceQueue.jobs.push({
                type: `offers_${realTimePricesMode}`,
                assetID: IDs.assetID,
                appID: IDs.appID,
                contextID: IDs.contextID,
                market_hash_name: marketName,
                retries: 0,
                callBackFunction: addRealTimePriceToPage,
              });
            }
          });

          if (!priceQueue.active) workOnPriceQueue();

          periodicallyUpdateRealTimeTotals(offerElement);
        });
      });
    }
  });

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
      sortOffers(sortingSelect.options[sortingSelect.selectedIndex].value);
    });

    getOffersFromAPI('active').then(
      ({ offers, itemsWithAllInfo }) => {
        addItemInfo(itemsWithAllInfo);

        if (activePage === 'incoming_offers') {
          addTotals(offers.trade_offers_received);
          addPartnerOfferSummary(offers.trade_offers_received);
        } else if (activePage === 'sent_offers') {
          addTotals(offers.trade_offers_sent);
          addPartnerOfferSummary(offers.trade_offers_sent);
        }

        document.getElementById('tradeoffers_summary').innerHTML = DOMPurify.sanitize('<b>Trade offer summary:</b>');

        chrome.storage.local.get('tradeOffersSortingMode', ({ tradeOffersSortingMode }) => {
          document.querySelector(`#offerSortingMethod [value="${tradeOffersSortingMode}"]`).selected = true;
          sortOffers(tradeOffersSortingMode);
          if (activePage === 'sent_offers') jumpToAnchor(window.location.hash);
          document.getElementById('tradeOffersSortingMenu').classList.remove('hidden');
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
