import exteriors from 'utils/static/exteriors';
import { currencies } from 'utils/static/pricing';
import { dopplerPhases, iconToPhaseMapping } from 'utils/static/dopplerPhases';
import rarities from 'utils/static/rarities';
import qualities from 'utils/static/qualities';
import itemTypes from 'utils/static/itemTypes';
import patterns from 'utils/static/patterns';
import { getPrice } from 'utils/pricing';
import collectionsWithSouvenirs from 'utils/static/collectionsWithSouvenirs';
import { injectScript } from 'utils/injection';
import { getUserSteamID } from 'utils/steamID';
import DOMPurify from 'dompurify';
import { getIDsFromElement } from 'utils/itemsToElementsToItems';
import { createOffscreen } from 'utils/simpleUtils';
import buffIds from 'utils/static/buffIds.json';
import bluePercentage from 'utils/static/bluepercent.json';

const { FadeCalculator } = require('csgo-fade-percentage-calculator');

// "Sticker" in different languages
// english, simplified chinese, traditional chinese,
// japanese, korean, bulgarian, thai, czech, danish,
// german, spanish, latin spanish, greek, french, italian, indonesian,
// hungarian, norwegian, polish, portuguese, brazil,
// romanian, russian, finnish, swedish, turkish,
// vietnamese, ukrainian
const stickerNames = [
  'Sticker', '印花', '貼紙', 'ステッカー',
  '스티커', 'Αυτοκόλλητο', 'สติกเกอร์', 'Samolepka', 'Klistermærke',
  'Aufkleber', 'Pegatina', 'Calcomanía', 'Αυτοκόλλητο', 'Sticker', 'Adesivo',
  'Stiker', 'Matrica', 'Klistremerke', 'Naklejka', 'Autocolante', 'Adesivo',
  'Abțibild', 'Наклейка', 'Tarra', 'Klistermärke', 'Çıkartma',
  'Hình dán', 'Наліпка'];

// "Charm" in different languages
// english, simplified chinese, traditional chinese,
// japanese, korean, bulgarian, thai, czech, danish,
// german, spanish, latin spanish, greek, french, italian, indonesian,
// hungarian, norwegian, polish, portuguese, brazil,
// romanian, russian, finnish, swedish, turkish,
// vietnamese, ukrainian
// const charmNames = [
//   'Charm', '挂件', '吊飾', 'チャーム', '참 장식',
//   'Джунджурия', 'พวงกุญแจ', 'Přívěsek', 'Vedhæng',
//   'Anhänger', 'Colgante', 'Colgante', 'Γούρι',
//   'Porte-bonheur', 'Ciondolo', 'Gantungan',
//   'Talizmán', 'Anheng', 'Przywieszka', 'Amuleto',
//   'Chaveiro', 'Breloc', 'Брелок', 'Riipus', 'Hänge',
//   'Süs', 'Móc treo', 'Брелок',
// ];

const chKnifeNames = [
  ['M9 Bayonet', 'M9_Bayonet'], // important to put it before normal bayo
  ['Bayonet', 'Bayonet'],
  ['Bowie Knife', 'Bowie_Knife'],
  ['Butterfly Knife', 'Butterfly_Knife'],
  ['Classic Knife', 'Classic_Knife'],
  ['Falchion Knife', 'Falchion_Knife'],
  ['Flip Knife', 'Flip_Knife'],
  ['Gut Knife', 'Gut_Knife'],
  ['Huntsman Knife', 'Huntsman_Knife'],
  ['Karambit', 'Karambit'],
  ['Kukri Knife', 'Kukri_Knife'],
  ['Navaja Knife', 'Navaja_Knife'],
  ['Nomad Knife', 'Nomad_Knife'],
  ['Paracord Knife', 'Paracord_Knife'],
  ['Shadow Daggers', 'Shadow_Daggers'],
  ['Skeleton Knife', 'Skeleton_Knife'],
  ['Stiletto Knife', 'Stiletto_Knife'],
  ['Survival Knife', 'Survival_Knife'],
  ['Talon Knife', 'Talon_Knife'],
  ['Ursus Knife', 'Ursus_Knife'],
];

// prints all kinds of numbers without using scientific notation, etc.
// no idea how this works, from:
// https://stackoverflow.com/a/61281355/3862289
const toPlainString = (num) => {
  return (`${+num}`).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
    (a, b, c, d, e) => {
      return e < 0
        ? `${b}0.${Array(1 - e - c.length).join(0)}${c}${d}`
        : b + c + d + Array(e - d.length + 1).join(0);
    });
};

// only use it with csgo item float values
const getFloatAsFormattedString = (float, decimals) => {
  const decimalsInt = parseInt(decimals);
  if (float > 0 && float < 1) {
    const plainFloatString = toPlainString(float);
    return plainFloatString.substring(0, decimalsInt + 2);
  } return null;
};

const logExtensionPresence = () => {
  const { version } = chrome.runtime.getManifest();
  console.log(`CS2 Trader - Steam Trading Enhancer ${version} is running on this page. Changelog at: https://csgotrader.app/changelog/`);
  console.log('If you see any errors that seem related to the extension please email support@csgotrader.app.');
};

const getAppropriateFetchFunc = () => {
  // works around the different behavior when fetching from chromium or ff
  // This is accomplished by exposing more privileged XHR and
  // fetch instances in the content script,
  // which has the side-effect of not setting the Origin and
  // Referer headers like a request from the page itself would;
  // this is often preferable to prevent the request from revealing its cross-orign nature.
  // In Firefox, extensions that need to perform requests that behave as if they were
  // sent by the content itself can use  content.XMLHttpRequest and content.fetch() instead.
  // For cross-browser extensions, the presence of these methods must be feature-detected.
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
  // const fetchFunction = content !== undefined ? content.fetch : fetch;

  let fetchFunction = fetch;

  try {
    // eslint-disable-next-line no-undef
    fetchFunction = content !== undefined ? content.fetch : fetch;
    // eslint-disable-next-line no-empty
  } catch (e) { }

  return fetchFunction;
};

