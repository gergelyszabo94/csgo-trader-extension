import CustomA11yButton from 'components/CustomA11yButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OfferHistoryContent from 'components/TradeHistory/OfferHistoryContent';
import React from 'react';
import Spinner from 'components/Spinner';
import TradeOffers from 'components/TradeHistory/TradeOffers';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

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
    return type === 'history' ? <TradeOffers trades={trades} /> : <OfferHistoryContent offers={trades} />;
};

export default TradeOfferContent;
