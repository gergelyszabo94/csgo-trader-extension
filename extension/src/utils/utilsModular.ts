import DOMPurify from 'dompurify';
import { DopplerMapping } from 'types';

import { LinkFilterOff, SteamIDOfUser } from 'types/storage';

import { injectScript, injectStyle } from 'utils/injection';
import { getIDsFromElement } from 'utils/itemsToElementsToItems';
import { getPrice } from 'utils/pricing';
import collectionsWithSouvenirs from 'utils/static/collectionsWithSouvenirs';
import { dopplerPhases, iconToPhaseMapping } from 'utils/static/dopplerPhases';
import exteriors from 'utils/static/exteriors';
import itemTypes from 'utils/static/itemTypes';
import patterns from 'utils/static/patterns';
import qualities from 'utils/static/qualities';
import rarities from 'utils/static/rarities';
import { getUserSteamID } from 'utils/steamID';

// "Sticker" in different languages
// english, simplified chinese, traditional chinese,
// japanese, korean, bulgarian, thai, czech, danish,
// german, spanish, latin spanish, greek, italian,
// hungarian, norwegian, polish, portuguese, brazil,
// romanian, russian, finnish, swedish, turkish,
// vietnamese, ukrainian
const stickerNames = [
    'Sticker',
    '印花',
    '貼紙',
    'ステッカー',
    '스티커',
    'Αυτοκόλλητο',
    'สติกเกอร์',
    'Samolepka',
    'Klistermærke',
    'Aufkleber',
    'Pegatina',
    'Calcomanía',
    'Αυτοκόλλητο',
    'Adesivo',
    'Matrica',
    'Klistremerke',
    'Naklejka',
    'Autocolante',
    'Adesivo',
    'Abțibild',
    'Наклейка',
    'Tarra',
    'Klistermärke',
    'Çıkartma',
    'Hình dán',
    'Наліпка',
];

export const toFixedNoRounding = (number, n) => {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g');
    const a = number.toString().match(reg)[0];
    const dot = a.indexOf('.');
    if (dot === -1) return `${a}.${'0'.repeat(n)}`; // integer, insert decimal dot and pad up zeros
    const b = n - (a.length - dot) + 1;
    return b > 0 ? a + '0'.repeat(b) : a;
};

export const logExtensionPresence = () => {
    const { version } = chrome.runtime.getManifest();
    console.log(
        `CSGO Trader - Steam Trading Enhancer ${version} is running on this page. Changelog at: https://csgotrader.app/changelog/`,
    );
    console.log('If you see any errors that seem related to the extension please email support@csgotrader.app.');
    console.log('"DevTools failed to parse SourceMap" is not an error, you can disregard it.');
};