const validateSteamAPIKey = (apiKey) => new Promise((resolve, reject) => {
  const getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561198036030455`);

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response.status);
    } else return response.json();
  }).then((body) => {
    try {
      if (body.response.players[0].steamid === '76561198036030455') resolve(true);
      else resolve(false);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const setAPIKeyFirstTime = async () => {
  await createOffscreen([chrome.offscreen.Reason.DOM_PARSER], 'dom parsing');
  chrome.runtime.sendMessage({ scrapeAPIKey: 'scrapeAPIKey' }, (apiKey) => {
    if (apiKey !== null) {
      console.log(apiKey);
      validateSteamAPIKey(apiKey).then(
        (apiKeyValid) => {
          if (apiKeyValid) {
            console.log('api key valid');
            chrome.storage.local.set({ steamAPIKey: apiKey, apiKeyValid: true }, () => { });
          } else console.log('api key invalid');
        },
      ).catch((err) => {
        console.log(err);
      });
    } else console.log('Was not able to scrape API key, probably not logged in?');
  });
};

const validateSteamAccessToken = (accessToken) => new Promise((resolve, reject) => {
  const getRequest = new Request(`https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/?appid=730&class_count=1&classid0=3608123907&access_token=${accessToken}`);

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response.status);
    } else return response.json();
  }).then((body) => {
    try {
      if (body.result.success) resolve(true);
      else resolve(false);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const setAccessTokenFirstTime = async () => {
  await createOffscreen([chrome.offscreen.Reason.DOM_PARSER], 'dom parsing');
  chrome.runtime.sendMessage({ scrapeAccessToken: 'scrapeAccessToken' }, (accessToken) => {
    if (accessToken !== null) {
      validateSteamAccessToken(accessToken).then(
        (accessTokenValid) => {
          if (accessTokenValid) {
            chrome.storage.local.set({ steamAcessToken: accessToken, steamAcessTokenValid: true }, () => { });
          }
        },
      ).catch((err) => {
        console.log(err);
      });
    } else console.log('Was not able to scrape access token, probably not logged in?');
  });
};

const arrayFromArrayOrNotArray = (arrayOrNotArray) => {
  if (!Array.isArray(arrayOrNotArray)) return [arrayOrNotArray];
  return arrayOrNotArray;
};

const removeFromArray = (array, arrayIndex) => {
  const newArray = [];

  array.forEach((element, index) => {
    if (index !== arrayIndex) newArray.push(element);
  });

  return newArray;
};

const getExteriorFromTags = (tags) => {
  if (tags !== undefined) {
    for (const tag of tags) {
      if (tag.category === 'Exterior') {
        for (const exterior in exteriors) {
          if (exteriors[exterior].internal_name === tag.internal_name) return exteriors[exterior];
        }

        // no exterior
        return null;
      }
    }
  }
  return null;
};

const getNameTag = (item) => {
  try {
    if (item.descriptions !== undefined) {
      for (const description of item.descriptions) {
        if (description.value.includes('Name Tag:')) {
          return description.value.split('Name Tag: \'\'')[1].split('\'\'')[0];
        }
      }
    }
  } catch (error) { return null; }
};

const getInspectLink = (item, owner, assetID) => {
  try {
    if (item.actions !== undefined && item.actions[0] !== undefined) {
      const beginning = item.actions[0].link.split('%20S')[0];
      const end = item.actions[0].link.split('%assetid%')[1];
      return owner !== undefined
        ? (`${beginning}%20S${owner}A${assetID}${end}`)
        : (`${beginning}%20S${item.owner}A${item.assetid}${end}`);
    }
    // eslint-disable-next-line no-empty
  } catch (error) { return null; }
};

const getDopplerInfo = (icon) => {
  return iconToPhaseMapping[icon] !== undefined ? iconToPhaseMapping[icon] : dopplerPhases.unk;
};

const getQuality = (tags) => {
  if (tags !== undefined) {
    for (const tag of tags) {
      if (tag.category === 'Rarity') {
        for (const rarity in rarities) {
          if (rarities[rarity].internal_name === tag.internal_name) {
            return qualities[rarities[rarity].name];
          }
        }

        // if the rarity is unknown to the extension
        console.log(tag.internal_name);
        return qualities.stock;
      }
    }
  }
  return null;
};

const getType = (tags) => {
  if (tags !== undefined) {
    for (const tag of tags) {
      if (tag.category === 'Type') {
        for (const itemType of Object.values(itemTypes)) {
          if (itemType.internal_name === tag.internal_name) return itemType;
        }

        // if the category is unknown to the extension - for example a new item type was introduced
        console.log(tag.internal_name);
        return itemTypes.unknown_type;
      }
    }
  }
  return null;
};

const getPattern = (name, paintSeed) => {
  if (name.includes(' Marble Fade ')) {
    let pattern = null;
    if (name.includes('Karambit')) pattern = patterns.marble_fades.karambit[paintSeed];
    else if (name.includes('Butterfly')) pattern = patterns.marble_fades.butterfly[paintSeed];
    else if (name.includes('M9 Bayonet')) pattern = patterns.marble_fades.m9[paintSeed];
    else if (name.includes('Bayonet')) pattern = patterns.marble_fades.bayonet[paintSeed];
    else if (name.includes('Talon')) pattern = patterns.marble_fades.talon[paintSeed];
    else if (name.includes('Stiletto')) pattern = patterns.marble_fades.stiletto[paintSeed];
    else if (name.includes('Navaja')) pattern = patterns.marble_fades.navaja[paintSeed];
    else if (name.includes('Ursus')) pattern = patterns.marble_fades.ursus[paintSeed];
    else if (name.includes('Huntsman')) pattern = patterns.marble_fades.huntsman[paintSeed];
    else if (name.includes('Flip')) pattern = patterns.marble_fades.flip[paintSeed];
    else if (name.includes('Bowie')) pattern = patterns.marble_fades.bowie[paintSeed];
    else if (name.includes('Daggers')) pattern = patterns.marble_fades.daggers[paintSeed];
    else if (name.includes('Gut')) pattern = patterns.marble_fades.gut[paintSeed];
    else if (name.includes('Falchion')) pattern = patterns.marble_fades.falchion[paintSeed];
    else return null;

    if (pattern !== null && pattern !== undefined) return { type: 'marble_fade', value: pattern };
    return null;
  }
  if (name.includes(' Fade ')) {
    let percentage = null;

    if (typeof (paintSeed) === 'number') {
      if (name.includes('Karambit')) percentage = FadeCalculator.getFadePercentage('Karambit', paintSeed).percentage;
      else if (name.includes('Butterfly Knife')) percentage = FadeCalculator.getFadePercentage('Butterfly Knife', paintSeed).percentage;
      else if (name.includes('M9 Bayonet')) percentage = FadeCalculator.getFadePercentage('M9 Bayonet', paintSeed).percentage;
      else if (name.includes('Bayonet')) percentage = FadeCalculator.getFadePercentage('Bayonet', paintSeed).percentage;
      else if (name.includes('Talon Knife')) percentage = FadeCalculator.getFadePercentage('Talon Knife', paintSeed).percentage;
      else if (name.includes('Stiletto Knife')) percentage = FadeCalculator.getFadePercentage('Stiletto Knife', paintSeed).percentage;
      else if (name.includes('Navaja Knife')) percentage = FadeCalculator.getFadePercentage('Navaja Knife', paintSeed).percentage;
      else if (name.includes('Ursus Knife')) percentage = FadeCalculator.getFadePercentage('Ursus Knife', paintSeed).percentage;
      else if (name.includes('Huntsman Knife')) percentage = FadeCalculator.getFadePercentage('Huntsman Knife', paintSeed).percentage;
      else if (name.includes('Flip Knife')) percentage = FadeCalculator.getFadePercentage('Flip Knife', paintSeed).percentage;
      else if (name.includes('Bowie Knife')) percentage = FadeCalculator.getFadePercentage('Bowie Knife', paintSeed).percentage;
      else if (name.includes('Shadow Daggers')) percentage = FadeCalculator.getFadePercentage('Shadow Daggers', paintSeed).percentage;
      else if (name.includes('Gut Knife')) percentage = FadeCalculator.getFadePercentage('Gut Knife', paintSeed).percentage;
      else if (name.includes('Falchion Knife')) percentage = FadeCalculator.getFadePercentage('Falchion Knife', paintSeed).percentage;
      else if (name.includes('Classic Knife')) percentage = FadeCalculator.getFadePercentage('Classic Knife', paintSeed).percentage;
      else if (name.includes('Nomad Knife')) percentage = FadeCalculator.getFadePercentage('Nomad Knife', paintSeed).percentage;
      else if (name.includes('Paracord Knife')) percentage = FadeCalculator.getFadePercentage('Paracord Knife', paintSeed).percentage;
      else if (name.includes('Skeleton Knife')) percentage = FadeCalculator.getFadePercentage('Skeleton Knife', paintSeed).percentage;
      else if (name.includes('Survival Knife')) percentage = FadeCalculator.getFadePercentage('Survival Knife', paintSeed).percentage;
      else if (name.includes('Kukri Knife')) percentage = FadeCalculator.getFadePercentage('Kukri Knife', paintSeed).percentage;
      else if (name.includes('Glock-18')) percentage = FadeCalculator.getFadePercentage('Glock-18', paintSeed).percentage;
      else if (name.includes('AWP')) percentage = FadeCalculator.getFadePercentage('AWP', paintSeed).percentage;
      else if (name.includes('MAC-10')) percentage = FadeCalculator.getFadePercentage('MAC-10', paintSeed).percentage;
      else if (name.includes('MP7')) percentage = FadeCalculator.getFadePercentage('MP7', paintSeed).percentage;
      else if (name.includes('R8 Revolver')) percentage = FadeCalculator.getFadePercentage('R8 Revolver', paintSeed).percentage;
      else if (name.includes('UMP-45')) percentage = FadeCalculator.getFadePercentage('UMP-45', paintSeed).percentage;
      else if (name.includes('M4A1-S')) percentage = FadeCalculator.getFadePercentage('M4A1-S', paintSeed).percentage;
      else return null;
    }

    if (percentage !== null && percentage !== undefined) {
      return {
        type: 'fade',
        value: `${percentage.toFixed(2)}% Fade`, // value is uniform with other pattern types
        percentage,
        short: Math.floor(percentage),
      };
    }
    return null;
  }
  // ch blue percentage from
  // https://csbluegem.com/bluepercentraw
  if (name.includes(' Case Hardened')) {
    let pattern = null;

    // exits early if match
    for (const chName of chKnifeNames) {
      const knifeName = chName[0];

      // Check if the name starts with the knife name
      // This will match "M9 Bayonet" before it matches "Bayonet"
      if (name.startsWith(`★ ${knifeName} `)
        || name.startsWith(`★ StatTrak™ ${knifeName} `)) {
        const key = chName[1];
        const playside = bluePercentage[key].playside[paintSeed];
        const backside = bluePercentage[key].backside[paintSeed];
        pattern = `${playside}%/${backside}%`;
        break;
        // some knives have doublesided properties, handle that?
      }
    }
    if (name.includes('AK-47')) pattern = patterns.case_hardeneds.ak[paintSeed];
    else if (name.includes('/Five-SeveN')) pattern = patterns.case_hardeneds.five_seven[paintSeed];

    if (pattern !== null && pattern !== undefined) return { type: 'case_hardened', value: pattern };
    return null; // return {type: 'case_hardened', value: 'Not special or not found'};
  }
  return null;
};

const handleStickerNamesWithCommas = (names) => {
  const namesModified = [];
  let nameWithCommaFound = false;

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];

    if (name === 'Don\'t Worry' && names[i + 1] === 'I\'m Pro') {
      namesModified.push('Don\'t Worry, I\'m Pro');
      nameWithCommaFound = true;
      i += 1;
    } else if (name === 'Hi' && names[i + 1] === 'My Game Is') {
      namesModified.push('Hi, My Game Is');
      nameWithCommaFound = true;
      i += 1;
    } else if (name === 'Run T' && names[i + 1] === 'Run') {
      namesModified.push('Run T, Run');
      nameWithCommaFound = true;
      i += 1;
    } else if (name === 'Run CT' && names[i + 1] === 'Run') {
      namesModified.push('Run CT, Run');
      nameWithCommaFound = true;
      i += 1;
    } else if (names[i + 1] === 'Champion) | Antwerp 2022') {
      namesModified.push(`${name}, Champion) | Antwerp 2022`);
      nameWithCommaFound = true;
      i += 1;
    } else if (names[i + 1] === 'Champion) | Rio 2022') {
      namesModified.push(`${name}, Champion) | Rio 2022`);
      nameWithCommaFound = true;
      i += 1;
    } else if (names[i + 1] === 'Champion) | Copenhagen 2024') {
      namesModified.push(`${name}, Champion) | Copenhagen 2024`);
      nameWithCommaFound = true;
      i += 1;
    } else if (names[i + 1] === 'Champion) | Paris 2023') {
      namesModified.push(`${name}, Champion) | Paris 2023`);
      nameWithCommaFound = true;
      i += 1;
    } else if (names[i + 1] === 'Champion) | Shanghai 2024') {
      namesModified.push(`${name}, Champion) | Shanghai 2024`);
      nameWithCommaFound = true;
      i += 1;
    } else namesModified.push(name);
  }

  if (nameWithCommaFound) return handleStickerNamesWithCommas(namesModified);
  return namesModified;
};

// also charms
const getStickerOrPatchLink = (linkType, name, type) => {
  return linkType === 'search'
    ? `https://steamcommunity.com/market/search?q=${name}&appid=730&category_730_Type[]=tag_CSGO_Tool_${type === 'Charm' ? 'Keychain' : type}`
    : `https://steamcommunity.com/market/listings/730/${type}%20%7C%20${name}`;
};

