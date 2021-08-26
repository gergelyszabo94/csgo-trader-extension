import React, { useEffect, useState } from 'react';

import { getTradeOffers } from 'utils/IEconService';
import { trackEvent } from 'utils/analytics';
import { offerStates } from 'utils/static/offers';

import addItemDetails from './addItemDetails';

import TradeOfferHistoryHeader from 'components/TradeHistory/TradeOfferHistoryHeader';

const IncomingOfferHistory = async () => {
    document.title = 'Incoming Offer History';
    await trackEvent({
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
        getTradeOffers(0, 1, 1, 0, 1)
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
                setError("Could not load your offer history, Steam might be down or you don't have your API key set.");
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
            addItemDetails(offers, descriptions, currentIndex)
                .then((offersWithDetails) => {
                    setCurrentPageOffers(offersWithDetails);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [offers, currentIndex]);

    return (
        <TradeOfferHistoryHeader
            type='Incoming'
            totalOffers={totalOffers}
            error={error}
            currentPageOffers={currentPageOffers}
            loadNextBatch={loadNextBatch}
        />
    );
};

export default IncomingOfferHistory;
