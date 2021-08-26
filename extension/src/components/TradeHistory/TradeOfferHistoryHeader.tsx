import React from 'react';

import TradeOfferContent from 'components/TradeHistory/TradeOfferContent';

const TradeOfferHistoryHeader = ({ type, totalOffers, error, currentPageOffers, loadNextBatch }) => {
    return (
        <div className='container'>
            <div className='trade-history'>
                <h1 className='trade-history__headline clearfix'>
                    {type}
                    &nbsp;Offer History BETA ({totalOffers})
                </h1>
                <p>
                    Unfortunately the Steam API does not return the details (names, images) of some items. I will try to
                    address this in the future.
                </p>
                {error === null ? (
                    <TradeOfferContent trades={currentPageOffers} type='offer' loadNextBatch={loadNextBatch} />
                ) : (
                    <div className='warning'>{error}</div>
                )}
            </div>
        </div>
    );
};

export default TradeOfferHistoryHeader;