export const validateSteamAPIKey = (apiKey) =>
    new Promise((resolve, reject) => {
        const getRequest = new Request(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561198036030455`,
        );

        fetch(getRequest)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject(response.status);
                } else return response.json();
            })
            .then((body) => {
                try {
                    if (body.response.players[0].steamid === '76561198036030455') resolve(true);
                    else resolve(false);
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });

export const scrapeSteamAPIkey = () => {
    const getRequest = new Request('https://steamcommunity.com/dev/apikey');

    fetch(getRequest)
        .then((response) => {
            if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            else return response.text();
        })
        .then((body) => {
            const html = document.createElement('html');
            html.innerHTML = DOMPurify.sanitize(body);
            let apiKey = null;

            try {
                apiKey = html.querySelector('#bodyContents_ex').querySelector('p').innerText.split(': ')[1];
            } catch (e) {
                console.log(e);
                console.log(body);
            }

            validateSteamAPIKey(apiKey).then(
                (apiKeyValid) => {
                    if (apiKeyValid) {
                        console.log('api key valid');
                        chrome.storage.local.set({ steamAPIKey: apiKey, apiKeyValid: true }, () => {});
                    }
                },
                (error) => {
                    console.log(error);
                },
            );
        })
        .catch((err) => {
            console.log(err);
        });
};

export const arrayFromArrayOrNotArray = (arrayOrNotArray: any | any[]): any[] => {
    if (!Array.isArray(arrayOrNotArray)) return [arrayOrNotArray];
    return arrayOrNotArray;
};

export const removeFromArray = (array, arrayIndex) => {
    const newArray = [];

    array.forEach((element, index) => {
        if (index !== arrayIndex) newArray.push(element);
    });

    return newArray;
};

export const getExteriorFromTags = (tags) => {
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

export const getNameTag = (item) => {
    try {
        if (item.fraudwarnings !== undefined || item.fraudwarnings[0] !== undefined) {
            return item.fraudwarnings[0].split("Name Tag: ''")[1].split("''")[0];
        }
        // eslint-disable-next-line no-empty
    } catch (error) {
        return null;
    }
};

export const getInspectLink = (item, owner?: string, assetID?: string) => {
    try {
        if (item.actions !== undefined && item.actions[0] !== undefined) {
            const beggining = item.actions[0].link.split('%20S')[0];
            const end = item.actions[0].link.split('%assetid%')[1];
            return owner !== undefined
                ? `${beggining}%20S${owner}A${assetID}${end}`
                : `${beggining}%20S${item.owner}A${item.assetid}${end}`;
        }
        // eslint-disable-next-line no-empty
    } catch (error) {
        return null;
    }
};

export const getDopplerInfo = (icon: string): DopplerMapping | null => {
    return iconToPhaseMapping[icon] !== undefined ? iconToPhaseMapping[icon] : dopplerPhases.unk;
};

export const getQuality = (tags) => {
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

export const getType = (tags) => {
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

export const getPattern = (name, paintSeed) => {
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
        if (name.includes('Karambit')) percentage = patterns.fades.karambit[paintSeed];
        else if (name.includes('Butterfly')) percentage = patterns.fades.butterfly[paintSeed];
        else if (name.includes('M9 Bayonet')) percentage = patterns.fades.m9[paintSeed];
        else if (name.includes('Bayonet')) percentage = patterns.fades.bayonet[paintSeed];
        else if (name.includes('Talon')) percentage = patterns.fades.talon[paintSeed];
        else if (name.includes('Stiletto')) percentage = patterns.fades.stiletto[paintSeed];
        else if (name.includes('Navaja')) percentage = patterns.fades.navaja[paintSeed];
        else if (name.includes('Ursus')) percentage = patterns.fades.ursus[paintSeed];
        else if (name.includes('Huntsman')) percentage = patterns.fades.huntsman[paintSeed];
        else if (name.includes('Flip')) percentage = patterns.fades.flip[paintSeed];
        else if (name.includes('Bowie')) percentage = patterns.fades.bowie[paintSeed];
        else if (name.includes('Daggers')) percentage = patterns.fades.daggers[paintSeed];
        else if (name.includes('Gut')) percentage = patterns.fades.gut[paintSeed];
        else if (name.includes('Falchion')) percentage = patterns.fades.falchion[paintSeed];
        else if (name.includes('Glock')) percentage = patterns.fades.glock[paintSeed];
        else return null;

        if (percentage !== null && percentage !== undefined) return { type: 'fade', value: `${percentage}% Fade` };
        return null;
    }
    if (name.includes(' Case Hardened')) {
        let pattern = null;
        if (name.includes('AK-47')) pattern = patterns.case_hardeneds.ak[paintSeed];
        else if (name.includes('Butterfly')) pattern = patterns.case_hardeneds.butterfly[paintSeed];
        else if (name.includes('M9 Bayonet')) pattern = patterns.case_hardeneds.m9[paintSeed];
        else if (name.includes('Bayonet')) pattern = patterns.case_hardeneds.bayonet[paintSeed];
        else if (name.includes('Talon')) pattern = patterns.case_hardeneds.talon[paintSeed];
        else if (name.includes('Stiletto')) pattern = patterns.case_hardeneds.stiletto[paintSeed];
        else if (name.includes('Navaja')) pattern = patterns.case_hardeneds.navaja[paintSeed];
        else if (name.includes('Ursus')) pattern = patterns.case_hardeneds.ursus[paintSeed];
        else if (name.includes('Huntsman')) pattern = patterns.case_hardeneds.huntsman[paintSeed];
        else if (name.includes('Flip')) pattern = patterns.case_hardeneds.flip[paintSeed];
        else if (name.includes('Bowie')) pattern = patterns.case_hardeneds.bowie[paintSeed];
        else if (name.includes('Daggers')) pattern = patterns.case_hardeneds.daggers[paintSeed];
        else if (name.includes('Gut')) pattern = patterns.case_hardeneds.gut[paintSeed];
        else if (name.includes('Falchion')) pattern = patterns.case_hardeneds.falchion[paintSeed];
        else if (name.includes('Karambit')) pattern = patterns.case_hardeneds.karambit[paintSeed];
        else if (name.includes('/Five-SeveN')) pattern = patterns.case_hardeneds.five_seven[paintSeed];
        else return null;

        if (pattern !== null && pattern !== undefined) return { type: 'case_hardened', value: pattern };
        return null; // return {type: 'case_hardened', value: 'Not special or not found'};
    }
    return null;
};

export const handleStickerNamesWithCommas = (names) => {
    const namesModified = [];
    let nameWithCommaFound = false;

    for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        if (name === "Don't Worry" && names[i + 1] === "I'm Pro") {
            namesModified.push("Don't Worry, I'm Pro");
            nameWithCommaFound = true;
            i += 1;
        } else namesModified.push(name);
    }

    if (nameWithCommaFound) return handleStickerNamesWithCommas(namesModified);
    return namesModified;
};

const getStickerOrPatchLink = (linkType, name, type) => {
    return linkType === 'search'
        ? `https://steamcommunity.com/market/search?q=${name}&appid=730&category_730_Type[]=tag_CSGO_Tool_${type}`
        : `https://steamcommunity.com/market/listings/730/${type}%20%7C%20${name}`;
};

// true sticker, false patch
export const isSticker = (description) => {
    let matchFound = false;
    stickerNames.forEach((name) => {
        if (description.includes(`title="${name}"`)) {
            matchFound = true;
        }
    });
    return matchFound;
};

export const parseStickerInfo = (
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
            if (description.value.includes('sticker_info')) {
                const type = isSticker(description.value) ? 'Sticker' : 'Patch';
                let names = description.value.split('><br>')[1].split(': ')[1].split('</center>')[0].split(', ');

                names = handleStickerNamesWithCommas(names);
                const iconURLs = description.value.split('src="');

                iconURLs.shift();
                iconURLs.forEach((iconURL, index) => {
                    iconURLs[index] = iconURL.split('><')[0];
                });

                stickers = names.map((name, index) => ({
                    name,
                    price:
                        linkType === 'search'
                            ? null
                            : getPrice(
                                  `${type} | ${name}`,
                                  null,
                                  prices,
                                  pricingProvider,
                                  pricingMode,
                                  exchangeRate,
                                  currency,
                              ),
                    iconURL: iconURLs[index],
                    marketURL: getStickerOrPatchLink(linkType, name, type),
                }));
            }
        });
        return stickers;
    }
    return null;
};

