import exteriors from 'js/utils/static/exteriors';
import { dopplerPhases, iconToPhaseMapping } from 'js/utils/static/dopplerPhases';
import rarities from "js/utils/static/rarities";
import qualities from "js/utils/static/qualities";
import itemTypes from 'js/utils/static/itemTypes';
import patterns from 'js/utils/static/patterns';
import { getPrice } from 'js/utils/pricing';

const logExtensionPresence = () => {
    const version = chrome.runtime.getManifest().version;
    console.log(`CSGO Trader - Steam Trading Enhancer ${version} is running on this page. Changelog at: https://csgotrader.app/changelog/`);
    console.log('If you see any errors that seem related to the extension please email support@csgotrader.app')
};

const scrapeSteamAPIkey = () => {
    const getRequest = new Request('https://steamcommunity.com/dev/apikey');

    fetch(getRequest).then((response) => {
        if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        else return response.text();
    }).then((body) => {
        const html = document.createElement('html');
        html.innerHTML = body;
        let apiKey = null;

        try {apiKey =  html.querySelector('#bodyContents_ex').querySelector('p').innerText.split(': ')[1]}
        catch (e) {
            console.log(e);
            console.log(body);
        }

        validateSteamAPIKey(apiKey).then(
            apiKeyValid => {
                if (apiKeyValid) {
                    console.log('api key valid');
                    chrome.storage.local.set({steamAPIKey: apiKey, apiKeyValid: true}, () => {});
                }
            }, (error) => {
                console.log(error);
            });
    }).catch(err => {
        console.log(err);
    });
};

