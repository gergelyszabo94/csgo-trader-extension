import { pricingProviders, currencies } from 'utils/static/pricing';
import { injectScript } from 'utils/injection';

const priceQueue = {
  active: false,
  jobs: [],
  lastJobSuccessful: true,
  localCache: {},
};

// tested and works in inventories, offers and market pages
// does not work on profiles and incoming offers page
const getSteamWalletInfo = () => {
  const getWalletInfoScript = 'document.querySelector(\'body\').setAttribute(\'steamWallet\', JSON.stringify(g_rgWalletInfo));';
  return JSON.parse(injectScript(getWalletInfoScript, true, 'steamWalletScript', 'steamWallet'));
};

const getSteamWalletCurrency = () => {
  const getCurrencyScript = `document.querySelector('body').setAttribute('steamWalletCurrency', GetCurrencyCode(${getSteamWalletInfo().wallet_currency}));`;
  return injectScript(getCurrencyScript, true, 'steamWalletCurrencyScript', 'steamWalletCurrency');
};

const getHighestBuyOrder = (appID, marketHashName) => {
  return new Promise((resolve, reject) => {
    const currencyID = getSteamWalletInfo().wallet_currency;
    chrome.runtime.sendMessage(
      { getBuyOrderInfo: { appID, currencyID, marketHashName } }, (response) => {
        if (response !== 'error') resolve(response.getBuyOrderInfo.highest_buy_order);
        else reject('error');
      },
    );
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

const priceQueueFailure = (error, job) => {
  console.log(error, job);
  priceQueue.lastJobSuccessful = false;
  priceQueue.jobs.push({ ...job, retries: job.retries + 1 });
};

const workOnPriceQueue = () => {
  if (priceQueue.jobs.length !== 0) { // if there are no jobs then there is no recursion
    const delay = priceQueue.lastJobSuccessful ? 3000 : 15000;

    if (!priceQueue.active) { // only start the work if the queue is inactive at the moment
      priceQueue.active = true; // marks the queue active

      setTimeout(() => { // marks the queue inactive (ready for work) and starts the work again
        priceQueue.active = false;
        workOnPriceQueue();
      }, delay);

      const job = priceQueue.jobs.shift();

      if (job.retries < 5) { // limits the number of retries to avoid infinite loop
        if (job.type === 'my_listing') {
          // non-active listing pages are not kept in the DOM
          // so if you switch back pages the starting at prices have to be re-added
          // to avoid making additional requests
          // lowest prices are stored on a local only (exclusive to the current page) cache
          if (priceQueue.localCache[job.listingID] !== undefined) {
            job.callBackFunction(job.listingID, priceQueue.localCache[job.listingID]);
            priceQueue.active = false;
            workOnPriceQueue();
          } else {
            getPriceOverview(job.appID, job.market_hash_name).then(
              (priceOverview) => {
                priceQueue.lastJobSuccessful = true;
                if (priceOverview.lowest_price !== undefined) {
                  job.callBackFunction(job.listingID, priceOverview.lowest_price);
                  priceQueue.localCache[job.listingID] = priceOverview.lowest_price;
                }
              }, (error) => {
                priceQueueFailure(error, job);
              },
            );
          }
        } else if (job.type === 'my_buy_order' || job.type === 'inventory_mass_sell_instant_sell') {
          getHighestBuyOrder(job.appID, job.market_hash_name).then(
            (highestBuyOrder) => {
              if (highestBuyOrder !== undefined) {
                priceQueue.lastJobSuccessful = true;
                if (job.type === 'my_buy_order') job.callBackFunction(job, highestBuyOrder);
                else if (job.type === 'inventory_mass_sell_instant_sell') job.callBackFunction(job.market_hash_name, highestBuyOrder);
              } else priceQueueFailure('highestBuyOrder is undefined', job);
            }, (error) => {
              priceQueueFailure(error, job);
            },
          );
        } else if (job.type === 'inventory_mass_sell_starting_at') {
          getPriceOverview(job.appID, job.market_hash_name).then(
            (priceOverview) => {
              priceQueue.lastJobSuccessful = true;
              job.callBackFunction(job.market_hash_name, priceOverview.lowest_price);
            }, (error) => {
              priceQueueFailure(error, job);
            },
          );
        }
      }
    } else { // when there are jobs in the queue but work is already being done at the moment
      setTimeout(() => { workOnPriceQueue(); }, delay); // in this case is retries with a delay
    }
  } else priceQueue.active = false;
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
          || provider === pricingProviders.bitskins.name) {
          let pricingMode = mode;
          if (mode === pricingProviders.bitskins.pricing_modes.bitskins.name) pricingMode = 'price';
          else if (mode === pricingProviders.bitskins.pricing_modes.instant_sale.name) {
            pricingMode = 'instant_sale_price';
          }

          for (const key of keys) {
            if (pricesJSON[key][pricingMode] !== undefined) {
              prices[key] = { price: pricesJSON[key][pricingMode] };
            } else {
              prices[key] = { price: 'null' };
              console.log(key);
            }
          }
        } else if (provider === pricingProviders.lootfarm.name
          || provider === pricingProviders.csgotm.name) {
          for (const key of keys) {
            prices[key] = { price: pricesJSON[key] };
          }
        } else if (provider === pricingProviders.csmoney.name
          || provider === pricingProviders.csgotrader.name) {
          for (const key of keys) {
            if (pricesJSON[key].doppler !== undefined) {
              prices[key] = {
                price: pricesJSON[key].price,
                doppler: pricesJSON[key].doppler,
              };
            } else prices[key] = { price: pricesJSON[key].price };
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
    chrome.storage.local.get('currency', (result) => {
      chrome.storage.local.set({ exchangeRate: exchangeRatesJSON[result.currency] }, () => {});
    });
  }).catch((err) => { console.log(err); });
};

const getPrice = (marketHashName, dopplerInfo, prices, provider, exchangeRate, currency) => {
  let price = 0.0;
  if (prices[marketHashName] !== undefined && prices[marketHashName] !== 'null'
    && prices[marketHashName] !== null && prices[marketHashName].price !== undefined
    && prices[marketHashName].price !== 'null') {
    // csgotrader and csmoney have doppler phase prices so they are handled differently
    if ((provider === pricingProviders.csgotrader.name
      || provider === pricingProviders.csmoney.name)) { // other providers have no doppler info
      if (dopplerInfo !== null) {
        // when there is price for the specific doppler phase take that
        if (prices[marketHashName].doppler !== undefined && prices[marketHashName].doppler
          !== 'null' && prices[marketHashName].doppler[dopplerInfo.name] !== 'null'
          && prices[marketHashName].doppler[dopplerInfo.name] !== undefined) {
          price = (prices[marketHashName].doppler[dopplerInfo.name] * exchangeRate).toFixed(2);
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
        document.querySelector('body').setAttribute('priceAfterFees', ${priceBeforeFees} - CalculateFeeAmount( ${priceBeforeFees}, g_rgWalletInfo['wallet_publisher_fee_percent_default'] ).fees);`;
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
  const intToFormattedScript = `document.querySelector('body').setAttribute('intToFormatted', v_currencyformat(${centsPrice}, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));`;
  return injectScript(intToFormattedScript, true, 'intToFormattedScript', 'intToFormatted');
};

// to convert the formatted price string
// that the price overview api call returns to cent int (for market listing)
const steamFormattedPriceToCents = (formattedPrice) => {
  const formattedToIntScript = `document.querySelector('body').setAttribute('formattedToInt', GetPriceValueAsInt('${formattedPrice}'));`;
  return injectScript(formattedToIntScript, true, 'formattedToIntScript', 'formattedToInt');
};

export {
  updatePrices, updateExchangeRates, getPrice,
  getStickerPriceTotal, prettyPrintPrice, getPriceOverview,
  getPriceAfterFees, userPriceToProperPrice, centsToSteamFormattedPrice,
  steamFormattedPriceToCents, priceQueue, workOnPriceQueue,
  getHighestBuyOrder, getSteamWalletCurrency, getSteamWalletInfo,
};