export const goToInternalPage = (targetURL: string) => {
    chrome.tabs.query({}, (tabs) => {
        for (let i = 0; i < tabs.length; i += 1) {
            const tab = tabs[i];
            if (tab.url === `chrome-extension://${chrome.runtime.id}${targetURL}`) {
                // TODO make this work in firefox or remove the whole thing
                chrome.tabs.reload(tab.id, {}, () => {});
                chrome.tabs.update(tab.id, { active: true });
                return;
            }
        }
        chrome.tabs.create({ url: targetURL });
    });
};

export const uuidv4 = () => {
    // eslint-disable-next-line no-bitwise
    return ((1e7).toString() + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
    );
};

export const listenToLocationChange = (callback: () => void) => {
    let oldHref = document.location.href;

    const locationObserver = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            if (oldHref !== document.location.href) {
                oldHref = document.location.href;
                callback();
            }
        });
    });

    locationObserver.observe(document.querySelector('body'), {
        subtree: true,
        childList: true,
    });
};

export const getAssetIDFromInspectLink = (inspectLink) =>
    inspectLink !== null && inspectLink !== undefined ? inspectLink.split('A')[1].split('D')[0] : null;

export const getActivePage = (type?: string, getActiveInventory?: () => any) => {
    let activePage = null;
    if (type === 'inventory') {
        document.querySelectorAll<HTMLElement>('.inventory_ctn').forEach((inventory) => {
            if (inventory.style.display !== 'none') {
                inventory.querySelectorAll<HTMLElement>('.inventory_page').forEach((page) => {
                    if (page.style.display !== 'none') activePage = page;
                });
            }
        });
    } else if (type === 'offer') {
        const activeInventory = getActiveInventory();
        if (activeInventory !== null) {
            activeInventory.querySelectorAll('.inventory_page').forEach((page) => {
                if (page.style.display !== 'none') activePage = page;
            });
        }
    }
    return activePage;
};

