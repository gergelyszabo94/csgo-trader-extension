// only works on steam pages
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { getItemMarketLink } from 'utils/simpleUtils';
import {
  getDopplerInfo,
  getExteriorFromTags,
  getInspectLink,
  getNameTag,
  getQuality,
  getType,
  getRemoteImageAsObjectURL,
} from 'utils/utilsModular';
import addPricesAndFloatsToInventory from 'utils/addPricesAndFloats';
import steamApps from 'utils/static/steamApps';
import { getTradeOffers } from 'utils/IEconService';
import {
  conditions, eventTypes, offerStates, actions, operators,
} from 'utils/static/offers';
import { getPlayerSummaries } from 'utils/ISteamUser';
import { prettyPrintPrice } from 'utils/pricing';
import { playNotificationSound } from 'utils/notifications';

const createTradeOfferJSON = (itemsToGive, itemsToReceive) => {
  return {
    newversion: true,
    version: 2,
    me: {
      assets: itemsToGive,
      currency: [],
      ready: false,
    },
    them: {
      assets: itemsToReceive,
      currency: [],
      ready: false,
    },
  };
};

// only works in content scripts, not in background
const acceptOffer = (offerID, partnerID) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['steamSessionID'], ({ steamSessionID }) => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      const request = new Request(`https://steamcommunity.com/tradeoffer/${offerID}/accept`,
        {
          method: 'POST',
          headers: myHeaders,
          referrer: `https://steamcommunity.com/tradeoffer/${offerID}/`,
          body: `sessionid=${steamSessionID}&serverid=1&tradeofferid=${offerID}&partner=${partnerID}&captcha=`,
        });

      fetch(request).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject({ status: response.status, statusText: response.statusText });
        } else return response.json();
      }).then((body) => {
        resolve(body);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
};

// opens the offer in a new tab where it gets accepted
const openAndAcceptOffer = (offerID, partnerID) => {
  chrome.tabs.create({
    url: `https://steamcommunity.com/tradeoffer/${offerID}/?csgotrader_accept=true&partner=${partnerID}`,
  });
};

// this gets injected to the page page context from the background script
const getAcceptScriptAsString = (offerID, partnerID) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['steamSessionID'], ({ steamSessionID }) => {
      resolve(`
      acceptInterval = setInterval(() => {
         myHeaders = new Headers();
         myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  
         request = new Request(\`https://steamcommunity.com/tradeoffer/${offerID}/accept\`,
           {
             method: 'POST',
             headers: myHeaders,
             referrer: \`https://steamcommunity.com/tradeoffer/${offerID}/\`,
             body: \`sessionid=${steamSessionID}&serverid=1&tradeofferid=${offerID}&partner=${partnerID}&captcha=\`,
           });
    
         fetch(request).then(() => {
           clearInterval(acceptInterval);
         }); 
      }, 4000);`);
    });
  });
};

// trade offers can't be accepted from background scripts because of CORS
// this function looks for tab that has Steam open and injects the accept script
const acceptTradeInBackground = (offerID, partnerID) => {
  chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
    if (permission) {
      chrome.tabs.query({ url: 'https://steamcommunity.com/*' }, (tabs) => {
        if (tabs.length !== 0) {
          getAcceptScriptAsString(offerID, partnerID).then((scriptString) => {
            chrome.tabs.executeScript(tabs[0].id, {
              code: scriptString,
            }, () => {});
          });
        } else openAndAcceptOffer(offerID, partnerID);
      });
    }
  });
};