// true sticker, false patch or charm
const isSticker = (description) => {
  let matchFound = false;

  stickerNames.forEach((name) => {
    if (description.includes(`title="${name}`)) {
      matchFound = true;
    }
  });
  return matchFound;
};

// true charm, false patch or sticker, unused atm
// const isCharm = (description) => {
//   let matchFound = false;

//   charmNames.forEach((name) => {
//     if (description.includes(`title="${name}`)) {
//       matchFound = true;
//     }
//   });
//   return matchFound;
// };

// also pathces for agents
const parseStickerInfo = (
  descriptions,
  linkType,
  prices,
  pricingProvider,
  pricingMode,
  exchangeRate,
  currency,
) => {
  if (descriptions !== undefined && linkType !== undefined) {
    let stickers = [];

    descriptions.forEach((description) => {
      if (description.name === 'sticker_info') {
        const type = isSticker(description.value)
          ? 'Sticker'
          : 'Patch';
        let names = description.value.split('><br>')[1].split(': ')[1].split('</center>')[0].split(', ');

        names = handleStickerNamesWithCommas(names);
        const iconURLs = description.value.split('src="');

        iconURLs.shift();
        iconURLs.forEach((iconURL, index) => {
          iconURLs[index] = iconURL.split('><')[0];
        });

        stickers = stickers.concat(...names.map((name, index) => ({
          name,
          fullName: `${type} | ${name}`,
          price: linkType === 'search' ? null : getPrice(`${type} | ${name}`, null, prices, pricingProvider, pricingMode, exchangeRate, currency),
          iconURL: iconURLs[index],
          marketURL: getStickerOrPatchLink(linkType, name, type),
        })));
      }
    });
    return stickers;
  }
  return null;
};