export const addPageControlEventListeners = (
    type?: string,
    addFloatIndicatorsFunction?: (a?: Element | string) => void,
) => {
    const pageControls = document.getElementById('inventory_pagecontrols');
    if (pageControls !== null) {
        pageControls.addEventListener('click', () => {
            setTimeout(() => {
                if (type === 'inventory') addFloatIndicatorsFunction(getActivePage('inventory'));
                else if (type === 'offer') addFloatIndicatorsFunction('page');
            }, 100);
        });
    } else
        setTimeout(() => {
            addPageControlEventListeners();
        }, 1000);
};

// gets the details of an item by matching the passed asset id with the ones from the api call
export const getItemByAssetID = (items, assetIDToFind) => {
    if (items === undefined || items.length === 0) return null;
    return items.filter((item) => item.assetid === assetIDToFind)[0];
};

export const getAssetIDOfElement = (element) => {
    const IDs = getIDsFromElement(element);
    return IDs === null ? null : IDs.assetID;
};

export const addDopplerPhase = (item, dopplerInfo) => {
    if (dopplerInfo !== null) {
        const dopplerDiv = document.createElement('div');
        dopplerDiv.classList.add('dopplerPhase');

        switch (dopplerInfo.short) {
            case 'SH':
                dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.sh.element));
                break;
            case 'RB':
                dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.rb.element));
                break;
            case 'EM':
                dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.em.element));
                break;
            case 'BP':
                dopplerDiv.insertAdjacentHTML('beforeend', DOMPurify.sanitize(dopplerPhases.bp.element));
                break;
            default:
                dopplerDiv.innerText = dopplerInfo.short;
        }

        item.appendChild(dopplerDiv);
    }
};

export const makeItemColorful = (itemElement, item, colorfulItemsEnabled) => {
    if (colorfulItemsEnabled) {
        if (item.dopplerInfo !== null)
            itemElement.setAttribute('style', `background-image: url(); background-color: #${item.dopplerInfo.color}`);
        else
            itemElement.setAttribute(
                'style',
                `background-image: url(); background-color: ${item.quality.backgroundcolor}; border-color: ${item.quality.backgroundcolor}`,
            );
    }
};

// adds StatTrak, Souvenir and exterior indicators as well as sticker price when applicable
export const addSSTandExtIndicators = (itemElement, item, showStickerPrice, showExterior) => {
    const stattrak = item.isStatrack ? 'ST' : '';
    const souvenir = item.isSouvenir ? 'S' : '';
    const exterior = item.exterior !== null ? item.exterior.localized_short : '';
    const stickerPrice = item.stickerPrice !== null ? item.stickerPrice.display : '';
    const showStickersClass = showStickerPrice ? '' : 'hidden';
    const showExteriorsClass = showExterior ? '' : 'hidden';

    itemElement.insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(
            `<div class='exteriorSTInfo'>
              <span class="souvenirYellow ${showExteriorsClass}">${souvenir}</span>
              <span class="stattrakOrange ${showExteriorsClass}">${stattrak}</span>
              <span class="exteriorIndicator ${showExteriorsClass}">${exterior}</span>
             </div>
             <div class="stickerPrice ${showStickersClass}">${stickerPrice}</div>`,
        ),
    );
};

export const addFloatIndicator = (itemElement, floatInfo) => {
    if (
        floatInfo !== null &&
        itemElement !== null &&
        floatInfo !== undefined &&
        itemElement.querySelector('div.floatIndicator') === null
    ) {
        itemElement.insertAdjacentHTML(
            'beforeend',
            DOMPurify.sanitize(`<div class="floatIndicator">${toFixedNoRounding(floatInfo.floatvalue, 4)}</div>`),
        );
    }
};

export const addPriceIndicator = (itemElement, priceInfo) => {
    if (priceInfo !== undefined && priceInfo !== 'null' && priceInfo !== null) {
        itemElement.insertAdjacentHTML(
            'beforeend',
            DOMPurify.sanitize(`<div class='priceIndicator'>${priceInfo.display}</div>`),
        );
    }
};

export const getDataFilledFloatTechnical = (floatInfo) => {
    const floatRankLine =
        floatInfo.low_rank !== undefined && floatInfo.low_rank !== null ? `Low Rank: ${floatInfo.low_rank}<br>` : '';
    return `
            Technical:<br>
            Float Value: ${floatInfo.floatvalue}<br>
            Paint Index: ${floatInfo.paintindex}<br>
            Paint Seed: ${floatInfo.paintseed}<br>
            Origin: ${floatInfo.origin_name}<br>
            Best Possible Float: ${floatInfo.min}<br>
            Worst Possible Float: ${floatInfo.max}<br>
            ${floatRankLine}
            <br>
            Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>`;
};