const validateSteamAPIKey = (apiKey) => {
    return new Promise((resolve, reject) => {
        const getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561198036030455`);

        fetch(getRequest).then((response) => {
            if (!response.ok) {
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                reject(response.status)
            }
            else return response.json();
        }).then((body) => {
            try {
                if (body.response.players[0].steamid === '76561198036030455') resolve(true);
                else resolve(false)
            }
            catch (e) {
                console.log(e);
                reject(e)
            }
        }).catch(err => {
            console.log(err);
            reject(err)
        });
    });
};

const arrayFromArrayOrNotArray = (arrayOrNotArray) => {
    if (!Array.isArray(arrayOrNotArray)) {
        const notArray = arrayOrNotArray;
        arrayOrNotArray = [];
        arrayOrNotArray.push(notArray);
    }
    return arrayOrNotArray;
};

const removeFromArray = (array, arrayIndex) => {
    return array.map((element, index) => {
        return index !== arrayIndex ? element : null;
    });
};

const getExteriorFromTags = (tags) => {
    if (tags !== undefined) {
        for (let tag of tags) {
            if (tag.category === 'Exterior') {
                for (let exterior in exteriors) {
                    if (exteriors[exterior].internal_name === tag.internal_name) return exteriors[exterior];
                }

                // no exterior
                return null;
            }
        }
    }
    return null;
};

const getDopplerInfo  = (icon) => {
    return iconToPhaseMapping[icon] !== undefined ? iconToPhaseMapping[icon] :  dopplerPhases.unk;
};

const getQuality = (tags) => {
    if (tags !== undefined) {
        for (let tag of tags) if (tag.category === 'Rarity') {
            for (let rarity in rarities) {
                if (rarities[rarity].internal_name === tag.internal_name) return qualities[rarities[rarity].name];
            }

            // if the rarity is unknown to the extension
            console.log(tag.internal_name);
            return qualities.stock;
        }
    }
    return null;
};

const getType = (tags) => {
    if (tags !== undefined) {
        for (let tag of tags) if (tag.category === 'Type') {
            for (let itemType in itemTypes) {
                if (itemTypes[itemType].internal_name === tag.internal_name) return itemTypes[itemType];
            }

            // if the category is unknown to the extension - for example a new item type was introduced
            console.log(tag.internal_name);
            return itemTypes.unknown_type;
        }
    }
    return null;
};

const getPattern = (name, paint_seed) => {
    if (name.includes(' Marble Fade ')) {
        let pattern = null;
        if (name.includes('Karambit')) pattern = patterns.marble_fades.karambit[paint_seed];
        else if (name.includes('Butterfly')) pattern = patterns.marble_fades.butterfly[paint_seed];
        else if (name.includes('M9 Bayonet')) pattern = patterns.marble_fades.m9[paint_seed];
        else if (name.includes('Bayonet')) pattern = patterns.marble_fades.bayonet[paint_seed];
        else if (name.includes('Talon')) pattern = patterns.marble_fades.talon[paint_seed];
        else if (name.includes('Stiletto')) pattern = patterns.marble_fades.stiletto[paint_seed];
        else if (name.includes('Navaja')) pattern = patterns.marble_fades.navaja[paint_seed];
        else if (name.includes('Ursus')) pattern = patterns.marble_fades.ursus[paint_seed];
        else if (name.includes('Huntsman')) pattern = patterns.marble_fades.huntsman[paint_seed];
        else if (name.includes('Flip')) pattern = patterns.marble_fades.flip[paint_seed];
        else if (name.includes('Bowie')) pattern = patterns.marble_fades.bowie[paint_seed];
        else if (name.includes('Daggers')) pattern = patterns.marble_fades.daggers[paint_seed];
        else if (name.includes('Gut')) pattern = patterns.marble_fades.gut[paint_seed];
        else if (name.includes('Falchion')) pattern = patterns.marble_fades.falchion[paint_seed];
        else return null;

        if (pattern !== null && pattern !== undefined) return {type: 'marble_fade', value: pattern};
        else return null;
    }
    else if (name.includes(' Fade ')) {
        let percentage = null;
        if (name.includes('Karambit')) percentage = patterns.fades.karambit[paint_seed];
        else if (name.includes('Butterfly')) percentage = patterns.fades.butterfly[paint_seed];
        else if (name.includes('M9 Bayonet')) percentage = patterns.fades.m9[paint_seed];
        else if (name.includes('Bayonet')) percentage = patterns.fades.bayonet[paint_seed];
        else if (name.includes('Talon')) percentage = patterns.fades.talon[paint_seed];
        else if (name.includes('Stiletto')) percentage = patterns.fades.stiletto[paint_seed];
        else if (name.includes('Navaja')) percentage = patterns.fades.navaja[paint_seed];
        else if (name.includes('Ursus')) percentage = patterns.fades.ursus[paint_seed];
        else if (name.includes('Huntsman')) percentage = patterns.fades.huntsman[paint_seed];
        else if (name.includes('Flip')) percentage = patterns.fades.flip[paint_seed];
        else if (name.includes('Bowie')) percentage = patterns.fades.bowie[paint_seed];
        else if (name.includes('Daggers')) percentage = patterns.fades.daggers[paint_seed];
        else if (name.includes('Gut')) percentage = patterns.fades.gut[paint_seed];
        else if (name.includes('Falchion')) percentage = patterns.fades.falchion[paint_seed];
        else if (name.includes('Glock')) percentage = patterns.fades.glock[paint_seed];
        else return null;

        if (percentage !== null && percentage !== undefined) return {type: 'fade', value: `${percentage}% Fade`};
        else return null;
    }
    else if (name.includes(' Case Hardened')) {
        let pattern = null;
        if (name.includes('AK-47'))pattern = patterns.case_hardeneds.ak[paint_seed];
        else if (name.includes('Butterfly')) pattern = patterns.case_hardeneds.butterfly[paint_seed];
        else if (name.includes('M9 Bayonet')) pattern = patterns.case_hardeneds.m9[paint_seed];
        else if (name.includes('Bayonet')) pattern = patterns.case_hardeneds.bayonet[paint_seed];
        else if (name.includes('Talon')) pattern = patterns.case_hardeneds.talon[paint_seed];
        else if (name.includes('Stiletto')) pattern = patterns.case_hardeneds.stiletto[paint_seed];
        else if (name.includes('Navaja')) pattern = patterns.case_hardeneds.navaja[paint_seed];
        else if (name.includes('Ursus')) pattern = patterns.case_hardeneds.ursus[paint_seed];
        else if (name.includes('Huntsman')) pattern = patterns.case_hardeneds.huntsman[paint_seed];
        else if (name.includes('Flip')) pattern = patterns.case_hardeneds.flip[paint_seed];
        else if (name.includes('Bowie')) pattern = patterns.case_hardeneds.bowie[paint_seed];
        else if (name.includes('Daggers')) pattern = patterns.case_hardeneds.daggers[paint_seed];
        else if (name.includes('Gut')) pattern = patterns.case_hardeneds.gut[paint_seed];
        else if (name.includes('Falchion')) pattern = patterns.case_hardeneds.falchion[paint_seed];
        else if (name.includes('Karambit')) pattern = patterns.case_hardeneds.karambit[paint_seed];
        else if (name.includes('/Five-SeveN')) pattern = patterns.case_hardeneds.five_seven[paint_seed];
        else return null;

        if (pattern !== null && pattern !== undefined) return {type: 'case_hardened', value: pattern};
        else return null; // return {type: 'case_hardened', value: 'Not special or not found'};
    }
    else return null;
};

const parseStickerInfo = (descriptions, linkType, prices, pricingProvider, exchangeRate, currency) => {
    if (descriptions !== undefined && linkType !== undefined) {
        let stickers = [];
        const link = linkType === 'search' ? 'https://steamcommunity.com/market/search?q=' : 'https://steamcommunity.com/market/listings/730/Sticker%20%7C%20';

        descriptions.forEach((description) => {
            if (description.value.includes('sticker_info')) {
                let names = description.value.split('><br>')[1].split(': ')[1].split('</center>')[0].split(', ');
                names = handleStickerNamesWithCommas(names);
                const iconURLs = description.value.split('src="');

                iconURLs.shift();
                iconURLs.forEach((iconURL, index) => {
                    iconURLs[index] = iconURL.split('><')[0]
                });

                stickers = names.map((name, index) => {
                   return ({
                       name,
                       price: linkType === 'search' ? null : getPrice('Sticker | ' + name, null, prices, pricingProvider, exchangeRate, currency),
                       iconURL: iconURLs[index],
                       marketURL: link + name
                   });
                });
            }
        });
        return stickers;
    }
    else return null
};

const handleStickerNamesWithCommas = (names) => {
    let nameWithCommaFound = false;

    names.forEach((name, index) => {
        if (name === 'Don\'t Worry' && names[index + 1] === 'I\'m Pro') {
            names[index] = 'Don\'t Worry, I\'m Pro';
            names = removeFromArray(names, index + 1);
            nameWithCommaFound = true;
        }
    });

    if (nameWithCommaFound) return handleStickerNamesWithCommas(names);
    else return names;
};

const getShortDate = (tradabibilityDate) => {
    if (tradabibilityDate === 'Tradable' || tradabibilityDate === '') return 'T';
    const now = new Date().getTime();
    const distance = new Date(tradabibilityDate) - now;
    if (distance <= 0) return 'T';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (days === 0) {
        if (hours === 0) {
            if (minutes === 0) {
                if (seconds === 0) return '';
                else return `${seconds}s`;
            }
            else return `${minutes}m`;
        }
        else return `${hours}h`;
    }
    else return `${days}d`;
};

const goToInternalPage = (targetURL) => {
    chrome.tabs.query({}, (tabs) => {
        for (let i = 0; i < tabs.length ; i++) {
            const tab = tabs[i];
            if (tab.url === ('chrome-extension://'+ chrome.runtime.id + targetURL)) { // TODO make this work in firefox or remove the whole thing
                chrome.tabs.reload(tab.id, {}, () => {});
                chrome.tabs.update(tab.id, {active: true});
                return;
            }
        }
        chrome.tabs.create({url: targetURL});
    });
};

const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> c / 4))).toString(16)
    );
};

// updates the SteamID of the extension's user in storage
const updateLoggedInUserID = () => {
    const steamID = getUserSteamID();
    if (steamID !== 'false' && steamID !== false) chrome.storage.local.set({steamIDOfUser: steamID}, () =>{});
};

// gets SteamID of the user logged into steam (returns false if there is no user logged in)
const getUserSteamID = () => {
    const getUserSteamIDScript = `document.querySelector('body').setAttribute('steamidOfLoggedinUser', g_steamID);`;
    return injectToPage(getUserSteamIDScript, true, 'steamidOfLoggedinUser', 'steamidOfLoggedinUser');
};

// inject scripts from content scripts the the page context, usually to access variables or override functionality
const injectToPage = (scriptString, toRemove, id, executeAndReturn) => {
    // removes previously added instance of the script
    const elementFromBefore = document.getElementById(id);
    if (elementFromBefore !== null) elementFromBefore.remove();

    const toInject = document.createElement('script');
    toInject.id = id;
    toInject.innerHTML = scriptString;
    (document.head || document.documentElement).appendChild(toInject);

    const simpleAttributeParsing = ['steamidOfLoggedinUser', 'steamidOfProfileOwner', 'tradePartnerSteamID', 'inventoryOwnerID', 'listingsInfo',
        'inventoryInfo', 'allItemsLoaded', 'offerInventoryInfo', 'steamWalletCurrency', 'steamWallet', 'formattedToInt', 'intToFormatted',
        'priceAfterFees', 'sessionid'];
    const result = simpleAttributeParsing.includes(executeAndReturn) ? document.querySelector('body').getAttribute(executeAndReturn) : null;
    document.querySelector('body').setAttribute(executeAndReturn, '');

    if (toRemove) document.head.removeChild(toInject);
    return result;
};

const listenToLocationChange = (callBackFunction) => {
    let oldHref = document.location.href;

    const locationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (oldHref !== document.location.href) {
                oldHref = document.location.href;
                callBackFunction();
            }
        });
    });

    locationObserver.observe(document.querySelector('body'), {
        subtree: true,
        childList: true
    })
};

const getAssetIDFromInspectLink = (inspectLink) => {
    return (inspectLink !== null && inspectLink !== undefined) ? inspectLink.split('A')[1].split('D')[0] : null;
};

export {
    logExtensionPresence, scrapeSteamAPIkey, arrayFromArrayOrNotArray,
    getExteriorFromTags, getDopplerInfo, getQuality, parseStickerInfo,
    handleStickerNamesWithCommas, removeFromArray, getType,
    getPattern, getShortDate, goToInternalPage,
    validateSteamAPIKey, getAssetIDFromInspectLink, uuidv4,
    updateLoggedInUserID, getUserSteamID, injectToPage,
    listenToLocationChange
};