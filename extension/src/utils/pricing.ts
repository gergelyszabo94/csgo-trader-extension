import { currencies, pricingProviders, realTimePricingModes, steamCurrencyCodes } from 'utils/static/pricing';

import DOMPurify from 'dompurify';
import { PriceOverview } from 'types/api';
import { findElementByIDs } from 'utils/itemsToElementsToItems';
import { getItemMarketLink } from 'utils/simpleUtils';
import { injectScript } from 'utils/injection';
import { storageKeys } from 'utils/static/storageKeys';
import { chromeRuntimeSendMessage, chromeStorageLocalGet, chromeStorageLocalSet } from './chromeUtils';
import {
    Currency,
    ItemPricing,
    PriceQueueActivity,
    PricingMode,
    PricingProvider,
    RealTimePricesFreqFailure,
    RealTimePricesFreqSuccess,
} from 'types/storage';
import axios from 'axios';

export const priceQueue = {
    active: false,
    jobs: [],
    delaySuccess: storageKeys.realTimePricesFreqSuccess,
    delayFailure: storageKeys.realTimePricesFreqFailure,
    lastJobSuccessful: true,
    localCache: {},
    cleanupFunction: () => {}, // optional function that is executed when all jobs are done
};

interface WalletInfo {
    wallet_currency: number;
    wallet_country: string;
    wallet_state: string;
    wallet_fee: string;
    wallet_fee_minimum: string;
    wallet_fee_percent: string;
    wallet_publisher_fee_percent_default: string;
    wallet_fee_base: string;
    wallet_balance: string;
    wallet_delayed_balance: string;
    wallet_max_balance: string;
    wallet_trade_max_balance: string;
    success: number;
    rwgrsn: number;
}

// tested and works in inventories, offers and market pages
// does not work on profiles and incoming offers page
export const getSteamWalletInfo = (): WalletInfo => {
    const getWalletInfoScript =
        "document.querySelector('body').setAttribute('steamWallet', JSON.stringify(g_rgWalletInfo));";
    return JSON.parse(injectScript(getWalletInfoScript, true, 'steamWalletScript', 'steamWallet'));
};

export const initPriceQueue = async (cleanupFunction?: () => void) => {
    const result = await chromeStorageLocalGet(['realTimePricesFreqSuccess', 'realTimePricesFreqFailure']);
    const realTimePricesFreqSuccess: RealTimePricesFreqSuccess = result.realTimePricesFreqSuccess;
    const realTimePricesFreqFailure: RealTimePricesFreqFailure = result.realTimePricesFreqFailure;
    priceQueue.delaySuccess = realTimePricesFreqSuccess;
    priceQueue.delayFailure = realTimePricesFreqFailure;
    if (cleanupFunction) {
        priceQueue.cleanupFunction = cleanupFunction;
    }
};

export const getSteamWalletCurrency = () => {
    const getCurrencyScript = `
  document.querySelector('body').setAttribute('steamWalletCurrency', GetCurrencyCode(${DOMPurify.sanitize(
      String(getSteamWalletInfo().wallet_currency),
  )}));
  `;
    return injectScript(getCurrencyScript, true, 'steamWalletCurrencyScript', 'steamWalletCurrency');
};

interface BuyOrderInfo {
    success: number;
    sell_order_table: string;
    sell_order_summary: string;
    buy_order_table: string;
    buy_order_summary: string;
    highest_buy_order: string;
    lowest_sell_order: string;
    buy_order_graph: (number | string)[][];
    sell_order_graph: (number | string)[][];
    graph_max_y: number;
    graph_min_x: number;
    graph_max_x: number;
    price_prefix: string;
    price_suffix: string;
}

export const getHighestBuyOrder = async (appID: string, marketHashName: string): Promise<number | undefined> => {
    const result = await chromeStorageLocalGet('currency');
    const currency: Currency = result.currency;
    const steamWalletInfo = getSteamWalletInfo();
    let currencyID = 1;
    if (steamWalletInfo) {
        currencyID = steamWalletInfo.wallet_currency;
    } else {
        currencyID = Number(Object.keys(steamCurrencyCodes).find((key) => steamCurrencyCodes[key] === currency));
    }
    const response = await chromeRuntimeSendMessage({ getBuyOrderInfo: { appID, currencyID, marketHashName } });
    if (response !== 'error') {
        return Number((response.getBuyOrderInfo as BuyOrderInfo).highest_buy_order);
    }
};

