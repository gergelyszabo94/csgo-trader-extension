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

export { updatePrices }