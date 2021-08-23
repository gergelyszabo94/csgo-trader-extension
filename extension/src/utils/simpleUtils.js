// this utils module should never have any non-static dependencies

const getItemMarketLink = (appID, marketHashName) => {
  return `https://steamcommunity.com/market/listings/${appID}/${marketHashName}`;
};

const getItemInventoryLink = (steamID, appID, contextID, assetID) => {
  return `https://steamcommunity.com/profiles/${steamID}/inventory/#${appID}_${contextID}_${assetID}`;
};

const getOfferLink = (offerID) => {
  return `https://steamcommunity.com/tradeoffer/${offerID}`;
};

const playAudio = (source, sourceType, volume) => {
  const sourceURL = sourceType === 'local'
    ? chrome.runtime.getURL(source)
    : source;
  const audio = new Audio(sourceURL);
  audio.volume = volume;
  audio.play();
};

const getItemByNameAndGame = (inventory, appID, contextID, itemName) => {
  return inventory.find((item) => {
    return (item.market_hash_name === itemName
      && item.appid === appID && item.contextid === contextID);
  });
};

const closeTab = () => new Promise((resolve, reject) => {
  if (window.opener) {
    window.close(); // only tabs opened by js can be closed by js
    resolve('closed');
  } else {
    chrome.runtime.sendMessage({
      closeTab: window.location.href,
    }, () => {
      reject('couldnt_close');
    });
  }
});

const getFormattedPLPercentage = (giving, receiving) => {
  return (giving === 0 || receiving === 0)
    ? ''
    : `(${(((receiving / giving) - 1) * 100).toFixed(2)}%)`;
};

// for phase detection we have to know if th item is a doppler
const isDopplerInName = (name) => {
  // english and many other languages, polish iirc, simplified chinese, korean, bulgarian, russian
  const patterns = ['Doppler', 'doppler', '多普勒', '도플러', 'Доплер', 'Волны'];
  const dopplerCheckRegex = new RegExp(patterns.join('|'), 'i');
  return dopplerCheckRegex.test(name);
};

// tries to parse which collection the item belongs to
// if it find a collection it return its name as a string
// otherwise return null
const getCollection = (descriptions) => {
  let collectionName = null;

  if (descriptions) {
    descriptions.forEach((description) => {
      if (description.value.slice(description.value.length - 11) === ' Collection') {
        collectionName = description.value;
      }
    });
  }
  return collectionName;
};

export {
  getItemMarketLink, getItemInventoryLink, getOfferLink, playAudio,
  getItemByNameAndGame, closeTab, isDopplerInName, getFormattedPLPercentage,
  getCollection,
};
