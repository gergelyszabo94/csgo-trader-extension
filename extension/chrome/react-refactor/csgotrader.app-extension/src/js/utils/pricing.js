import { pricingProviders, currencies } from "js/utils/static/pricing";

const updatePrices = () => {
    chrome.storage.local.get(['itemPricing', 'pricingProvider', 'pricingMode'], (result) => {
        const provider = result.pricingProvider;
        const mode = result.pricingMode;
        const headers = new Headers();

        headers.append('Accept-Encoding', 'gzip');
        const init = { method: 'GET',
            headers: headers,
            mode: 'cors',
            cache: 'default' };

        const request = new Request(`https://prices.csgotrader.app/latest/${provider}.json`, init);
        fetch(request).then((response) => {
            if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return response.json();
        }).then((pricesJSON) => {
            if(result.itemPricing) {
                let prices = {};
                const keys = Object.keys(pricesJSON);

                if (provider === pricingProviders.steam.name || provider === pricingProviders.bitskins.name) {
                    let pricingMode = mode;
                    if (mode === pricingProviders.bitskins.pricing_modes.bitskins.name) pricingMode = 'price';
                    else if (mode === pricingProviders.bitskins.pricing_modes.instant_sale.name) pricingMode = 'instant_sale_price';

                    for (const key of keys) {
                        if (pricesJSON[key][pricingMode] !== undefined) {
                            prices[key] = {'price': pricesJSON[key][pricingMode]};
                        }
                        else {
                            prices[key] = {'price': 'null'};
                            console.log(key);
                        }
                    }
                }
                else if (provider === pricingProviders.lootfarm.name || provider === pricingProviders.csgotm.name) {
                    for (const key of keys) {
                        prices[key] = {'price': pricesJSON[key]};
                    }
                }
                else if (provider === pricingProviders.csmoney.name || provider === pricingProviders.csgotrader.name) {
                    for (const key of keys) {
                        if (pricesJSON[key]['doppler'] !== undefined) {
                            prices[key] = {
                                price: pricesJSON[key]['price'],
                                doppler: pricesJSON[key]['doppler']
                            };
                        }
                        else prices[key] = {price: pricesJSON[key]['price']};
                    }
                }
                chrome.storage.local.set({prices: prices}, () => {});
            }
        }).catch((err) => {console.log(err)});

    });
};

const updateExchangeRates = () => {
    const request = new Request('https://prices.csgotrader.app/latest/exchange_rates.json');

    fetch(request).then((response) => {
        if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        return response.json();
    }).then((exchangeRatesJSON) => {
        chrome.storage.local.set({exchangeRates: exchangeRatesJSON}, () =>{});
        chrome.storage.local.get('currency', (result) => {chrome.storage.local.set({exchangeRate: exchangeRatesJSON[result.currency]}, () => {})});
    }).catch((err) => {console.log(err)});
};

const getPrice = (market_hash_name, dopplerInfo, prices, provider, exchange_rate, currency) => {
    let price = 0.0;
    if (prices[market_hash_name] !== undefined && prices[market_hash_name] !== 'null' && prices[market_hash_name] !== null && prices[market_hash_name]['price'] !== undefined && prices[market_hash_name]['price'] !== 'null') {
        // csgotrader and csmoney have doppler phase prices so they are handled differently
        if ((provider === pricingProviders.csgotrader.name || provider === pricingProviders.csmoney.name)) {
            if (dopplerInfo !== null) {
                // when there is price for the specific doppler phase take that
                if (prices[market_hash_name]['doppler'] !== undefined && prices[market_hash_name]['doppler'] !== 'null' && prices[market_hash_name]['doppler'][dopplerInfo.name] !== 'null' && prices[market_hash_name]['doppler'][dopplerInfo.name] !== undefined) {
                    price = (prices[market_hash_name]['doppler'][dopplerInfo.name] * exchange_rate).toFixed(2);
                }
                else price = (prices[market_hash_name]['price'] * exchange_rate).toFixed(2);
            }
            else price = (prices[market_hash_name]['price'] * exchange_rate).toFixed(2);
        }
        // other providers have no doppler phase info
        else price = (prices[market_hash_name]['price'] * exchange_rate).toFixed(2);
    }
    return {
        price: price,
        display: price === 0.0 ? '' : currencies[currency].sign + price
    };
};

const getStickerPriceTotal = (stickers, currency) => {
    let total = 0.0;
    if (stickers !== null) {
        stickers.forEach((sticker) => {
            if (sticker.price !== null) total += parseFloat(sticker.price.price);
        });
    }
    return total === 0 ? null : {price: total, display: currencies[currency].sign + total.toFixed(2)};
};

const prettyPrintPrice = (currency, price) => {
    const nf = new Intl.NumberFormat();
    return price >= 0 ? currencies[currency].sign + nf.format(price) : `-${currencies[currency].sign}${nf.format(Math.abs(price))}`;
};

export { updatePrices, updateExchangeRates, getPrice, getStickerPriceTotal, prettyPrintPrice }