const parseCharmInfo = (
  descriptions,
  linkType,
  prices,
  pricingProvider,
  pricingMode,
  exchangeRate,
  currency,
) => {
  if (descriptions !== undefined && linkType !== undefined) {
    let charms = [];

    descriptions.forEach((description) => {
      if (description.name === 'keychain_info') {
        let names = description.value.split('><br>')[1]?.split('</center>')[0]?.split(', ') || [];
        names = names.map((name) => name.replace('Charm: ', 'Charm | '));
        names = handleStickerNamesWithCommas(names);
        const iconURLs = description.value.split('src="');

        iconURLs.shift();
        iconURLs.forEach((iconURL, index) => {
          iconURLs[index] = iconURL.split('><')[0];
        });

        charms = charms.concat(...names.map((name, index) => {
          return {
            name: name.split(' | ')[1],
            fullName: name,
            price: linkType === 'search' ? null : getPrice(name, null, prices, pricingProvider, pricingMode, exchangeRate, currency),
            iconURL: iconURLs[index],
            marketURL: getStickerOrPatchLink(linkType, name.split('Charm | ')[1], name.split(' | ')[0]),
          };
        }));
      }
    });
    return charms;
  }
  return null;
};

const goToInternalPage = (targetURL) => {
  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i += 1) {
      const tab = tabs[i];
      if (tab.url === (`chrome-extension://${chrome.runtime.id}${targetURL}`)) { // TODO make this work in firefox or remove the whole thing
        chrome.tabs.reload(tab.id, {}, () => { });
        chrome.tabs.update(tab.id, { active: true });
        return;
      }
    }
    chrome.tabs.create({ url: targetURL });
  });
};

const listenToLocationChange = (callBackFunction) => {
  let oldHref = document.location.href;

  const locationObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        callBackFunction();
      }
    });
  });

  locationObserver.observe(document.querySelector('body'), {
    subtree: true,
    childList: true,
  });
};

const getAssetIDFromInspectLink = (inspectLink) => ((inspectLink !== null && inspectLink !== undefined) ? inspectLink.split('A')[1].split('D')[0] : null);

const getActivePage = (type, getActiveInventory) => {
  let activePage = null;
  if (type === 'inventory') {
    document.querySelectorAll('.inventory_ctn').forEach((inventory) => {
      if (inventory.style.display !== 'none') {
        inventory.querySelectorAll('.inventory_page').forEach((page) => {
          if (page.style.display !== 'none') activePage = page;
        });
      }
    });
  } else if (type === 'offer') {
    const activeInventory = getActiveInventory();
    if (activeInventory !== null) {
      activeInventory.querySelectorAll('.inventory_page')
        .forEach((page) => {
          if (page.style.display !== 'none') activePage = page;
        });
    }
  }
  return activePage;
};

