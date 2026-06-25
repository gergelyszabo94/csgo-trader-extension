import {
  currencies,
  pricingProviders,
  realTimePricingModes,
  steamCurrencyCodes,
} from 'utils/static/pricing';

import DOMPurify from 'dompurify';
import { findElementByIDs } from 'utils/itemsToElementsToItems';
import { injectScript } from 'utils/injection';
import { storageKeys } from 'utils/static/storageKeys';

const priceQueue = {
  active: false,
  jobs: [],
  delaySuccess: storageKeys.realTimePricesFreqSuccess,
  delayFailure: storageKeys.realTimePricesFreqFailure,
  lastJobSuccessful: true,
  localCache: {},
  cleanupFunction: () => { }, // optional function that is executed when all jobs are done
};

// tested and works in inventories, offers and market pages
// does not work on profiles and incoming offers page
const getSteamWalletInfo = () => {
  const getWalletInfoScript = 'document.querySelector(\'body\').setAttribute(\'steamWallet\', JSON.stringify("g_rgWalletInfo" in window ? g_rgWalletInfo : null));';
  return JSON.parse(injectScript(getWalletInfoScript, true, 'steamWalletScript', 'steamWallet'));
};

const initPriceQueue = (cleanupFunction) => {
  chrome.storage.local.get(
    ['realTimePricesFreqSuccess', 'realTimePricesFreqFailure'],
    ({ realTimePricesFreqSuccess, realTimePricesFreqFailure }) => {
      priceQueue.delaySuccess = realTimePricesFreqSuccess;
      priceQueue.delayFailure = realTimePricesFreqFailure;
      priceQueue.cleanupFunction = cleanupFunction !== undefined ? cleanupFunction : () => { };
    },
  );
};

const getSteamWalletCurrency = () => {
  const walletInfo = getSteamWalletInfo();
  if (walletInfo) {
    const getCurrencyScript = `
  document.querySelector('body').setAttribute('steamWalletCurrency', GetCurrencyCode(${DOMPurify.sanitize(walletInfo.wallet_currency)}));
  `;
    return injectScript(getCurrencyScript, true, 'steamWalletCurrencyScript', 'steamWalletCurrency');
  } return null;
};

const normalizeMarketHashNameForUrl = (marketHashName) => {
  let decoded = marketHashName;

  for (let i = 0; i < 2; i += 1) {
    try {
      const nextDecoded = decodeURIComponent(decoded);
      if (nextDecoded === decoded) break;
      decoded = nextDecoded;
    } catch (err) {
      break;
    }
  }

  return encodeURIComponent(decoded);
};

