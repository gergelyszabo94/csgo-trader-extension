import React from 'react';
import TradeOffers from 'components/TradeHistory/TradeOffers';
import OfferHistoryContent from 'components/TradeHistory/OfferHistoryContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import Spinner from 'components/Spinner/Spinner';

const TradeOfferContent = ({ trades, type, loadNextBatch }) => {
    return trades !== null ? (
        <>
            <TypeSwitch trades={trades} type={type} />
            <div className='text-center'>
                <CustomA11yButton title='Load more' action={loadNextBatch} id='loadMore'>
                    <FontAwesomeIcon icon={faEllipsisH} />
                </CustomA11yButton>
            </div>
        </>
    ) : (
        <Spinner />
    );
};

const TypeSwitch = ({ trades, type }) => {
    return type === 'history' ? (
        <TradeOffers trades={trades} />
    ) : (
        <OfferHistoryContent offers={trades} />
    );
};

export default TradeOfferContent;
