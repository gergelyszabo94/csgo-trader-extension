import { getFloatInfoFromCache } from 'utils/floatCaching';
import { getPrice, getStickerPriceTotal } from 'utils/pricing';
import itemTypes from 'utils/static/itemTypes';
import { getPattern, parseStickerInfo } from 'utils/utilsModular';

const addPricesAndFloatsToInventory = (inventory) =>
    new Promise((resolve) => {
        chrome.storage.local.get(
            ['prices', 'exchangeRate', 'currency', 'itemPricing', 'pricingProvider', 'pricingMode'],
            ({ prices, exchangeRate, currency, itemPricing, pricingProvider, pricingMode }) => {
                if (itemPricing) {
                    let total = 0.0;
                    const floatCacheAssetIDs = inventory.map((item) => {
                        return item.assetid;
                    });
                    getFloatInfoFromCache(floatCacheAssetIDs).then((floatCache) => {
                        inventory.forEach((item) => {
                            if (
                                prices[item.market_hash_name] !== undefined &&
                                prices[item.market_hash_name] !== 'null'
                            ) {
                                item.price = getPrice(
                                    item.market_hash_name,
                                    item.dopplerInfo,
                                    prices,
                                    pricingProvider,
                                    pricingMode,
                                    exchangeRate,
                                    currency,
                                );
                                total += parseFloat(item.price.price);
                            }
                            if (
                                floatCache[item.assetid] !== undefined &&
                                floatCache[item.assetid] !== null &&
                                itemTypes[item.type.key].float
                            ) {
                                item.floatInfo = floatCache[item.assetid];
                                item.patternInfo = getPattern(
                                    item.market_hash_name,
                                    item.floatInfo.paintSeed,
                                );
                            }
                            const stickers = parseStickerInfo(
                                item.descriptions,
                                'direct',
                                prices,
                                pricingProvider,
                                pricingMode,
                                exchangeRate,
                                currency,
                            );
                            const stickerPrice = getStickerPriceTotal(stickers, currency);
                            item.stickers = stickers;
                            item.stickerPrice = stickerPrice;
                        });
                        resolve({
                            items: inventory,
                            total,
                        });
                    });
                } else {
                    resolve({
                        items: inventory,
                        total: null,
                    });
                }
            },
        );
    });

export default addPricesAndFloatsToInventory;