const getOrderBook = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    const normalizedMarketHashName = normalizeMarketHashNameForUrl(marketHashName);
    const request = new Request(`https://steamcommunity.com/market/orderbook?q=Load&qp=[${appID},"${normalizedMarketHashName}"]`);

    fetch(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
        return null;
      }
      return response.json();
    }).then((orderBookJSON) => {
      if (orderBookJSON === null) return;
      if (orderBookJSON.success) {
        const orderBookData = orderBookJSON.data;
        if (orderBookData) {
          const highestBuyOrder = orderBookData.amtMaxBuyOrder;
          const lowestListingPrice = orderBookData.amtMinSellOrder;
          const midPrice = highestBuyOrder !== null && lowestListingPrice !== null
            ? Math.round((highestBuyOrder + lowestListingPrice) / 2)
            : null;

          resolve({
            highestBuyOrder,
            lowestListingPrice,
            midPrice,
          });
        } else reject('no_order_book_data');
      } else reject('success:false');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

// unused atm
const getPriceOverview = (appID, marketHashName, currencyID) => {
  return new Promise((resolve, reject) => {
    const request = new Request(`https://steamcommunity.com/market/priceoverview/?appid=${appID}&country=US&currency=${currencyID}&market_hash_name=${marketHashName}`);

    fetch(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      }
      return response.json();
    }).then((priceOverviewJSON) => {
      if (priceOverviewJSON === null) reject('success:false');
      else if (priceOverviewJSON.success === true) resolve(priceOverviewJSON);
      else reject('success:false');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const priceQueueSuccess = () => {
  priceQueue.lastJobSuccessful = true;
  setTimeout(() => {
    priceQueue.active = false;
    // eslint-disable-next-line no-use-before-define
    workOnPriceQueue();
  }, priceQueue.delaySuccess);
};

const priceQueueFailure = (error, job) => {
  console.log(error, job);
  priceQueue.lastJobSuccessful = false;

  if (error !== 'empty_listings_array' && error !== 'highest_order_undef_or_null') {
    priceQueue.jobs.push({ ...job, retries: job.retries + 1 });

    setTimeout(() => {
      priceQueue.active = false;
      // eslint-disable-next-line no-use-before-define
      workOnPriceQueue();
    }, priceQueue.delayFailure);
  } else priceQueueSuccess();
};

const priceQueueCacheHit = () => {
  priceQueue.active = false;
  // eslint-disable-next-line no-use-before-define
  workOnPriceQueue();
};

const isBidPriceJob = (type) => {
  return type === 'my_buy_order'
    || type === 'inventory_mass_sell_instant_sell'
    || type === `offer_${realTimePricingModes.bid_price.key}`
    || type === `offers_${realTimePricingModes.bid_price.key}`
    || type === `inventory_${realTimePricingModes.bid_price.key}`;
};

const isAskPriceJob = (type) => {
  return type === 'inventory_mass_sell_starting_at'
    || type === `offer_${realTimePricingModes.ask_price.key}`
    || type === `offers_${realTimePricingModes.ask_price.key}`
    || type === `inventory_${realTimePricingModes.ask_price.key}`
    || type === 'my_listing'
    || type === 'history_row';
};

const isMidPriceJob = (type) => {
  return type === `offer_${realTimePricingModes.mid_price.key}`
    || type === `offers_${realTimePricingModes.mid_price.key}`
    || type === `inventory_${realTimePricingModes.mid_price.key}`
    || type === 'inventory_mass_sell_mid_price';
};

const getPriceQueueCacheKey = (job) => job.appID + job.market_hash_name + job.type;

const getOrderBookPriceForJob = (jobType, orderBook) => {
  if (isBidPriceJob(jobType)) return orderBook.highestBuyOrder;
  if (isAskPriceJob(jobType)) return orderBook.lowestListingPrice;
  if (isMidPriceJob(jobType)) return orderBook.midPrice;
  return undefined;
};

const callPriceQueueCallback = (job, price) => {
  if (job.type === 'my_buy_order') {
    job.callBackFunction(job, price);
  } else if (job.type === 'my_listing') {
    job.callBackFunction(job.listingID, price);
  } else if (job.type === 'history_row') {
    job.callBackFunction(job.rowID, price);
  } else {
    job.callBackFunction(
      job.market_hash_name,
      price,
      job.appID,
      job.assetID,
      job.contextID,
      job.type,
      job.showContrastingLook,
    );
  }
};

const getQueuePriceMissingError = (jobType) => {
  if (isBidPriceJob(jobType)) return 'highestBuyOrder is undefined';
  if (isAskPriceJob(jobType)) return 'lowest_price is undefined';
  if (isMidPriceJob(jobType)) return 'highest_order_undef_or_null';
  return 'unsupported_job_type';
};

const workOnPriceQueue = () => {
  if (priceQueue.jobs.length !== 0) { // if there are no jobs then there is no recursion
    if (!priceQueue.active) { // only start the work if the queue is inactive at the moment
      priceQueue.active = true; // marks the queue active
      chrome.storage.local.get(['priceQueueActivity'], ({ priceQueueActivity }) => {
        const job = priceQueue.jobs.shift();
        const secondsFromLastUse = ((Date.now()
          - new Date(priceQueueActivity.lastUsed)) / 1000);

        // tries to avoid having multiple price queues running concurrently on different pages
        if (secondsFromLastUse > 10 || priceQueueActivity.usedAt === window.location.pathname) {
          if (job.retries < 5) { // limits the number of retries to avoid infinite loop
            const supportedType = isBidPriceJob(job.type)
              || isAskPriceJob(job.type)
              || isMidPriceJob(job.type);

            if (!supportedType) {
              priceQueueFailure('unsupported_job_type', job);
            } else {
              const cacheKey = getPriceQueueCacheKey(job);
              const cachedPrice = priceQueue.localCache[cacheKey];

              if (cachedPrice !== undefined) {
                callPriceQueueCallback(job, cachedPrice);
                priceQueueCacheHit();
              } else {
                getOrderBook(job.appID, job.market_hash_name).then((orderBook) => {
                  const price = getOrderBookPriceForJob(job.type, orderBook);
                  if (price !== undefined && price !== null) {
                    callPriceQueueCallback(job, price);
                    priceQueue.localCache[cacheKey] = price;
                    priceQueueSuccess();
                  } else {
                    priceQueueFailure(getQueuePriceMissingError(job.type), job);
                  }
                }, (error) => {
                  priceQueueFailure(error, job);
                });
              }
            }
            // updates storage to signal that the price queue is being used
            chrome.storage.local.set({
              priceQueueActivity: {
                lastUsed: Date.now(),
                usedAt: window.location.pathname,
              },
            });
          } else workOnPriceQueue();
        } else priceQueueFailure('other_active_pricequeue', job);
      });
    }
  } else {
    priceQueue.cleanupFunction();
    priceQueue.active = false;
  }
};

const updatePrices = () => {
  chrome.storage.local.get(['itemPricing', 'pricingProvider', 'pricingMode'], (result) => {
    const provider = result.pricingProvider;
    const mode = result.pricingMode;
    const headers = new Headers();

    headers.append('Accept-Encoding', 'gzip');
    const init = {
      method: 'GET',
      headers,
      mode: 'cors',
      cache: 'default',
    };

    const request = new Request(`https://prices.csgotrader.app/latest/${provider}.json`, init);
    fetch(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      }
      return response.json();
    }).then((pricesJSON) => {
      if (result.itemPricing) {
        const prices = {};
        const keys = Object.keys(pricesJSON);

        if (provider === pricingProviders.steam.name
          || provider === pricingProviders.bitskins.name
          || provider === pricingProviders.skinport.name) {
          let pricingMode = mode;
          if (mode === pricingProviders.bitskins.pricing_modes.bitskins.name) pricingMode = 'price';
          else if (mode === pricingProviders.bitskins.pricing_modes.instant_sale.name) {
            pricingMode = 'instant_sale_price';
          }

          for (const key of keys) {
            if (pricesJSON[key][pricingMode] !== undefined) {
              prices[key] = { price: pricesJSON[key][pricingMode] };
            } else {
              prices[key] = { price: null };
              console.log(key);
            }
          }
        } else if (provider === pricingProviders.lootfarm.name
          || provider === pricingProviders.csgotm.name
          || provider === pricingProviders.csgoempire.name
          || provider === pricingProviders.swapgg.name
          || provider === pricingProviders.youpin.name) {
          for (const key of keys) {
            prices[key] = { price: pricesJSON[key] };
          }
        } else if (provider === pricingProviders.csmoney.name
          || provider === pricingProviders.csgotrader.name
          || provider === pricingProviders.cstrade.name
          || provider === pricingProviders.csfloat.name
          || provider === pricingProviders.lisskins.name) {
          for (const key of keys) {
            if (pricesJSON[key].doppler !== undefined) {
              prices[key] = {
                price: pricesJSON[key].price,
                doppler: pricesJSON[key].doppler,
              };
            } else prices[key] = { price: pricesJSON[key].price };
          }
        } else if (provider === pricingProviders.buff163.name) {
          for (const key of keys) {
            if (pricesJSON[key][mode] !== undefined) {
              if (pricesJSON[key][mode].doppler !== undefined) {
                prices[key] = {
                  price: pricesJSON[key][mode].price,
                  doppler: pricesJSON[key][mode].doppler,
                };
              } else prices[key] = { price: pricesJSON[key][mode].price };
            } else {
              prices[key] = { price: null };
              console.log(key);
            }
          }
        }
        chrome.storage.local.set({ prices }, () => { });
      }
    }).catch((err) => { console.log(err); });
  });
};

const updateExchangeRates = () => {
  const request = new Request('https://prices.csgotrader.app/latest/exchange_rates.json');

  fetch(request).then((response) => {
    if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    return response.json();
  }).then((exchangeRatesJSON) => {
    chrome.storage.local.set({ exchangeRates: exchangeRatesJSON }, () => { });
    chrome.storage.local.get('currency', ({ currency }) => {
      chrome.storage.local.set({ exchangeRate: exchangeRatesJSON[currency] }, () => { });
    });
  }).catch((err) => { console.log(err); });
};

const getPrice = (marketHashName, dopplerInfo, prices, provider, mode, exchangeRate, currency) => {
  let price = 0.0;
  if (prices[marketHashName] !== undefined && prices[marketHashName] !== 'null'
    && prices[marketHashName] !== null && prices[marketHashName].price !== undefined
    && prices[marketHashName].price !== 'null') {
    // csgotrader, csmoney and buff have doppler phase prices so they are handled differently
    if ((provider === pricingProviders.csgotrader.name || provider === pricingProviders.csmoney.name
      || provider === pricingProviders.buff163.name || provider === pricingProviders.cstrade.name
      || provider === pricingProviders.csfloat.name
      || provider === pricingProviders.lisskins.name)) { // other providers have no doppler info
      if (dopplerInfo !== null) {
        // when there is price for the specific doppler phase take that
        if (prices[marketHashName].doppler !== undefined && prices[marketHashName].doppler
          !== 'null' && prices[marketHashName].doppler[dopplerInfo.name] !== 'null'
          && prices[marketHashName].doppler[dopplerInfo.name] !== undefined
          && prices[marketHashName].doppler[dopplerInfo.name] !== null) {
          price = (prices[marketHashName].doppler[dopplerInfo.name] * exchangeRate).toFixed(2);
        } else if (provider === pricingProviders.buff163.name
          && mode === pricingProviders.buff163.pricing_modes.starting_at.name) {
          price = 0.0;
        } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
      } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
    } else price = (prices[marketHashName].price * exchangeRate).toFixed(2);
  }
  return {
    price,
    display: price === 0.0 ? '' : currencies[currency].sign + price,
  };
};

const getStickerPriceTotal = (stickers, currency) => {
  let total = 0.0;
  if (stickers !== null) {
    stickers.forEach((sticker) => {
      if (sticker.price !== null) total += parseFloat(sticker.price.price);
    });
  }
  return total === 0
    ? null
    : { price: total, display: currencies[currency].sign + total.toFixed(2) };
};

const prettyPrintPrice = (currency, price) => {
  const nf = new Intl.NumberFormat();
  return price >= 0 ? currencies[currency].sign + nf.format(price) : `-${currencies[currency].sign}${nf.format(Math.abs(price))}`;
};

const getPriceAfterFees = (priceBeforeFees) => {
  const priceAfterFeesScript = `
        document.querySelector('body').setAttribute('priceAfterFees', GetItemPriceFromTotal(${DOMPurify.sanitize(priceBeforeFees)}, g_rgWalletInfo));`;
  return parseInt(injectScript(priceAfterFeesScript, true, 'priceAfterFeesScript', 'priceAfterFees'));
};

const userPriceToProperPrice = (userInput) => {
  const strippedFromExtraChars = userInput.replace(/[^0-9.,]/g, '');
  const splitChar = strippedFromExtraChars.includes('.')
    ? '.'
    : strippedFromExtraChars.includes(',')
      ? ','
      : '';
  if (splitChar === '') return parseInt(`${strippedFromExtraChars}00`); // whole number

  const parts = strippedFromExtraChars.split(splitChar);
  const wholePart = parts[0];
  let decimalPart = parts[1] === undefined ? '00' : parts[1];

  if (decimalPart.length === 1) decimalPart += '0'; // turns 0.3 into 0.30
  else if (decimalPart.length > 2) decimalPart = decimalPart.substr(0, 2); // turns 0.0003 into 0.00
  return parseInt(wholePart + decimalPart);
};

// converts cent integers to pretty formatted string
const centsToSteamFormattedPrice = (centsPrice) => {
  const intToFormattedScript = `document.querySelector('body').setAttribute('intToFormatted', v_currencyformat(${DOMPurify.sanitize(centsPrice.toString())}, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));`;
  return injectScript(intToFormattedScript, true, 'intToFormattedScript', 'intToFormatted');
};

// to convert the formatted price string
// that the price overview api call returns to cent int (for market listing)
const steamFormattedPriceToCents = (formattedPrice) => {
  const formattedToIntScript = `document.querySelector('body').setAttribute('formattedToInt', GetPriceValueAsInt('${DOMPurify.sanitize(formattedPrice).toString()}'));`;
  return injectScript(formattedToIntScript, true, 'formattedToIntScript', 'formattedToInt');
};

const getUserCurrencyBestGuess = () => new Promise((resolve) => {
  const getRequest = new Request('https://steamcommunity.com/market/');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      resolve(currencies.USD.short);
    }
    return response.text();
  }).then((body) => {
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
  }).catch((err) => {
    console.log(err);
    resolve(currencies.USD.short);
  });
});