export const getPriceOverview = async (appID: string, marketHashName: string): Promise<PriceOverview> => {
    try {
        const currencyID = getSteamWalletInfo().wallet_currency;
        const response = await axios.get(`https://steamcommunity.com/market/priceoverview/`, {
            params: {
                appid: appID,
                country: 'US',
                currency: currencyID,
                market_hash_name: marketHashName,
            },
        });
        if (response.status !== 200) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
        if (response.data && response.data.success === true) {
            return response.data;
        }
    } catch (err) {
        console.log(err);
    }
};

interface ListingInfo {
    [key: string]: Listing;
}

interface Listing {
    listingid: string;
    price: number;
    fee: number;
    publisher_fee_app: number;
    publisher_fee_percent: string;
    currencyid: number;
    steam_fee: number;
    publisher_fee: number;
    converted_price: number;
    converted_fee: number;
    converted_currencyid: number;
    converted_steam_fee: number;
    converted_publisher_fee: number;
    converted_price_per_unit: number;
    converted_fee_per_unit: number;
    converted_steam_fee_per_unit: number;
    converted_publisher_fee_per_unit: number;
    asset: Asset;
}

interface Asset {
    currency: number;
    appid: number;
    contextid: string;
    id: string;
    amount: string;
    market_actions: MarketAction[];
}

interface MarketAction {
    link: string;
    name: string;
}