const addPageControlEventListeners = (type, addFloatIndicatorsFunction) => {
  const pageControls = document.getElementById('inventory_pagecontrols');
  if (pageControls !== null) {
    pageControls.addEventListener('click', () => {
      setTimeout(() => {
        if (type === 'inventory') addFloatIndicatorsFunction(getActivePage('inventory'));
        else if (type === 'offer') addFloatIndicatorsFunction('page');
      }, 100);
    });
  } else setTimeout(() => { addPageControlEventListeners(); }, 1000);
};

// gets the details of an item by matching the passed asset id with the ones from the api call
const getItemByAssetID = (items, assetIDToFind) => {
  if (items === undefined || items.length === 0) return null;
  return items.filter((item) => item.assetid === assetIDToFind)[0];
};

const getAssetIDOfElement = (element) => {
  const IDs = getIDsFromElement(element);
  return IDs === null ? null : IDs.assetID;
};

const addDopplerPhase = (item, dopplerInfo, showContrastingLook) => {
  if (dopplerInfo !== null) {
    const dopplerDiv = document.createElement('div');
    dopplerDiv.classList.add('dopplerPhase');

    switch (dopplerInfo.short) {
      case 'SH': dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.sh.element)); break;
      case 'RB': dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.rb.element)); break;
      case 'EM': dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.em.element)); break;
      case 'BP': dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.bp.element)); break;
      default: {
        dopplerDiv.innerText = dopplerInfo.short;
        if (showContrastingLook) dopplerDiv.classList.add('contrastingBackground');
      }
    }

    item.appendChild(dopplerDiv);
  }
};

const addFadePercentage = (item, patternInfo, showContrastingLook) => {
  if (patternInfo !== null && patternInfo !== undefined && patternInfo.type === 'fade') {
    const fadeDiv = document.createElement('div');
    fadeDiv.classList.add('fadePercentageIndicator');
    if (showContrastingLook) fadeDiv.classList.add('contrastingBackground');
    fadeDiv.innerText = patternInfo.short;

    if (item) item.appendChild(fadeDiv);
  }
};

const makeItemColorful = (itemElement, item, colorfulItemsEnabled) => {
  if (colorfulItemsEnabled) {
    if (item.dopplerInfo !== null) itemElement.setAttribute('style', `background-image: url(); background-color: #${item.dopplerInfo.color}`);
    else itemElement.setAttribute('style', `background-image: url(); background-color: ${item.quality.backgroundcolor}; border-color: ${item.quality.backgroundcolor}`);
  }
};

// adds StatTrak, Souvenir and exterior indicators as well as sticker price when applicable
const addSSTandExtIndicators = (
  itemElement, item, showStickerPrice, showExterior, showContrastingLook,
) => {
  const stattrak = item.isStatrack ? 'ST' : '';
  const souvenir = item.isSouvenir ? 'S' : '';
  const exterior = item.exterior !== null ? item.exterior.localized_short : '';
  const addonPrice = item.totalAddonPrice ? item.totalAddonPrice.display : '';
  const showStickersClass = showStickerPrice ? '' : 'hidden';
  const showExteriorsClass = showExterior ? '' : 'hidden';
  const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';

  itemElement.insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(
      `<div class='exteriorSTInfo ${contrastingLookClass}'>
                <span class="souvenirYellow ${showExteriorsClass}">${souvenir}</span>
                <span class="stattrakOrange ${showExteriorsClass}">${stattrak}</span>
                <span class="exteriorIndicator ${showExteriorsClass}">${exterior}</span>
               </div>
               <div class="stickerPrice ${contrastingLookClass} ${showStickersClass}">${addonPrice}</div>`,
    ),
  );
};

const addFloatIndicator = (itemElement, floatInfo, digitsToShow, showContrastingLook) => {
  if (floatInfo !== null && itemElement !== null && floatInfo !== undefined
    && ((floatInfo.floatvalue !== null && floatInfo.floatvalue !== undefined)
    || (floatInfo.template !== null && floatInfo.template !== undefined))
    && itemElement.querySelector('div.floatIndicator') === null) {
    const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';
    const valueString = floatInfo.template !== null && floatInfo.template !== undefined
      ? `#${floatInfo.template}`
      : getFloatAsFormattedString(floatInfo.floatvalue, digitsToShow);
    itemElement.insertAdjacentHTML(
      'beforeend',
      DOMPurify.sanitize(`<div class="floatIndicator ${contrastingLookClass}">${valueString}</div>`),
    );
  }
};

const addPaintSeedIndicator = (itemElement, floatInfo, showContrastingLook) => {
  if (floatInfo !== null && floatInfo !== undefined && itemElement !== null
    && floatInfo.paintseed !== null && floatInfo.paintseed !== undefined
    && itemElement.querySelector('div.paintSeedIndicator') === null) {
    const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';

    itemElement.insertAdjacentHTML(
      'beforeend',
      DOMPurify.sanitize(`<div class="paintSeedIndicator ${contrastingLookClass}">${floatInfo.paintseed}</div>`),
    );
  }
};

const addFloatRankIndicator = (itemElement, floatInfo, showContrastingLook) => {
  if (floatInfo !== null && floatInfo !== undefined && itemElement !== null
    && ((floatInfo.low_rank !== null && floatInfo.low_rank !== undefined)
      || (floatInfo.high_rank !== null && floatInfo.high_rank !== undefined))
    && itemElement.querySelector('div.floatRankIndicator') === null) {
    let rankToShow = floatInfo.low_rank;

    if ((!floatInfo.low_rank && floatInfo.high_rank)
      || (floatInfo.low_rank && floatInfo.high_rank && floatInfo.wear_name === 'Battle-Scarred')) {
      rankToShow = floatInfo.high_rank;
    }

    const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';

    itemElement.insertAdjacentHTML(
      'beforeend',
      DOMPurify.sanitize(`<div class="floatRankIndicator ${contrastingLookClass}">#${rankToShow}</div>`),
    );
  }
};