const addRealTimePriceIndicator = (itemElement, price, showContrastingLook) => {
  const contrastingLookClass = showContrastingLook ? 'contrastingBackground' : '';

  itemElement.insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(`<div class="realTimePriceIndicator ${contrastingLookClass}">${price}</div>`),
  );
};

const addRealTimePriceToPage = (
  marketHashName, price, appID, assetID, contextID, type, showContrastingLook,
) => {
  const itemElement = findElementByIDs(appID, contextID, assetID, type);

  // the steam wallet global var is not defined in the trade offer page
  // this is a workaround to that
  if (type.includes('offers')) {
    chrome.storage.local.get(['userSteamWalletCurrency'], ({ userSteamWalletCurrency }) => {
      addRealTimePriceIndicator(
        itemElement,
        price !== null ? prettyPrintPrice(userSteamWalletCurrency, (price / 100).toFixed(2)) : 'No Data',
        showContrastingLook,
      );
    });
  } else {
    addRealTimePriceIndicator(
      itemElement,
      price !== null ? centsToSteamFormattedPrice(price) : 'No Data',
      showContrastingLook,
    );
  }
  itemElement.setAttribute(
    'data-realtime-price',
    price !== null ? price.toString() : '0',
  );
};

const updateWalletCurrency = () => {
  const walletCurrency = getSteamWalletCurrency();
  chrome.storage.local.set({
    userSteamWalletCurrency: (walletCurrency !== 'Unknown' && walletCurrency !== undefined && walletCurrency !== null) ? walletCurrency : currencies.USD.short,
  });
};

export {
  updatePrices, updateExchangeRates, getPrice, getUserCurrencyBestGuess,
  getStickerPriceTotal, prettyPrintPrice, getPriceOverview,
  getPriceAfterFees, userPriceToProperPrice, centsToSteamFormattedPrice,
  steamFormattedPriceToCents, priceQueue, workOnPriceQueue,
  getSteamWalletCurrency, getSteamWalletInfo,
  addRealTimePriceIndicator, initPriceQueue,
  addRealTimePriceToPage, updateWalletCurrency, getOrderBook,
};
