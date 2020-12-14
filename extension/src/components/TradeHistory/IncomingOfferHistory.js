import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeOffers } from 'utils/IEconService';
import TradeOfferContent from 'components/TradeHistory/TradeOfferContent';
import { getPlayerSummaries } from 'utils/ISteamUser';
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { offerStates } from 'utils/static/offers';
import { isDopplerInName } from '../../utils/simpleUtils';
import { getDopplerInfo } from '../../utils/utilsModular';
import { getPrice, prettyPrintPrice } from '../../utils/pricing';

const IncomingOfferHistory = () => {
  document.title = 'Incoming Offer History';
  trackEvent({
    type: 'pageview',
    action: 'ExtensionIncomingOfferHistoryView',
  });

  const [offers, setOffers] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [currentPageOffers, setCurrentPageOffers] = useState(null);

  const loadOffers = () => {
    getTradeOffers(0, 1, 0, 1)
      .then((offersResponse) => {
        const nonActiveOffers = [];
        offersResponse.trade_offers_received.forEach((offer) => {
          if (offer.trade_offer_state && offer.trade_offer_state !== offerStates[2].key) {
            nonActiveOffers.push(offer);
          }
        });
        setDescriptions(offersResponse.descriptions);
        setOffers(nonActiveOffers);
        setTotalOffers(nonActiveOffers.length);
      })
      .catch((err) => {
        console.log(err);
        setError('Could not load your offer history, Steam might be done or you don\'t have your API key set.');
      });
  };

  const loadNextBatch = () => {
    setCurrentIndex(currentIndex + 50);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    if (offers.length > 0) {
      const currentBatch = [...offers].splice(currentIndex, 50);
      const partnerIDs = [];

      currentBatch.forEach((offer) => {
        if (offer.accountid_other) {
          partnerIDs.push(getProperStyleSteamIDFromOfferStyle(offer.accountid_other));
        }
      });

      const uniquePartnerIDs = [...new Set(partnerIDs)];

      chrome.storage.local.get(['apiKeyValid', 'steamAPIKey', 'prices', 'pricingProvider', 'currency', 'exchangeRate'],
        ({
          prices, pricingProvider, pricingMode, currency, exchangeRate,
        }) => {
          getPlayerSummaries(uniquePartnerIDs).then((summaries) => {
            const offersWithDetails = [];
            currentBatch.forEach((offer) => {
              const offerWithDesc = {
                ...offer,
                receivedTotal: 0.0,
                givenTotal: 0.0,
                partnerSummary:
                  summaries[getProperStyleSteamIDFromOfferStyle(offer.accountid_other)],
              };
              offerWithDesc.assets_received_desc = [];
              offerWithDesc.assets_given_desc = [];

              if (offer.items_to_receive) {
                offer.items_to_receive.forEach((received) => {
                  const description = descriptions.filter((desc) => {
                    return desc.appid === received.appid && desc.classid === received.classid
                      && desc.instanceid === received.instanceid;
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
                  }
                });
              }

              if (offer.items_to_give) {
                offer.items_to_give.forEach((given) => {
                  const description = descriptions.filter((desc) => {
                    return desc.appid === given.appid && desc.classid === given.classid
                      && desc.instanceid === given.instanceid;
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
                  }
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

              offersWithDetails.push(offerWithDesc);
            });
            console.log(offersWithDetails);
            setCurrentPageOffers(offersWithDetails);
          }).catch((err) => {
            console.log(err);
          });
        });
    }
  }, [offers, currentIndex]);

  return (
    <div className="container">
      <div className="trade-history">
        <h1 className="trade-history__headline clearfix">
          Incoming Offer History (
          { totalOffers }
          )
        </h1>
        {
          error === null
            ? <TradeOfferContent trades={currentPageOffers} type="offer" loadNextBatch={loadNextBatch} />
            : <div className="warning">{error}</div>
        }
      </div>
    </div>
  );
};

export default IncomingOfferHistory;