const addPriceIndicator = (
  itemElement, priceInfo, currency, showContrastingLook, pricePercentage = 100,
) => {
  if (priceInfo !== undefined && priceInfo !== 'null' && priceInfo !== null) {
    const disPlayPrice = pricePercentage === 100
      ? priceInfo.display
      : currencies[currency].sign + (priceInfo.price * (pricePercentage / 100)).toFixed(2);
    const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';
    itemElement.insertAdjacentHTML(
      'beforeend', DOMPurify.sanitize(`<div class='priceIndicator ${contrastingLookClass}'>${disPlayPrice}</div>`),
    );
  }
};

const getDataFilledFloatTechnical = (floatInfo) => {
  const lowFloatRankLine = (floatInfo.low_rank !== undefined && floatInfo.low_rank !== null) ? `Low Rank: ${floatInfo.low_rank}<br>` : '';
  const highFloatRankLine = (floatInfo.high_rank !== undefined && floatInfo.high_rank !== null) ? `High Rank: ${floatInfo.high_rank}<br>` : '';
  return `
            Technical:<br>
            Float Value: ${toPlainString(floatInfo.floatvalue)}<br>
            Paint Index: ${floatInfo.paintindex}<br>
            Paint Seed: ${floatInfo.paintseed}<br>
            Origin: ${floatInfo.origin_name}<br>
            Best Possible Float: ${floatInfo.min}<br>
            Worst Possible Float: ${floatInfo.max}<br>
            ${lowFloatRankLine}
            ${highFloatRankLine}
            <br>
            Float info from <a href="https://pricempire.com/" target="_blank">pricempire.com</a>`;
};

const souvenirExists = (itemInfo) => {
  const collectionsWithSouvenirsToCheck = new RegExp(collectionsWithSouvenirs.join('|'), 'i');
  return collectionsWithSouvenirsToCheck.test(itemInfo);
};

const getFloatBarSkeleton = (type) => {
  const typeClass = type === 'market' ? 'Market' : '';
  return `<div class="floatBar${typeClass}">
    <div class="floatToolTip">
        <div>Float: <span class="floatDropTarget">Waiting for pricempire.com</span></div>
        <svg class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
     <div class="progress">
        <div class="progress-bar floatBarFN" title="${exteriors.factory_new.localized_name}"></div>
        <div class="progress-bar floatBarMW" title="${exteriors.minimal_wear.localized_name}"></div>
        <div class="progress-bar floatBarFT" title="${exteriors.field_tested.localized_name}"></div>
        <div class="progress-bar floatBarWW" title="${exteriors.well_worn.localized_name}"></div>
        <div class="progress-bar floatBarBS" title="${exteriors.battle_scarred.localized_name}"></div>
     </div>
     <div class="showTechnical clickable" title="Show Float Technical Information">Show Technical</div>
     <div class="floatTechnical doHide"></div>
    </div>`;
};

const isSIHActive = () => {
  const SIHSwitch = document.querySelector('.sih_status_container');
  const SIHSwitchOffers = document.querySelector('.sih_panel_mode');
  const SIHSwitchPanel = document.getElementById('switchPanel');
  return (SIHSwitch !== null || SIHSwitchPanel !== null || SIHSwitchOffers !== null);
};

let searchListenerTimeout = null;
const addSearchListener = (type, addFloatIndicatorsFunction) => {
  let searchElement;
  if (type === 'inventory') searchElement = document.getElementById('filter_control');
  else if (type === 'offer') searchElement = document.querySelector('.filter_search_box');

  if (searchElement !== null) {
    searchElement.addEventListener('input', () => {
      if (searchListenerTimeout !== null) clearTimeout(searchListenerTimeout);
      searchListenerTimeout = setTimeout(() => {
        if (type === 'inventory') addFloatIndicatorsFunction(getActivePage('inventory'));
        else if (type === 'offer') addFloatIndicatorsFunction('page');
        searchListenerTimeout = null;
      }, 1000);
    });
  } else {
    setTimeout(() => {
      addSearchListener(type);
    }, 1000);
  }
};

const getSessionID = () => {
  const getSessionIDScript = 'document.querySelector(\'body\').setAttribute(\'sessionid\', g_sessionID);';
  return injectScript(getSessionIDScript, true, 'getSessionID', 'sessionid');
};

// updates the SteamID of the extension's user in storage
const updateLoggedInUserInfo = () => {
  const steamID = getUserSteamID();
  if (steamID !== 'false' && steamID !== false && steamID !== null) {
    chrome.storage.local.set({
      steamIDOfUser: steamID,
      steamSessionID: getSessionID(),
    }, () => { });
  }
};

// updates the nick name (persona name) of the extension's user in storage
const updateLoggedInUserName = () => {
  const pullDownElement = document.getElementById('account_pulldown');

  if (pullDownElement !== null) { // if it's  null then the user is not logged in
    const nickName = pullDownElement.innerText;

    chrome.storage.local.set({
      nickNameOfUser: nickName,
    }, () => { });
  }
};

const jumpToAnchor = (anchor) => {
  if (anchor !== '') {
    window.location = `${window.location.origin}${window.location.pathname}${anchor}`;
  }
};

const removeOfferFromActiveOffers = (offerID) => {
  chrome.storage.local.get(['activeOffers'], ({ activeOffers }) => {
    const itemsNotInThisOffer = activeOffers.items.filter((item) => {
      return item.inOffer !== offerID;
    });

    const sentNotThisOffer = activeOffers.sent.filter((offer) => {
      return offer.tradeofferid !== offerID;
    });

    const receivedNotThisOffer = activeOffers.received.filter((offer) => {
      return offer.tradeofferid !== offerID;
    });

    chrome.storage.local.set({
      activeOffers: {
        lastFullUpdate: activeOffers.lastFullUpdate,
        items: itemsNotInThisOffer,
        sent: sentNotThisOffer,
        received: receivedNotThisOffer,
        descriptions: activeOffers.descriptions,
      },
    }, () => { });
  });
};

