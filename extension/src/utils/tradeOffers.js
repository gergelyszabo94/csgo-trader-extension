// only works on steam pages

import {
  actions,
  conditions,
  eventTypes,
  offerStates,
  operators,
} from 'utils/static/offers';
import {
  getDopplerInfo,
  getExteriorFromTags,
  getInspectLink,
  getNameTag,
  getQuality,
  getRemoteImageAsObjectURL,
  getType,
} from 'utils/utilsModular';
import { getFormattedPLPercentage, getItemMarketLink, isDopplerInName } from 'utils/simpleUtils';
import { notifyOnDiscord, playNotificationSound } from 'utils/notifications';

import DOMPurify from 'dompurify';
import addPricesAndFloatsToInventory from 'utils/addPricesAndFloats';
import { getPlayerSummaries } from 'utils/ISteamUser';
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { getTradeOffers } from 'utils/IEconService';
import { prettyPrintPrice } from 'utils/pricing';
import steamApps from 'utils/static/steamApps';
import { getItemByIDs } from './itemsToElementsToItems';

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

const acceptTradeWithRetryInject = (offerID, partnerID) => {
  window[`acceptTries${offerID}`] = 1;

  window[`acceptInterval$${offerID}`] = setInterval(() => {
    if (window[`acceptTries${offerID}`] <= 5) {
      window[`acceptTries${offerID}`] += 1;
      acceptOffer(offerID, partnerID).then(() => {
        clearInterval(window[`acceptInterval$${offerID}`]);
      }).catch((e) => {
        console.log(e);
      });
    } else clearInterval(window[`acceptInterval$${offerID}`]);
  });
};

