import {
  currencies,
  pricingProviders,
  realTimePricingModes,
  steamCurrencyCodes,
} from 'utils/static/pricing';

import DOMPurify from 'dompurify';
import { findElementByIDs } from 'utils/itemsToElementsToItems';
import { getItemMarketLink } from 'utils/simpleUtils';
import { injectScript } from 'utils/injection';
import { storageKeys } from 'utils/static/storageKeys';

const priceQueue = {
  active: false,
  jobs: [],
  delaySuccess: storageKeys.realTimePricesFreqSuccess,
  delayFailure: storageKeys.realTimePricesFreqFailure,
  lastJobSuccessful: true,
  localCache: {},
  cleanupFunction: () => {}, // optional function that is executed when all jobs are done
};

// tested and works in inventories, offers and market pages
// does not work on profiles and incoming offers page
const getSteamWalletInfo = () => {
  const getWalletInfoScript = 'document.querySelector(\'body\').setAttribute(\'steamWallet\', JSON.stringify(g_rgWalletInfo));';
  return JSON.parse(injectScript(getWalletInfoScript, true, 'steamWalletScript', 'steamWallet'));
};

const initPriceQueue = (cleanupFunction) => {
  chrome.storage.local.get(
    ['realTimePricesFreqSuccess', 'realTimePricesFreqFailure'],
    ({ realTimePricesFreqSuccess, realTimePricesFreqFailure }) => {
      priceQueue.delaySuccess = realTimePricesFreqSuccess;
      priceQueue.delayFailure = realTimePricesFreqFailure;
      priceQueue.cleanupFunction = cleanupFunction !== undefined ? cleanupFunction : () => {};
    },
  );
};

const getSteamWalletCurrency = () => {
  const getCurrencyScript = `
  document.querySelector('body').setAttribute('steamWalletCurrency', GetCurrencyCode(${DOMPurify.sanitize(getSteamWalletInfo().wallet_currency)}));
  `;
  return injectScript(getCurrencyScript, true, 'steamWalletCurrencyScript', 'steamWalletCurrency');
};

const getHighestBuyOrder = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['currency'], ({ currency }) => {
      const steamWalletInfo = getSteamWalletInfo();
      let currencyID = 1;
      if (steamWalletInfo !== null) currencyID = steamWalletInfo.wallet_currency;
      else {
        for (const [code, short] of Object.entries(steamCurrencyCodes)) {
          if (short === currency) currencyID = code;
        }
      }
      chrome.runtime.sendMessage(
        { getBuyOrderInfo: { appID, currencyID, marketHashName } }, (response) => {
          if (response !== 'error') resolve(response.getBuyOrderInfo.highest_buy_order);
          else reject('error');
        },
      );
    });
  });
};

const getPriceOverview = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    const currencyID = getSteamWalletInfo().wallet_currency;
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

