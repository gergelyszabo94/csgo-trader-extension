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
} from 'utils/utilsModular';
import addPricesAndFloatsToInventory from 'utils/addPricesAndFloats';

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

// info about the active offers is kept in storage
// so we can check if an item is present in another offer
// also to know when offer loading is necessary when monitoring offers
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
      itemsToReturn.push({
        appid: item.appid.toString(),
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

export {
  acceptOffer, declineOffer, updateActiveOffers, extractItemsFromOffers, matchItemsAndAddDetails,
};