// trade offers can't be accepted from background scripts because of CORS
// this function looks for tab that has Steam open and injects the accept script
const acceptTradeInBackground = (offerID, partnerID) => {
  chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
    if (permission) {
      chrome.tabs.query({ url: 'https://steamcommunity.com/*' }, (tabs) => {
        if (tabs.length !== 0) {
          chrome.scripting.executeScript({
            target: {
              tabId: tabs[0].id,
            },
            func: acceptTradeWithRetryInject,
            args: [offerID, partnerID],
          }, () => {});
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

const createDiscordSideSummary = (offerSideItems, itemsWithDetails) => {
  const itemNames = {};
  let summary = '';

  if (offerSideItems !== null && offerSideItems !== undefined) {
    offerSideItems.forEach((itemToGive) => {
      const item = getItemByIDs(
        itemsWithDetails,
        itemToGive.appid.toString(),
        itemToGive.contextid,
        itemToGive.assetid,
      );
      if (item) {
        let itemName = item.dopplerInfo
          ? `${item.market_hash_name} (${item.dopplerInfo.name})`
          : item.market_hash_name;
        if (item.price) itemName += ` (${item.price.display})`;
        if (item.floatInfo) itemName += ` (${item.floatInfo.floatvalue.toFixed(4)})`;
        
        if (itemName in itemNames) {
          itemNames[itemName] += 1;
        } else {
          itemNames[itemName] = 1;
        }
      }
    });

    for (const [name, amount] of Object.entries(itemNames)) {
      summary += amount > 1 ? `${name} (x${amount})\n` : `${name}\n`;
    }
    return summary;
  }
  
  // 1024 is max size of an embed field
  if (summary.length > 1024) {
    // cut off all chars after 1024
    summary = summary.slice(0, 1024);
    // remove lines until there are 4 chars to spare
    while (summary.length > 1020) {
      summary = summary.split('\n').slice(0, -1).join('\n');
    }
    // add \n... 
    summary += '\n...';
  }

  return summary;
};

const notifyAboutOfferOnDiscord = (offer, items) => {
  chrome.storage.local.get('currency', ({ currency }) => {
    const steamIDOfPartner = getProperStyleSteamIDFromOfferStyle(offer.accountid_other);
    getPlayerSummaries([steamIDOfPartner]).then((summary) => {
      const userDetails = summary[steamIDOfPartner];

      const title = `Trade Offer (${prettyPrintPrice(currency, offer.profitOrLoss.toFixed(2))} ${offer.PLPercentageFormatted})`;
      const description = offer.message !== '' ? `*${DOMPurify.sanitize(offer.message)}*` : '';
      
      const giving = createDiscordSideSummary(offer.items_to_give, items);
      const receiving = createDiscordSideSummary(offer.items_to_receive, items);

      const fields = [];
      if (giving) fields.push({ name: `Giving (${prettyPrintPrice(currency, offer.yourItemsTotal.toFixed(2))})`, inline: false, value: giving });
      if (receiving) fields.push({ name: `Receiving (${prettyPrintPrice(currency, offer.theirItemsTotal.toFixed(2))})`, inline: false, value: receiving });
      
      const timestamp = new Date(offer.time_updated * 1000).toISOString();

      const embed = {
        footer: {
          text: 'CSGO Trader',
          icon_url: 'https://csgotrader.app/cstlogo48.png',
        },
        author: {
          name: userDetails.personaname,
          icon_url: userDetails.avatar,
          url: `https://steamcommunity.com/profiles/${steamIDOfPartner}`,
        },
        title,
        description,
        // #ff8c00 (taken from csgotrader.app text color)
        color: 16747520,
        fields,
        timestamp,
        type: 'rich',
        url: `https://steamcommunity.com/tradeoffer/${offer.tradeofferid}`,
      };

      notifyOnDiscord(embed);
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
      chrome.action.setBadgeText({ text: receivedActiveCount.toString() });
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
        dopplerInfo: isDopplerInName(item.name) ? getDopplerInfo(item.icon_url) : null,
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

const executeVerdict = (offer, ruleNumber, verdict, items, offersToAcceptCount) => {
  logTradeOfferEvents([createTradeOfferEvent(offer, verdict, ruleNumber)]);

  switch (verdict) {
    case actions.notify.key: notifyAboutOffer(offer); break;
    case actions.notify_discord.key: notifyAboutOfferOnDiscord(offer, items); break;
    case actions.decline.key: declineOffer(offer.tradeofferid); break;
    case actions.accept.key: setTimeout(() => {
      acceptTradeInBackground(
        offer.tradeofferid,
        getProperStyleSteamIDFromOfferStyle(offer.accountid_other),
      );
    }, offersToAcceptCount * 2000); break;
    default: break;
  }
};

const evaluateCondition = (offer, condition) => {
  // safeguard against corrupted offer data
  if (!((offer.items_to_receive === undefined || offer.items_to_receive.length === 0)
    && (offer.items_to_give === undefined || offer.items_to_give.length === 0))) {
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
    if (condition.type === conditions.receiving_value_over.key
      && offer.theirItemsTotal > condition.value) {
      return true;
    }
    if (condition.type === conditions.receiving_value_under.key
      && offer.theirItemsTotal < condition.value) {
      return true;
    }
    if (condition.type === conditions.giving_value_over.key
      && offer.yourItemsTotal > condition.value) {
      return true;
    }
    if (condition.type === conditions.giving_value_under.key
      && offer.yourItemsTotal < condition.value) {
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

const evaluateOffers = (offers, rules, items) => {
  let offersToAcceptCount = 0;

  offers.forEach((offer) => {
    for (const [index, rule] of rules.entries()) {
      if (rule.active) {
        if (evaluateRule(offer, rule)) {
          if (rule.action === actions.accept.key) offersToAcceptCount += 1;
          executeVerdict(offer, index, rule.action, items, offersToAcceptCount);
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
      offer.PLPercentageFormatted = getFormattedPLPercentage(
        offer.yourItemsTotal,
        offer.theirItemsTotal,
      );
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
      getTradeOffers(1, 0, 1, 1, 1).then((offersData) => {
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
          evaluateOffers(newOffers, offerEvalRules, items);
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