export const souvenirExists = (itemInfo) => {
    const collectionsWithSouvenirsToCheck = new RegExp(collectionsWithSouvenirs.join('|'), 'i');
    return collectionsWithSouvenirsToCheck.test(itemInfo);
};

export const getFloatBarSkeleton = (type) => {
    const typeClass = type === 'market' ? 'Market' : '';
    return `<div class="floatBar${typeClass}">
    <div class="floatToolTip">
        <div>Float: <span class="floatDropTarget">Waiting for csgofloat.com</span></div>
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
     <div class="floatTechnical hidden"></div>
    </div>`;
};

export const reloadPageOnExtensionReload = () => {
    // reloads the page on extension update/reload/uninstall
    chrome.runtime.connect().onDisconnect.addListener(() => {
        window.location.reload();
    });
};

export const isSIHActive = () => {
    const SIHSwitch = document.getElementById('switchPanel');
    const SIHSwitcherCheckbox = document.getElementById('switcher') as HTMLInputElement;
    return SIHSwitch !== null && SIHSwitcherCheckbox !== null && SIHSwitcherCheckbox.checked;
};

let searchListenerTimeout = null;
export const addSearchListener = (type, addFloatIndicatorsFunction?) => {
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

export const getSessionID = () => {
    const getSessionIDScript = "document.querySelector('body').setAttribute('sessionid', g_sessionID);";
    return injectScript(getSessionIDScript, true, 'getSessionID', 'sessionid');
};

// updates the SteamID of the extension's user in storage
export const updateLoggedInUserInfo = () => {
    const steamID = getUserSteamID();
    if (steamID !== 'false' && steamID !== null) {
        chrome.storage.local.set(
            {
                steamIDOfUser: steamID,
                steamSessionID: getSessionID(),
            },
            () => {},
        );
    }
};

export const warnOfScammer = (steamID, page) => {
    if (steamID) {
        chrome.runtime.sendMessage({ getSteamRepInfo: steamID }, ({ SteamRepInfo }) => {
            if (SteamRepInfo !== 'error') {
                if (SteamRepInfo.reputation.summary === 'SCAMMER') {
                    const backgroundURL = chrome.runtime.getURL('images/scammerbackground.jpg');
                    document.querySelector('body').insertAdjacentHTML(
                        'afterbegin',
                        DOMPurify.sanitize(
                            `<div style="background-color: red; color: white; padding: 5px; text-align: center;" class="scammerWarning">
                        <span>
                            Watch out, this user was banned on SteamRep for scamming! You can check the details of what they did on 
                            <a style="color: black; font-weight: bold" href='https://steamrep.com/profiles/${steamID}'>steamrep.com</a>
                        </span>
                     </div>`,
                        ),
                    );

                    if (page === 'offer')
                        document
                            .querySelector('body')
                            .setAttribute('style', `background-image: url('${backgroundURL}')`);
                    else if (page === 'profile') {
                        document
                            .querySelector('.no_header.profile_page')
                            .setAttribute('style', `background-image: url('${backgroundURL}')`);
                        const animatedBackground = document
                            .querySelector('.no_header.profile_page.has_profile_background')
                            .querySelector('video');
                        if (animatedBackground !== null) animatedBackground.remove();
                    }
                }
            } else console.log('Could not get SteamRep info');
        });
    }
};

export const repositionNameTagIcons = () => {
    injectStyle(
        `
    .slot_app_fraudwarning {
        top: 19px !important;
        left: 75px !important;
    }`,
        'nametagWarning',
    );
};

export const jumpToAnchor = (anchor) => {
    if (anchor !== '') {
        window.location.href = `${window.location.origin}${window.location.pathname}${anchor}`;
    }
};

export const removeOfferFromActiveOffers = (offerID) => {
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

        chrome.storage.local.set(
            {
                activeOffers: {
                    lastFullUpdate: activeOffers.lastFullUpdate,
                    items: itemsNotInThisOffer,
                    sent: sentNotThisOffer,
                    received: receivedNotThisOffer,
                    descriptions: activeOffers.descriptions,
                },
            },
            () => {},
        );
    });
};