// works in background pages as well
const declineOffer = (offerID) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['steamSessionID'], ({ steamSessionID }) => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      const request = new Request(`https://steamcommunity.com/tradeoffer/${offerID}/decline`,
        {
          method: 'POST',
          headers: myHeaders,
          body: `sessionid=${steamSessionID}`,
        });

      fetch(request).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject({ status: response.status, statusText: response.statusText });
        } else return response.json();
      }).then((body) => {
        if (body.tradeofferid === offerID) {
          resolve(body);
        } else reject(body);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
};

const sendOffer = (partnerID, tradeOfferJSON, token, message) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['steamSessionID'], ({ steamSessionID }) => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      const request = new Request('https://steamcommunity.com/tradeoffer/new/send',
        {
          method: 'POST',
          headers: myHeaders,
          body: `sessionid=${steamSessionID}&serverid=1&partner=${getProperStyleSteamIDFromOfferStyle(partnerID)}&tradeoffermessage=${message}&json_tradeoffer=${JSON.stringify(tradeOfferJSON)}&captcha=&trade_offer_create_params=${JSON.stringify({ trade_offer_access_token: token })}`,
        });

      fetch(request).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject({ status: response.status, statusText: response.statusText });
        } else return response.json();
      }).then((body) => {
        resolve(body);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
};

const notifyAboutOffer = (offer) => {
  chrome.storage.local.get('currency', ({ currency }) => {
    const steamIDOfPartner = getProperStyleSteamIDFromOfferStyle(offer.accountid_other);
    getPlayerSummaries([steamIDOfPartner]).then((summary) => {
      const userDetails = summary[steamIDOfPartner];

      let icon = '/images/cstlogo128.png';
      getRemoteImageAsObjectURL(userDetails.avatar).then((iconURL) => {
        icon = iconURL;
      }).catch((e) => {
        console.log(e);
      }).finally(() => {
        chrome.notifications.create(`offer_received_${offer.tradeofferid}`, {
          type: 'basic',
          iconUrl: icon,
          title: `Offer from ${userDetails.personaname} (${prettyPrintPrice(currency, offer.profitOrLoss.toFixed(2))})!`,
          message: `You just received a new trade offer from ${userDetails.personaname}!`,
        }, () => {
          playNotificationSound();
        });
      });
    });
  });
};

// info about the active offers is kept in storage
// so we can check if an item is present in another offer
// also to know when offer loading is necessary when monitoring offers
const updateActiveOffers = (offers, items) => {
  // even though active offers are requested
  // not all of them has the active state (2)
  // we need the actual number of active offers to compare with the notification count
  let receivedActiveCount = 0;
  if (offers.trade_offers_received) {
    offers.trade_offers_received.forEach((offer) => {
      if (offer.trade_offer_state === offerStates['2'].key) receivedActiveCount += 1;
    });
  }

  chrome.storage.local.get('showNumberOfOfferOnBadge', ({ showNumberOfOfferOnBadge }) => {
    if (showNumberOfOfferOnBadge) {
      chrome.browserAction.setBadgeText({ text: receivedActiveCount.toString() });
    }
  });

  let sentActiveCount = 0;
  if (offers.trade_offers_sent) {
    offers.trade_offers_sent.forEach((offer) => {
      if (offer.trade_offer_state === offerStates['2'].key) sentActiveCount += 1;
    });
  }

  chrome.storage.local.set({
    activeOffers: {
      lastFullUpdate: Math.floor(Date.now() / 1000),
      items,
      sent: offers.trade_offers_sent,
      sentActiveCount,
      received: offers.trade_offers_received,
      receivedActiveCount,
      descriptions: offers.descriptions,
    },
  }, () => {});
};

const extractItemsFromOffers = (offers, sentOrReceived, userID) => {
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

const matchItemsWithDescriptions = (items) => {
  const itemsToReturn = [];
  items.forEach((item) => {
    // some items don't have descriptions for some reason - will have to be investigated later
    if (item.market_hash_name !== undefined) {
      const appID = item.appid.toString();
      itemsToReturn.push({
        appid: appID,
        contextid: item.contextid.toString(),
        name: item.name,
        marketable: item.marketable,
        market_hash_name: item.market_hash_name,
        name_color: item.name_color,
        marketlink: getItemMarketLink(item.appid.toString(), item.market_hash_name),
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
        type: appID === steamApps.CSGO.appID ? getType(item.tags) : null,
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

const matchItemsAndAddDetails = (offers, userID) => {
  return new Promise((resolve) => {
    let allItemsInOffer = extractItemsFromOffers(offers.trade_offers_sent, 'sent', userID);
    allItemsInOffer = allItemsInOffer.concat(
      extractItemsFromOffers(offers.trade_offers_received, 'received', userID),
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
      resolve(items);
    });
  });
};

const logTradeOfferEvents = (events) => {
  chrome.storage.local.get(['tradeOffersEventLogs'], ({ tradeOffersEventLogs }) => {
    chrome.storage.local.set({
      tradeOffersEventLogs: [...tradeOffersEventLogs, ...events],
    }, () => {});
  });
};

const createTradeOfferEvent = (offer, type, ruleIndex) => {
  const eventType = eventTypes[type] !== undefined ? eventTypes[type].key : type;
  return {
    type: eventType,
    rule: ruleIndex + 1,
    steamID: getProperStyleSteamIDFromOfferStyle(offer.accountid_other),
    offerID: offer.tradeofferid,
    timestamp: Date.now(),
  };
};

const executeVerdict = (offer, ruleNumber, verdict) => {
  logTradeOfferEvents([createTradeOfferEvent(offer, verdict, ruleNumber)]);
  switch (verdict) {
    case actions.notify.key: notifyAboutOffer(offer); break;
    case actions.decline.key: declineOffer(offer.tradeofferid); break;
    case actions.accept.key: acceptTradeInBackground(
      offer.tradeofferid,
      getProperStyleSteamIDFromOfferStyle(offer.accountid_other),
    ); break;
    default: break;
  }
};

const evaluateCondition = (offer, condition) => {
  if (condition.type === conditions.profit_over.key
    && offer.profitOrLoss >= condition.value) {
    return true;
  }
  if (condition.type === conditions.profit_under.key
    && offer.profitOrLoss < condition.value) {
    return true;
  }
  if (condition.type === conditions.profit_percentage_over.key
    && offer.PLPercentage >= (condition.value / 100) + 1) {
    return true;
  }
  if (condition.type === conditions.profit_percentage_under.key
    && offer.PLPercentage < (condition.value / 100) + 1) {
    return true;
  }
  if (condition.type === conditions.has_message.key && offer.message !== '') {
    return true;
  } if (condition.type === conditions.no_message.key && offer.message === '') {
    return true;
  }
  if (condition.type === conditions.message_includes.key
    && offer.message.includes(condition.value)) {
    return true;
  }
  if (condition.type === conditions.message_doesnt_include.key
    && offer.message !== ''
    && !offer.message.includes(condition.value)) {
    return true;
  }
  if (condition.type === conditions.receiving_items_over.key
    && ((offer.items_to_receive !== undefined
      && offer.items_to_receive.length >= condition.value)
      || (condition.value <= 0 && offer.items_to_receive === undefined))) {
    return true;
  }
  if (condition.type === conditions.receiving_items_under.key
    && ((offer.items_to_receive !== undefined
      && offer.items_to_receive.length < condition.value)
      || (condition.value <= 1 && offer.items_to_receive === undefined))) {
    return true;
  }
  if (condition.type === conditions.giving_items_over.key
    && ((offer.items_to_give !== undefined
      && offer.items_to_give.length >= condition.value)
      || (condition.value <= 0 && offer.items_to_give === undefined))) {
    return true;
  }
  if (condition.type === conditions.giving_items_under.key
    && ((offer.items_to_give !== undefined
      && offer.items_to_give.length < condition.value)
      || (condition.value <= 1 && offer.items_to_give === undefined))) {
    return true;
  }
  if (condition.type === conditions.receiving_non_csgo_items.key
    && offer.theirIncludesNonCSGO) {
    return true;
  }
  if (condition.type === conditions.giving_non_csgo_items.key
    && offer.yourIncludesNonCSGO) {
    return true;
  }
  if (condition.type === conditions.receiving_no_price_items.key
    && offer.theirIncludesItemWIthNoPrice) {
    return true;
  }
  if (condition.type === conditions.giving_no_price_items.key
    && offer.yourIncludesItemWIthNoPrice) {
    return true;
  }
  return false;
};

const evaluateRule = (offer, rule) => {
  for (let i = 0; i < rule.conditions.length; i += 1) {
    if (evaluateCondition(offer, rule.conditions[i])) {
      if (rule.operators[i] === undefined || rule.operators[i] === operators.or.key) {
        return true;
      }
    } else if (rule.operators[i] === undefined
      || rule.operators[i] === operators.and.key) {
      return false;
    }
  }
  return false;
};

const evaluateOffers = (offers, rules) => {
  offers.forEach((offer) => {
    for (const [index, rule] of rules.entries()) {
      if (rule.active) {
        if (evaluateRule(offer, rule)) {
          executeVerdict(offer, index, rule.action);
          break;
        }
      }
    }
  });
};

const addOfferTotals = (offers, items) => {
  if (offers) {
    offers.forEach((offer) => {
      offer.theirItemsTotal = 0.0;
      offer.theirIncludesItemWIthNoPrice = false;
      offer.theirIncludesNonCSGO = false;

      if (offer.items_to_receive) {
        offer.items_to_receive.forEach((item) => {
          const itemWithDescription = items.find((description) => {
            return description.classid === item.classid
              && description.instanceid === item.instanceid;
          });

          if (itemWithDescription) {
            if (itemWithDescription.appid === steamApps.CSGO.appID) {
              if (itemWithDescription.price && itemWithDescription.price.price) {
                offer.theirItemsTotal += parseFloat(itemWithDescription.price.price);
              } else offer.theirIncludesItemWIthNoPrice = true;
            } else {
              offer.theirIncludesItemWIthNoPrice = true;
              offer.theirIncludesNonCSGO = true;
            }
          }
        });
      }

      offer.yourIncludesItemWIthNoPrice = false;
      offer.yourItemsTotal = 0.0;
      offer.yourIncludesNonCSGO = false;

      if (offer.items_to_give) {
        offer.items_to_give.forEach((item) => {
          const itemWithDescription = items.find((description) => {
            return description.classid === item.classid
              && description.instanceid === item.instanceid;
          });

          if (itemWithDescription) {
            if (itemWithDescription.appid === steamApps.CSGO.appID) {
              if (itemWithDescription.price && itemWithDescription.price.price) {
                offer.yourItemsTotal += parseFloat(itemWithDescription.price.price);
              } else offer.yourIncludesItemWIthNoPrice = true;
            } else {
              offer.yourIncludesItemWIthNoPrice = true;
              offer.yourIncludesNonCSGO = true;
            }
          }
        });
      }

      offer.profitOrLoss = offer.theirItemsTotal - offer.yourItemsTotal;
      offer.PLPercentage = offer.theirItemsTotal / offer.yourItemsTotal;
    });

    return offers;
  }
  return undefined; // if there are no offers Steam does not include the property at all
};

// loads active offers, updates active offers in storage
// checks for new offers and starts evaluation
const updateTrades = () => {
  return new Promise((resolve, reject) => {
    // active offers has the previously loaded active trade offer info
    chrome.storage.local.get(['steamIDOfUser', 'activeOffers', 'offerEvalRules'], ({ steamIDOfUser, activeOffers, offerEvalRules }) => {
      const prevProcessedOffersIDs = [];
      if (activeOffers.received) {
        activeOffers.received.forEach((offer) => {
          prevProcessedOffersIDs.push(offer.tradeofferid);
        });
      }

      // requesting the latest active offer info from Steam
      getTradeOffers('active').then((offersData) => {
        const newOffers = [];
        const newOfferEvents = [];

        if (offersData.trade_offers_received) {
          offersData.trade_offers_received.forEach((offer) => {
            if (!prevProcessedOffersIDs.includes(offer.tradeofferid)
              && offer.trade_offer_state === offerStates['2'].key) {
              newOffers.push(offer);
              newOfferEvents.push(createTradeOfferEvent(offer, eventTypes.new.key, 0));
            }
          });
        }

        logTradeOfferEvents(newOfferEvents);

        matchItemsAndAddDetails(offersData, steamIDOfUser).then((items) => {
          offersData.trade_offers_received = addOfferTotals(
            offersData.trade_offers_received, items,
          );
          offersData.trade_offers_sent = addOfferTotals(
            offersData.trade_offers_sent, items,
          );

          updateActiveOffers(offersData, items);
          evaluateOffers(newOffers, offerEvalRules);
          resolve({
            offersData,
            items,
          });
        });
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
};

const removeOldOfferEvents = () => {
  chrome.storage.local.get(['tradeOffersEventLogs'], ({ tradeOffersEventLogs }) => {
    const now = Date.now();
    const recentEvents = tradeOffersEventLogs.filter((event) => {
      const delta = (now - event.timestamp) / 1000;
      return delta < 86400 * 7;
    });

    chrome.storage.local.set({
      tradeOffersEventLogs: recentEvents,
    }, () => {});
  });
};

export {
  acceptOffer, declineOffer, updateActiveOffers, extractItemsFromOffers, sendOffer,
  matchItemsAndAddDetails, updateTrades, removeOldOfferEvents, acceptTradeInBackground,
  createTradeOfferJSON,
};
