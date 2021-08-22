import { getPlayerSummaries } from 'utils/ISteamUser';
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { isDopplerInName, getFormattedPLPercentage } from '../../utils/simpleUtils';
import { getDopplerInfo } from '../../utils/utilsModular';
import { getPrice, prettyPrintPrice } from '../../utils/pricing';

const addOfferDetails = (offers, descriptions, currentIndex) => {
    const currentBatch = [...offers].splice(currentIndex, 50);
    const partnerIDs = [];

    currentBatch.forEach((offer) => {
        if (offer.accountid_other) {
            partnerIDs.push(getProperStyleSteamIDFromOfferStyle(offer.accountid_other));
        }
    });

    const uniquePartnerIDs = [...new Set(partnerIDs)];

    return new Promise((resolve, reject) => {
        chrome.storage.local.get(
            ['apiKeyValid', 'steamAPIKey', 'prices', 'pricingProvider', 'currency', 'exchangeRate'],
            ({ prices, pricingProvider, pricingMode, currency, exchangeRate }) => {
                getPlayerSummaries(uniquePartnerIDs)
                    .then((summaries) => {
                        const offersWithDetails = [];
                        currentBatch.forEach((offer) => {
                            const partnerSummary =
                                summaries[getProperStyleSteamIDFromOfferStyle(offer.accountid_other)] !== undefined
                                    ? summaries[getProperStyleSteamIDFromOfferStyle(offer.accountid_other)]
                                    : {
                                          personaname: 'No name found',
                                      };
                            const offerWithDesc = {
                                ...offer,
                                receivedTotal: 0.0,
                                givenTotal: 0.0,
                                partnerSummary,
                            };
                            offerWithDesc.assets_received_desc = [];
                            offerWithDesc.assets_given_desc = [];

                            if (offer.items_to_receive) {
                                offerWithDesc.itemsToReceiveWithoutDescriptions = 0;
                                offer.items_to_receive.forEach((received) => {
                                    const description = descriptions.filter((desc) => {
                                        return (
                                            desc.appid === received.appid &&
                                            desc.classid === received.classid &&
                                            desc.instanceid === received.instanceid
                                        );
                                    });
                                    if (description[0]) {
                                        const dopplerInfo = isDopplerInName(description[0].market_hash_name)
                                            ? getDopplerInfo(description[0].icon_url)
                                            : null;
                                        const price = getPrice(
                                            description[0].market_hash_name,
                                            dopplerInfo,
                                            prices,
                                            pricingProvider,
                                            pricingMode,
                                            exchangeRate,
                                            currency,
                                        );
                                        offerWithDesc.receivedTotal += parseFloat(price.price);
                                        offerWithDesc.assets_received_desc.push({
                                            ...received,
                                            ...description[0],
                                            dopplerInfo,
                                            price,
                                        });
                                    } else offerWithDesc.itemsToReceiveWithoutDescriptions += 1;
                                });
                            }

                            if (offer.items_to_give) {
                                offerWithDesc.itemsGivenWithoutDescriptions = 0;
                                offer.items_to_give.forEach((given) => {
                                    const description = descriptions.filter((desc) => {
                                        return (
                                            desc.appid === given.appid &&
                                            desc.classid === given.classid &&
                                            desc.instanceid === given.instanceid
                                        );
                                    });
                                    if (description[0]) {
                                        const dopplerInfo = isDopplerInName(description[0].market_hash_name)
                                            ? getDopplerInfo(description[0].icon_url)
                                            : null;
                                        const price = getPrice(
                                            description[0].market_hash_name,
                                            dopplerInfo,
                                            prices,
                                            pricingProvider,
                                            pricingMode,
                                            exchangeRate,
                                            currency,
                                        );
                                        offerWithDesc.givenTotal += parseFloat(price.price);
                                        offerWithDesc.assets_given_desc.push({
                                            ...given,
                                            ...description[0],
                                            dopplerInfo,
                                            price,
                                        });
                                    } else offerWithDesc.itemsGivenWithoutDescriptions += 1;
                                });
                            }

                            offerWithDesc.profitLoss = offerWithDesc.receivedTotal - offerWithDesc.givenTotal;
                            offerWithDesc.receivedTotalFormatted = prettyPrintPrice(
                                currency,
                                offerWithDesc.receivedTotal.toFixed(2),
                            );
                            offerWithDesc.givenTotalFormatted = prettyPrintPrice(
                                currency,
                                offerWithDesc.givenTotal.toFixed(2),
                            );
                            offerWithDesc.profitLossFormatted = prettyPrintPrice(
                                currency,
                                offerWithDesc.profitLoss.toFixed(2),
                            );
                            offerWithDesc.PLPercentageFormatted = getFormattedPLPercentage(
                                offerWithDesc.givenTotal,
                                offerWithDesc.receivedTotal,
                            );
                            offersWithDetails.push(offerWithDesc);
                        });
                        resolve(offersWithDetails);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            },
        );
    });
};

export default addOfferDetails;