export const getLowestListingPrice = async (appID: string, marketHashName: string): Promise<number | undefined> => {
    try {
        const result = await chromeStorageLocalGet('currency');
        const currency: Currency = result.currency;
        const steamWalletInfo = getSteamWalletInfo();
        let currencyID: number = 1;
        if (steamWalletInfo) {
            currencyID = steamWalletInfo.wallet_currency;
        } else {
            currencyID = Number(Object.keys(steamCurrencyCodes).find((key) => steamCurrencyCodes[key] === currency));
        }
        const marketLink = getItemMarketLink(appID, marketHashName);
        const response = await axios.get(`${marketLink}/render/`, {
            params: {
                query: '',
                start: 0,
                count: 10,
                country: 'US',
                language: 'english',
                currency: currencyID,
            },
        });

        if (response.status !== 200) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
        if (
            response.data &&
            response.data.success === true &&
            response.data.listinginfo &&
            response.data.listinginfo.length !== 0
        ) {
            const listingInfo = Object.values(response.data.listinginfo as ListingInfo);
            for (const listing of listingInfo) {
                if (listing.converted_price && listing.converted_fee) {
                    return listing.converted_price + listing.converted_fee;
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
};

export const getMidPrice = async (appID: string, marketHashName: string) => {
    try {
        const highestBuyOrderPrice = await getHighestBuyOrder(appID, marketHashName);
        const lowestListingPrice = await getLowestListingPrice(appID, marketHashName);
        if (highestBuyOrderPrice && lowestListingPrice) {
            return (highestBuyOrderPrice + lowestListingPrice) / 2;
        }
    } catch (err) {
        console.log(err);
    }
};

const priceQueueSuccess = async () => {
    priceQueue.lastJobSuccessful = true;
    return setTimeout(async () => {
        priceQueue.active = false;
        // eslint-disable-next-line no-use-before-define
        await workOnPriceQueue();
    }, priceQueue.delaySuccess);
};

const priceQueueFailure = async (error, job) => {
    console.log(error, job);
    priceQueue.lastJobSuccessful = false;
    switch (error) {
        case 'empty_listings_array':
        case 'highest_order_undef_or_null':
            await priceQueueSuccess();
            return;
        default:
            priceQueue.jobs.push({ ...job, retries: job.retries + 1 });
            setTimeout(async () => {
                priceQueue.active = false;
                // eslint-disable-next-line no-use-before-define
                await workOnPriceQueue();
            }, priceQueue.delayFailure);
    }
};

const priceQueueCacheHit = async () => {
    priceQueue.active = false;
    // eslint-disable-next-line no-use-before-define
    await workOnPriceQueue();
};

export const workOnPriceQueue = async () => {
    if (priceQueue.jobs.length === 0) {
        priceQueue.cleanupFunction();
        priceQueue.active = false;
        return;
    }
    // if there are no jobs then there is no recursion
    if (!priceQueue.active) return;

    // only start the work if the queue is inactive at the moment
    priceQueue.active = true; // marks the queue active
    const result = await chromeStorageLocalGet('priceQueueActivity');
    const priceQueueActivity: PriceQueueActivity = result.priceQueueActivity;
    const job = priceQueue.jobs.shift();
    const secondsFromLastUse = (Date.now() - new Date(priceQueueActivity.lastUsed).getTime()) / 1000;

    // tries to avoid having multiple price queues running concurrently on different pages
    if (!(secondsFromLastUse > 10 || priceQueueActivity.usedAt === window.location.pathname)) {
        priceQueueFailure('other_active_pricequeue', job);
    }
    // limits the number of retries to avoid infinite loop
    if (job.retries >= 5) {
        await workOnPriceQueue();
    }

    const cachedItemKey = `${job.appID}${job.market_hash_name}${job.type}`;
    const cachedItem = priceQueue.localCache[cachedItemKey];

    switch (job.type) {
        case 'my_buy_order':
        case 'inventory_mass_sell_instant_sell':
        case `offer_${realTimePricingModes.bid_price.key}`:
        case `offers_${realTimePricingModes.bid_price.key}`:
        case `inventory_${realTimePricingModes.bid_price.key}`:
            if (cachedItem) {
                switch (job.type) {
                    case 'my_buy_order':
                        job.callBackFunction(job, cachedItem);
                        break;
                    case `inventory_mass_sell_instant_sell`:
                        job.callBackFunction(
                            job.market_hash_name,
                            priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                            job.appID,
                            job.assetID,
                            job.contextID,
                        );
                        break;
                }
                await priceQueueCacheHit();
                return;
            }
            const highestBuyOrder = await getHighestBuyOrder(job.appID, job.market_hash_name);
            if (highestBuyOrder) {
                switch (job.type) {
                    case 'my_buy_order':
                        job.callBackFunction(job, highestBuyOrder);
                        break;
                    case `inventory_mass_sell_instant_sell`:
                    case `offer_${realTimePricingModes.bid_price.key}`:
                        job.callBackFunction(
                            job.market_hash_name,
                            highestBuyOrder,
                            job.appID,
                            job.assetID,
                            job.contextID,
                        );
                        break;
                }
                priceQueue.localCache[cachedItemKey] = highestBuyOrder;
                await priceQueueSuccess();
                break;
            }
            await priceQueueFailure('highestBuyOrder is falsy', job);
            break;
        case 'my_listing':
        case 'inventory_mass_sell_starting_at':
        case 'history_row':
        case `offer_${realTimePricingModes.ask_price.key}`:
        case `offers_${realTimePricingModes.ask_price.key}`:
        case `inventory_${realTimePricingModes.ask_price.key}`:
            if (cachedItem) {
                switch (job.type) {
                    case 'my_listing':
                        job.callBackFunction(job.listingID, cachedItem);
                        break;
                    case 'history_row':
                        job.callBackFunction(job.rowID, cachedItem);
                        break;
                    default:
                        job.callBackFunction(
                            job.market_hash_name,
                            priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                            job.appID,
                            job.assetID,
                            job.contextID,
                        );
                        break;
                }
                await priceQueueCacheHit();
                break;
            }
            const lowestListingPrice = getLowestListingPrice(job.appID, job.market_hash_name);
            if (lowestListingPrice) {
                switch (job.type) {
                    case 'my_listing':
                        job.callBackFunction(job.listingID, lowestListingPrice);
                        break;
                    case 'history_row':
                        job.callBackFunction(job.rowID, lowestListingPrice);
                        break;
                    default:
                        job.callBackFunction(
                            job.market_hash_name,
                            lowestListingPrice,
                            job.appID,
                            job.assetID,
                            job.contextID,
                            job.type,
                        );
                }
                priceQueue.localCache[cachedItemKey] = lowestListingPrice;
                await priceQueueSuccess();
                break;
            }
            await priceQueueFailure('lowestListingPrice is falsy', job);
            break;
        case 'inventory_mass_sell_mid_price':
        case `offer_${realTimePricingModes.mid_price.key}`:
        case `offers_${realTimePricingModes.mid_price.key}`:
        case `inventory_${realTimePricingModes.mid_price.key}`:
            if (cachedItem) {
                job.callBackFunction(
                    job.market_hash_name,
                    priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                    job.appID,
                    job.assetID,
                    job.contextID,
                    job.type,
                );
                await priceQueueCacheHit();
                break;
            }
            const midPrice = await getMidPrice(job.appID, job.market_hash_name);
            if (midPrice) {
                job.callBackFunction(job.market_hash_name, midPrice, job.appID, job.assetID, job.contextID, job.type);
                priceQueue.localCache[cachedItemKey] = midPrice;
                await priceQueueSuccess();
                break;
            }
            await priceQueueFailure('midPrice is falsy', job);
            break;
    }

    // updates storage to signal that the price queue is being used
    await chromeStorageLocalSet({
        priceQueueActivity: {
            lastUsed: Date.now(),
            usedAt: window.location.pathname,
        },
    });
};

export const updatePrices = async () => {
    const result = chromeStorageLocalGet(['itemPricing', 'pricingProvider', 'pricingMode']);

    const item: ItemPricing = result.itemPricing;
    const provider: PricingProvider = result.pricingProvider;
    const mode: PricingMode = result.pricingMode;

    const response = await axios.get(`https://prices.csgotrader.app/latest/${provider}.json`, {
        headers: {
            'Accept-Encoding': 'gzip',
        },
    });
    if (response.status !== 200) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        return;
    }
    if (response.data && item) {
        const prices = {};
        const keys = Object.keys(response.data);
        switch (provider) {
            case pricingProviders.steam.name:
            case pricingProviders.bitskins.name:
            case pricingProviders.skinport.name:
                let pricingMode = mode;
                if (mode === pricingProviders.bitskins.pricing_modes.bitskins.name) {
                    pricingMode = 'price';
                } else if (mode === pricingProviders.bitskins.pricing_modes.instant_sale.name) {
                    pricingMode = 'instant_sale_price';
                }
                for (const key of keys) {
                    const price = response.data[key][pricingMode] || null;
                    prices[key] = { price: price };
                    if (!price) {
                        console.log(key);
                    }
                }
            case pricingProviders.lootfarm.name:
            case pricingProviders.csgotm.name:
            case pricingProviders.csgoempire.name:
            case pricingProviders.swapgg.name:
            case pricingProviders.csgoexo.name:
            case pricingProviders.skinwallet.name: {
                for (const key of keys) {
                    prices[key] = { price: response.data[key] };
                }
            }
            case pricingProviders.csmoney.name:
            case pricingProviders.csgotrader.name:
                for (const key of keys) {
                    const item = response.data[key];
                    const itemData = { price: item.price };

                    if (item.doppler) {
                        itemData['doppler'] = item.doppler;
                    }
                    prices[key] = itemData;
                }
            case pricingProviders.buff163.name:
                for (const key of keys) {
                    const item = response.data[key][mode];
                    const itemData = { price: item.price || null };
                    if (item.doppler) {
                        itemData['doppler'] = item.doppler;
                    }
                    prices[key] = itemData;
                    if (!item) {
                        console.log(key);
                    }
                }
        }
        await chromeStorageLocalSet({ prices });
    }
};

export const updateExchangeRates = () => {
    const request = new Request('https://prices.csgotrader.app/latest/exchange_rates.json');

    fetch(request)
        .then((response) => {
            if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return response.json();
        })
        .then((exchangeRatesJSON) => {
            chrome.storage.local.set({ exchangeRates: exchangeRatesJSON }, () => {});
            chrome.storage.local.get('currency', ({ currency }) => {
                chrome.storage.local.set({ exchangeRate: exchangeRatesJSON[currency] }, () => {});
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

export const getPrice = (marketHashName, dopplerInfo, prices, provider, mode, exchangeRate, currency) => {
    let price = '0.00';
    if (
        prices[marketHashName] !== undefined &&
        prices[marketHashName] !== 'null' &&
        prices[marketHashName] !== null &&
        prices[marketHashName].price !== undefined &&
        prices[marketHashName].price !== 'null'
    ) {
        // csgotrader, csmoney and buff have doppler phase prices so they are handled differently
        if (
            provider === pricingProviders.csgotrader.name ||
            provider === pricingProviders.csmoney.name ||
            provider === pricingProviders.buff163.name
        ) {
            // other providers have no doppler info
            if (dopplerInfo !== null) {
                // when there is price for the specific doppler phase take that
                if (
                    prices[marketHashName].doppler !== undefined &&
                    prices[marketHashName].doppler !== 'null' &&
                    prices[marketHashName].doppler[dopplerInfo.name] !== null &&
                    prices[marketHashName].doppler[dopplerInfo.name] !== 'null' &&
                    prices[marketHashName].doppler[dopplerInfo.name] !== undefined
                ) {
                    price = (prices[marketHashName].doppler[dopplerInfo.name] * exchangeRate).toFixed(2);
                } else if (
                    provider === pricingProviders.buff163.name &&
                    mode === pricingProviders.buff163.pricing_modes.starting_at.name
                ) {
                    price = '0.00';
                } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
            } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
        } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
    }
    return {
        price,
        display: price === '0.00' ? '' : currencies[currency].sign + price,
    };
};

export const getStickerPriceTotal = (stickers, currency) => {
    let total = 0.0;
    if (stickers !== null) {
        stickers.forEach((sticker) => {
            if (sticker.price !== null) total += parseFloat(sticker.price.price);
        });
    }
    return total === 0 ? null : { price: total, display: currencies[currency].sign + total.toFixed(2) };
};

export const prettyPrintPrice = (currency, price) => {
    const nf = new Intl.NumberFormat();
    return price >= 0
        ? currencies[currency].sign + nf.format(price)
        : `-${currencies[currency].sign}${nf.format(Math.abs(price))}`;
};

export const getPriceAfterFees = (priceBeforeFees) => {
    // TODO get the publisher fee dynamically
    const priceAfterFeesScript = `
        document.querySelector('body').setAttribute(
          'priceAfterFees',
          ${DOMPurify.sanitize(priceBeforeFees)} - CalculateFeeAmount( ${DOMPurify.sanitize(
        priceBeforeFees,
    )}, g_rgWalletInfo['wallet_publisher_fee_percent_default'] ).fees);`;
    return parseInt(injectScript(priceAfterFeesScript, true, 'priceAfterFeesScript', 'priceAfterFees'));
};

export const userPriceToProperPrice = (userInput) => {
    const strippedFromExtraChars = userInput.replace(/[^0-9.,]/g, '');
    const splitChar = strippedFromExtraChars.includes('.') ? '.' : strippedFromExtraChars.includes(',') ? ',' : '';
    if (splitChar === '') return parseInt(`${strippedFromExtraChars}00`); // whole number

    const parts = strippedFromExtraChars.split(splitChar);
    const wholePart = parts[0];
    let decimalPart = parts[1] === undefined ? '00' : parts[1];

    if (decimalPart.length === 1) decimalPart += '0';
    // turns 0.3 into 0.30
    else if (decimalPart.length > 2) decimalPart = decimalPart.substr(0, 2); // turns 0.0003 into 0.00
    return parseInt(wholePart + decimalPart);
};

// converts cent integers to pretty formatted string
export const centsToSteamFormattedPrice = (centsPrice) => {
    const intToFormattedScript = `document.querySelector('body').setAttribute('intToFormatted', v_currencyformat(${DOMPurify.sanitize(
        centsPrice.toString(),
    )}, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));`;
    return injectScript(intToFormattedScript, true, 'intToFormattedScript', 'intToFormatted');
};

// to convert the formatted price string
// that the price overview api call returns to cent int (for market listing)
export const steamFormattedPriceToCents = (formattedPrice) => {
    const formattedToIntScript = `document.querySelector('body').setAttribute('formattedToInt', GetPriceValueAsInt('${DOMPurify.sanitize(
        formattedPrice,
    ).toString()}'));`;
    return injectScript(formattedToIntScript, true, 'formattedToIntScript', 'formattedToInt');
};

export const getUserCurrencyBestGuess = (): Promise<string> =>
    new Promise((resolve) => {
        const getRequest = new Request('https://steamcommunity.com/market/');

        fetch(getRequest)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    resolve(currencies.USD.short);
                }
                return response.text();
            })
            .then((body) => {
                const valueStart = body.split('var g_nWalletCurrency = ')[1];
                if (valueStart !== undefined) {
                    const value = valueStart.split(';')[0];
                    const currencyFromCode = steamCurrencyCodes[value];
                    if (currencyFromCode !== undefined) {
                        if (currencies[currencyFromCode] !== undefined) {
                            resolve(currencies[currencyFromCode].short);
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(currencies.USD.short);
            });
    });

export const addRealTimePriceIndicator = (itemElement, price) => {
    itemElement.insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(`<div class="realTimePriceIndicator">${price}</div>`),
    );
};

export const addRealTimePriceToPage = (marketHashName, price, appID, assetID, contextID, type) => {
    const itemElement = findElementByIDs(appID, contextID, assetID, type);

    // the steam wallet global var is not defined in the trade offer page
    // this is a workaround to that
    if (type.includes('offers')) {
        chrome.storage.local.get(['userSteamWalletCurrency'], ({ userSteamWalletCurrency }) => {
            addRealTimePriceIndicator(
                itemElement,
                price !== null ? prettyPrintPrice(userSteamWalletCurrency, (price / 100).toFixed(2)) : 'No Data',
            );
        });
    } else {
        addRealTimePriceIndicator(itemElement, price !== null ? centsToSteamFormattedPrice(price) : 'No Data');
    }
    itemElement.setAttribute('data-realtime-price', price !== null ? price.toString() : '0');
};

export const updateWalletCurrency = () => {
    const walletCurrency = getSteamWalletCurrency();
    chrome.storage.local.set({
        userSteamWalletCurrency:
            walletCurrency !== 'Unknown' && walletCurrency !== undefined ? walletCurrency : currencies.USD.short,
    });
};