const addUpdatedRibbon = () => {
  chrome.storage.local.get(['showUpdatedRibbon'], ({ showUpdatedRibbon }) => {
    if (showUpdatedRibbon) {
      document.querySelector('body').insertAdjacentHTML(
        'afterbegin',
        DOMPurify.sanitize(
          `<div id="extensionUpdatedRibbon">
                       CS2 Trader Extension was updated to ${chrome.runtime.getManifest().version}. Check out the 
                      <a href="https://csgotrader.app/changelog/" target="_blank" title="Open CS2Trader Changelog">
                          Changelog
                      </a>
                      for details
                      <span class="clickable" id="closeUpdatedRibbon" title="Close ribbon until the next update">Close</span>
                    </div>`,
          { ADD_ATTR: ['target'] },
        ),
      );
      document.getElementById('closeUpdatedRibbon').addEventListener('click', () => {
        chrome.storage.local.set({ showUpdatedRibbon: false }, () => {
          document.getElementById('extensionUpdatedRibbon').classList.add('doHide');
        });
      });
    }
  });
};

const copyToClipboard = (text) => {
  // this is a workaround to only being able to copy text
  // to the clipboard that is selected in a textbox
  document.querySelector('body').insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(`
        <textarea id="text_area_to_copy_to_clipboard" class="hidden-copy-textarea" readonly="">${text}</textarea>`),
  );

  const textAreaElement = document.getElementById('text_area_to_copy_to_clipboard');
  textAreaElement.select();
  document.execCommand('copy');
  textAreaElement.remove();
};

const changePageTitle = (type, text) => {
  chrome.storage.local.get(['usefulTitles'], ({ usefulTitles }) => {
    if (usefulTitles) {
      let title = document.title.split(':: ')[1];
      switch (type) {
        case 'own_profile': title = 'My profile'; break;
        case 'profile': title = `${title}'s profile`; break;
        case 'market_listing': title = `${text} - Market Listings`; break;
        case 'trade_offer': title = `${text} - Trade Offer`; break;
        case 'own_inventory': title = 'My Inventory'; break;
        case 'inventory': title = `${title}'s inventory`; break;
        case 'trade_offers': title = text; break;
        default: break;
      }
      document.title = title;
    }
  });
};

const csgoFloatExtPresent = () => {
  const csgoFloatCheckScript = `
    document.querySelector('body').setAttribute('csgoFloat', window.CSGOFLOAT_EXTENSION_ID);
  `;
  const fromPage = injectScript(csgoFloatCheckScript, true, 'csgoFloatCheckScript', 'csgoFloat');
  return fromPage !== 'undefined';
};

const removeLinkFilterFromLinks = () => {
  chrome.storage.local.get('linkFilterOff', ({ linkFilterOff }) => {
    if (linkFilterOff) {
      document.querySelectorAll('a').forEach((anchor) => {
        const oldHref = anchor.getAttribute('href');
        if (oldHref !== null && oldHref.includes('https://steamcommunity.com/linkfilter/?url=')) {
          anchor.setAttribute(
            'href',
            oldHref.split('https://steamcommunity.com/linkfilter/?url=')[1],
          );
        }
      });
    }
  });
};