const getLowestListingPrice = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['currency'], ({ currency }) => {
      const steamWalletInfo = getSteamWalletInfo();
      let currencyID = 1;
      if (steamWalletInfo !== null) currencyID = steamWalletInfo.wallet_currency;
      else {
        for (const [code, short] of Object.entries(steamCurrencyCodes)) {
          if (short === currency) currencyID = code;
        }
      }
      const request = new Request(
        `${getItemMarketLink(appID, marketHashName)}/render/?query=&start=0&count=10&country=US&language=english&currency=${currencyID}`,
      );

      fetch(request).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject({ status: response.status, statusText: response.statusText });
        }
        return response.json();
      }).then((listingsJSONData) => {
        if (listingsJSONData === null) reject('success:false');
        else if (listingsJSONData.success === true) {
          if (listingsJSONData.listinginfo) {
            const listingInfo = Object.values(listingsJSONData.listinginfo);
            if (listingInfo.length !== 0) {
              for (const listing of listingInfo) {
                if (listing.converted_price !== undefined && listing.converted_fee !== undefined) {
                  resolve(listing.converted_price + listing.converted_fee);
                  return;
                }
              }
              reject('no_prices_on_listings');
            } else reject('empty_listings_array'); // no listings at all on the market
          } else reject('no listing data');
          resolve(listingsJSONData);
        } else reject('success:false');
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
};

const getMidPrice = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    getHighestBuyOrder(appID, marketHashName).then((highestBuyOrder) => {
      if (highestBuyOrder !== undefined && highestBuyOrder !== null) {
        let highestOrderPrice = 0;
        try {
          highestOrderPrice = parseFloat(highestBuyOrder);
        } catch (e) {
          // most likely there aren't any orders
          console.log(e);
        }
        getLowestListingPrice(appID, marketHashName).then((lowestListing) => {
          if (lowestListing !== undefined) {
            resolve((highestOrderPrice + lowestListing) / 2);
          }
        }).catch((err) => {
          console.log(err);
          reject(err);
        });
      } else reject('highest_order_undef_or_null');
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
            if (job.type === 'my_buy_order' || job.type === 'inventory_mass_sell_instant_sell'
              || job.type === `offer_${realTimePricingModes.bid_price.key}`
              || job.type === `offers_${realTimePricingModes.bid_price.key}`
              || job.type === `inventory_${realTimePricingModes.bid_price.key}`) {
              if (priceQueue.localCache[
                job.appID + job.market_hash_name + job.type
              ] !== undefined) {
                if (job.type === 'my_buy_order') job.callBackFunction(job, priceQueue.localCache[job.appID + job.market_hash_name + job.type]);
                else if (job.type === 'inventory_mass_sell_instant_sell'
                  || job.type === `offer_${realTimePricingModes.highest_order.key}`) {
                  job.callBackFunction(
                    job.market_hash_name,
                    priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                    job.appID,
                    job.assetID,
                    job.contextID,
                  );
                }
                priceQueueCacheHit();
              } else {
                getHighestBuyOrder(job.appID, job.market_hash_name).then(
                  (highestBuyOrder) => {
                    if (highestBuyOrder !== undefined) {
                      if (job.type === 'my_buy_order') job.callBackFunction(job, highestBuyOrder);
                      else if (job.type === 'inventory_mass_sell_instant_sell'
                        || job.type === `offer_${realTimePricingModes.bid_price.key}`) {
                        job.callBackFunction(
                          job.market_hash_name,
                          highestBuyOrder,
                          job.appID,
                          job.assetID,
                          job.contextID,
                        );
                      }
                      priceQueue.localCache[
                        job.appID + job.market_hash_name + job.type
                      ] = highestBuyOrder;
                      priceQueueSuccess();
                    } else priceQueueFailure('highestBuyOrder is undefined', job);
                  }, (error) => {
                    priceQueueFailure(error, job);
                  },
                );
              }
            } else if (job.type === 'inventory_mass_sell_starting_at'
              || job.type === `offer_${realTimePricingModes.ask_price.key}`
              || job.type === `offers_${realTimePricingModes.ask_price.key}`
              || job.type === `inventory_${realTimePricingModes.ask_price.key}`
              || job.type === 'my_listing'
              || job.type === 'history_row') {
              if (priceQueue.localCache[
                job.appID + job.market_hash_name + job.type
              ] !== undefined) {
                if (job.type === 'my_listing') {
                  job.callBackFunction(
                    job.listingID,
                    priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                  );
                } else if (job.type === 'history_row') {
                  job.callBackFunction(
                    job.rowID,
                    priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                  );
                } else {
                  job.callBackFunction(
                    job.market_hash_name,
                    priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                    job.appID,
                    job.assetID,
                    job.contextID,
                  );
                }
                priceQueueCacheHit();
              } else {
                getLowestListingPrice(job.appID, job.market_hash_name).then(
                  (lowestListingPrice) => {
                    if (lowestListingPrice !== undefined) {
                      if (job.type === 'my_listing') {
                        job.callBackFunction(
                          job.listingID,
                          lowestListingPrice,
                        );
                      } else if (job.type === 'history_row') {
                        job.callBackFunction(
                          job.rowID,
                          lowestListingPrice,
                        );
                      } else {
                        job.callBackFunction(
                          job.market_hash_name,
                          lowestListingPrice,
                          job.appID,
                          job.assetID,
                          job.contextID,
                          job.type,
                        );
                      }
                      priceQueue
                        .localCache[
                          job.appID + job.market_hash_name + job.type
                        ] = lowestListingPrice;
                      priceQueueSuccess();
                    } else priceQueueFailure('lowest_price is undefined', job);
                  }, (error) => {
                    priceQueueFailure(error, job);
                  },
                );
              }
            } else if (job.type === `offer_${realTimePricingModes.mid_price.key}`
              || job.type === `offers_${realTimePricingModes.mid_price.key}`
              || job.type === `inventory_${realTimePricingModes.mid_price.key}`
              || job.type === 'inventory_mass_sell_mid_price') {
              if (priceQueue.localCache[
                job.appID + job.market_hash_name + job.type
              ] !== undefined) {
                job.callBackFunction(
                  job.market_hash_name,
                  priceQueue.localCache[job.appID + job.market_hash_name + job.type],
                  job.appID,
                  job.assetID,
                  job.contextID,
                  job.type,
                );
                priceQueueCacheHit();
              } else {
                getMidPrice(job.appID, job.market_hash_name).then((midPrice) => {
                  job.callBackFunction(
                    job.market_hash_name,
                    midPrice,
                    job.appID,
                    job.assetID,
                    job.contextID,
                    job.type,
                  );
                  priceQueue.localCache[
                    job.appID + job.market_hash_name + job.type
                  ] = midPrice;
                  priceQueueSuccess();
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
          || provider === pricingProviders.csgoexo.name
          || provider === pricingProviders.skinwallet.name) {
          for (const key of keys) {
            prices[key] = { price: pricesJSON[key] };
          }
        } else if (provider === pricingProviders.csmoney.name
          || provider === pricingProviders.csgotrader.name
          || provider === pricingProviders.cstrade.name) {
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
        chrome.storage.local.set({ prices }, () => {});
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
    chrome.storage.local.set({ exchangeRates: exchangeRatesJSON }, () => {});
    chrome.storage.local.get('currency', ({ currency }) => {
      chrome.storage.local.set({ exchangeRate: exchangeRatesJSON[currency] }, () => {});
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
    || provider === pricingProviders.buff163.name)) { // other providers have no doppler info
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
  // TODO get the publisher fee dynamically
  const priceAfterFeesScript = `
        document.querySelector('body').setAttribute(
          'priceAfterFees',
          ${DOMPurify.sanitize(priceBeforeFees)} - CalculateFeeAmount( ${DOMPurify.sanitize(priceBeforeFees)}, g_rgWalletInfo['wallet_publisher_fee_percent_default'] ).fees);`;
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

const addRealTimePriceIndicator = (itemElement, price) => {
  itemElement.insertAdjacentHTML(
    'beforeend',
    DOMPurify.sanitize(`<div class="realTimePriceIndicator">${price}</div>`),
  );
};

const addRealTimePriceToPage = (marketHashName, price, appID, assetID, contextID, type) => {
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
    addRealTimePriceIndicator(
      itemElement,
      price !== null ? centsToSteamFormattedPrice(price) : 'No Data',
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
    userSteamWalletCurrency: (walletCurrency !== 'Unknown' && walletCurrency !== undefined) ? walletCurrency : currencies.USD.short,
  });
};

export {
  updatePrices, updateExchangeRates, getPrice, getUserCurrencyBestGuess,
  getStickerPriceTotal, prettyPrintPrice, getPriceOverview, getMidPrice,
  getPriceAfterFees, userPriceToProperPrice, centsToSteamFormattedPrice,
  steamFormattedPriceToCents, priceQueue, workOnPriceQueue,
  getHighestBuyOrder, getSteamWalletCurrency, getSteamWalletInfo,
  addRealTimePriceIndicator, initPriceQueue, getLowestListingPrice,
  addRealTimePriceToPage, updateWalletCurrency,
};