export const addUpdatedRibbon = () => {
    chrome.storage.local.get(['showUpdatedRibbon'], ({ showUpdatedRibbon }) => {
        if (showUpdatedRibbon) {
            document.querySelector('body').insertAdjacentHTML(
                'afterbegin',
                DOMPurify.sanitize(
                    `<div id="extensionUpdatedRibbon">
                       CSGO Trader Extension was updated to ${chrome.runtime.getManifest().version}. Check out the 
                      <a href="https://csgotrader.app/changelog/" target="_blank" title="Open CSGOTrader Changelog">
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
                    document.getElementById('extensionUpdatedRibbon').classList.add('hidden');
                });
            });
        }
    });
};

export const getSteamRepInfo = (steamID) =>
    new Promise((resolve, reject) => {
        const getRequest = new Request(`https://steamrep.com/api/beta4/reputation/${steamID}?json=1`);

        fetch(getRequest)
            .then((response) => {
                if (!response.ok) {
                    reject(response);
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                } else return response.json();
            })
            .then((body) => {
                resolve(body.steamrep);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });

export const copyToClipboard = (text) => {
    // this is a workaround to only being able to copy text
    // to the clipboard that is selected in a textbox
    document.querySelector('body').insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(`
        <textarea id="text_area_to_copy_to_clipboard" class="hidden-copy-textarea" readonly="">${text}</textarea>`),
    );

    const textAreaElement = document.getElementById('text_area_to_copy_to_clipboard') as HTMLInputElement;
    textAreaElement.select();
    document.execCommand('copy');
    textAreaElement.remove();
};

export const changePageTitle = (type: string, text?: string) => {
    chrome.storage.local.get(['usefulTitles'], ({ usefulTitles }) => {
        if (usefulTitles) {
            let title = document.title.split(':: ')[1];
            switch (type) {
                case 'own_profile':
                    title = 'My profile';
                    break;
                case 'profile':
                    title = `${title}'s profile`;
                    break;
                case 'market_listing':
                    title = `${text} - Market Listings`;
                    break;
                case 'trade_offer':
                    title = `${text} - Trade Offer`;
                    break;
                case 'own_inventory':
                    title = 'My Inventory';
                    break;
                case 'inventory':
                    title = `${title}'s inventory`;
                    break;
                case 'trade_offers':
                    title = text;
                    break;
                default:
                    break;
            }
            document.title = title;
        }
    });
};

export const csgoFloatExtPresent = () => {
    const csgoFloatCheckScript = `
    document.querySelector('body').setAttribute('csgoFloat', window.csgofloat);
  `;
    const fromPage = injectScript(csgoFloatCheckScript, true, 'csgoFloatCheckScript', 'csgoFloat');
    return fromPage === 'true';
};

export const removeLinkFilterFromLinks = () => {
    chrome.storage.local.get('linkFilterOff', ({ linkFilterOff }: LinkFilterOff) => {
        if (linkFilterOff) {
            document.querySelectorAll('a').forEach((anchor) => {
                const oldHref = anchor.getAttribute('href');
                if (oldHref !== null && oldHref.includes('https://steamcommunity.com/linkfilter/?url=')) {
                    anchor.setAttribute('href', oldHref.split('https://steamcommunity.com/linkfilter/?url=')[1]);
                }
            });
        }
    });
};

// finds unread moderation messages and loads the page to mark them as read
export const markModMessagesAsRead = () => {
    chrome.storage.local.get('steamIDOfUser', ({ steamIDOfUser }: SteamIDOfUser) => {
        const getRequest = new Request(`https://steamcommunity.com/profiles/${steamIDOfUser}/moderatormessages`);
        fetch(getRequest)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    return null;
                }
                return response.text();
            })
            .then((body) => {
                if (body !== null) {
                    const html = document.createElement('html');
                    html.innerHTML = DOMPurify.sanitize(body);

                    const unreadMessageLinks = [];
                    const unreadMessagesElements = html.querySelectorAll(
                        'div.commentnotification.moderatormessage.unread',
                    );
                    unreadMessagesElements.forEach((unread) => {
                        unreadMessageLinks.push(unread.querySelector('a').getAttribute('href'));
                    });

                    unreadMessageLinks.forEach((link) => {
                        fetch(new Request(link)).then(() => {});
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

// chrome only allows notification icons locally
// or from trusted (by manifest) urls
// this is a workaround to that because Steam's CDN is not in the manifest
export const getRemoteImageAsObjectURL = (imageURL: string): Promise<string> =>
    new Promise((resolve, reject) => {
        fetch(new Request(imageURL))
            .then((response) => {
                if (!response.ok) {
                    reject(response);
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                } else return response.blob();
            })
            .then((body) => {
                resolve(URL.createObjectURL(body));
            })
            .catch((err) => {
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