// chrome only allows notification icons locally
// or from trusted (by manifest) urls
// this is a workaround to that because Steam's CDN is not in the manifest
const getRemoteImageAsObjectURL = (imageURL) => new Promise((resolve, reject) => {
  fetch(new Request(imageURL)).then((response) => {
    if (!response.ok) {
      reject(response);
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    } else return response.blob();
  }).then((body) => {
    resolve(URL.createObjectURL(body));
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const getFloatDBLink = (item) => {
  if (item.floatInfo) {
    const category = item.name.includes('StatTrak™')
      ? 2
      : item.name.includes('Souvenir')
        ? 3
        : 1;
    return `https://csfloat.com/db?name=${item.name}&defIndex=${item.floatInfo.defindex}&paintIndex=${item.floatInfo.paintindex}&paintSeed=${item.floatInfo.paintseed}&category=${category}&min=${item.floatInfo.floatvalue - 0.00000000000000001}&max=${item.floatInfo.floatvalue + 0.00000000000000001}`;
  } return 'https://csfloat.com/db';
};

const getBuffLink = (marketHashName) => {
  const buffId = buffIds[marketHashName];
  if (buffId) return `https://buff.163.com/goods/${buffId}`;
  return `https://api.pricempire.com/v1/redirectBuff/${marketHashName}`;
};

const getPricempireLink = (itemType, itemName, dopplerType, condition) => {
  try {
    switch (itemType) {
      case 'gloves':
        return `cs2-items/glove/${itemName
          .replace('★ ', '')
          .trim()
          .replace(/\s*\|\s*/g, '-')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
        }/${condition
          .replace(' ', '-')
          .toLowerCase()}`;
      case 'sticker':
        // Last 4 characters of string are a number -> tournament year -> use tournament-sticker
        if (/\d{4}/.test(itemName)) {
          return `cs2-items/tournament-sticker/sticker-${itemName
            .replace('Sticker | ', '')
            .replace(/\s*\(\w+\)\s*\|\s*/g, '-')
            .replace(/\s*\|\s*/g, '-')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') // Add this line to replace multiple hyphens with single hyphen
          }/${(itemName.match(/\(\w+\)/) || [''])[0].replace(/[()]/g, '').toLowerCase()}`;
        }
        // Last 4 characters of string are not numbers -> not tournament year -> use sticker
        return `cs2-items/sticker/sticker-${itemName
          .replace('Sticker | ', '')
          .replace(/\s*\(\w+\)\s*/g, '-')
          .replace(/\s*\|\s*/g, '-')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+$/, '')
        }${(itemName.match(/\(\w+\)/) ? `/${itemName.match(/\(\w+\)/)[0].replace(/[()]/g, '').toLowerCase()}` : '')
        }`;
      case 'container':
        // this checks if there are 4 digits again -> year -> tournament
        if (/\d{4}/.test(itemName)) {
          // For autograph capsules I would check if 'autograph' is in itemName here and handle that differently
          const type = itemName.match(/(\b\w+\b)\s*\(/);
          return `cs2-items/tournament-team-sticker-capsule/${itemName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/(\d{4})-/, '$1/')
            // no (holo/foil) in itemName still needs to be handled
            .replace(/\(([^/]+)\/([^/]+)\)/, '$1$2')}`
            + `-${type[1].toLowerCase()}`;
        }
        return `cs2-items/container/${itemName
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .toLowerCase()}`;
      case 'custom_player':
        return `cs2-items/agent/${itemName.toLowerCase()
          .replace(/\s*\|\s*/g, '-')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
        }`;
      case 'music_kit':
        return `cs2-items/music-kit/${itemName
          .replace('StatTrak™ ', '')
          .replace(/\s*\|\s*/g, '-')
          .replace(/\s+/g, '-')
          .toLowerCase()
          .replace(/[^\w-]+/g, '')
        }${itemName.includes('StatTrak') ? '/stattrak' : ''}`;
      case 'graffiti':
        return `cs2-items/graffiti/${itemName
          .replace(/\s*\|\s*/g, '-')
          .toLowerCase()
          .replace(/ \(([^)]+)\)/g, '/$1')
          .replace(/\s+/g, '-')}`;
      case 'charm':
        return `cs2-items/charm/${itemName
          .replace(/\s*\|\s*/g, '-')
          .toLowerCase()
          .replace(/ \(([^)]+)\)/g, '/$1')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')}`;
      case 'collectible':
        if (!(itemName.includes('Service Medal') || itemName.includes('Coin'))) {
          return `cs2-items/pin/${itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`;
        }
        // Should we return something else for service medals and coins?
        return '';
      default:
        if (itemName.includes('★') && !itemName.includes('|')) {
          return `cs2-items/skin/${itemName
            .replace('StatTrak™ ', '')
            .replace('★ ', '')
            .replace(/\s+/g, '-')
            .toLowerCase()
          }${itemName.includes('StatTrak') ? '/stattrak' : ''}`;
        }
        if (itemName.includes('Souvenir')) {
          return `cs2-items/skin/${itemName
            .replace('Souvenir', '')
            .trim()
            .replace(/\s*\|\s*/g, '-')
            .toLowerCase()
            .replace(/\s+/g, '-')
          }/souvenir-${condition
            .replace(' ', '-')
            .toLowerCase()}`;
        }
        return `cs2-items/skin/${itemName
          .replace('StatTrak™', '')
          .replace('★ ', '')
          .replace('弐', '2')
          .trim()
          .replace(/\s*\|\s*/g, '-')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace('--', '-')
          .replace(/^-+|-+$/g, '')
        }${dopplerType.toLowerCase().replace(' ', '-')
        }${itemName.includes('StatTrak') ? '/stattrak-' : '/'
        }${condition
          .replace(' ', '-')
          .toLowerCase()}`;
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
  return '';
};

// runs in content scripts when steam pages are loaded
const refreshSteamAccessToken = () => {
  chrome.storage.local.get(['steamAcessToken', 'steamAcessTokenValid'], ({ steamAcessToken, steamAcessTokenValid }) => {
    const token = document.getElementById('application_config')
      ?.getAttribute('data-loyalty_webapi_token')
      ?.replace('"', '')
      .replace('"', '');

    if (!steamAcessTokenValid || (steamAcessTokenValid && steamAcessToken !== token)) {
      // validate the token
      chrome.runtime.sendMessage({ accessTokenToValidate: token }, (response) => {
        if (response.valid) {
          chrome.storage.local.set({ steamAcessToken: token, steamAcessTokenValid: true }, () => {});
        } else console.log('Steam access token could not be validated');
      });
    }
  });
};

const loadFloatData = (items, ownerID, isOwn, type) => new Promise((resolve, reject) => {
  const trimmedItemProperties = [];

  items.forEach((item) => {
    if (item.inspectLink !== undefined
      && item.inspectLink !== null) {
      trimmedItemProperties.push({
        assetid: item.assetid,
        classid: item.classid,
        instanceid: item.instanceid,
        inspectLink: item.inspectLink,
        name: item.name,
        market_name: item.market_hash_name,
      });
    }
  });

  const getFloatsRequest = new Request('https://api.csgotrader.app/getFloats', {
    method: 'POST',
    body: JSON.stringify({
      items: trimmedItemProperties,
      isOwn,
      ownerID,
      type,
    }),
  });

  fetch(getFloatsRequest)
    .then((response) => {
      if (!response.ok) {
        const errorMessage = `Error code: ${response.status} Status: ${response.statusText}`;
        console.log(errorMessage);
        reject(errorMessage);
      } else return response.json();
    }).then((body) => {
      if (body.status) {
        resolve(body.floatData);
      } else {
        console.log(body);
        reject(body);
      }
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
});

//  unused atm
// const generateRandomString = (length) => {
//   let text = '';
//   const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//
//   for (let i = 0; i < length; i++) {
//     text += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
//   }
//
//   return text;
// };

export {
  logExtensionPresence, setAPIKeyFirstTime, arrayFromArrayOrNotArray,
  getExteriorFromTags, getDopplerInfo, getQuality, parseStickerInfo,
  handleStickerNamesWithCommas, removeFromArray, getType, changePageTitle,
  getPattern, goToInternalPage, jumpToAnchor, copyToClipboard,
  validateSteamAPIKey, getAssetIDFromInspectLink, updateLoggedInUserInfo,
  listenToLocationChange, addPageControlEventListeners, getItemByAssetID,
  getAssetIDOfElement, addDopplerPhase, getActivePage, makeItemColorful,
  addSSTandExtIndicators, addFloatIndicator, addPriceIndicator, updateLoggedInUserName,
  getDataFilledFloatTechnical, souvenirExists, removeLinkFilterFromLinks,
  getFloatBarSkeleton, getInspectLink, csgoFloatExtPresent, setAccessTokenFirstTime,
  isSIHActive, addSearchListener, getSessionID, validateSteamAccessToken,
  getFloatAsFormattedString, getNameTag, parseCharmInfo,
  removeOfferFromActiveOffers, addUpdatedRibbon, getRemoteImageAsObjectURL,
  addFadePercentage, addPaintSeedIndicator, addFloatRankIndicator,
  getAppropriateFetchFunc, getFloatDBLink, getBuffLink, refreshSteamAccessToken,
  getPricempireLink, loadFloatData,
};
