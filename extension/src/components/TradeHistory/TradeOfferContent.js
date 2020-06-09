import React from 'react';
import TradeOffers from 'components/TradeHistory/TradeOffers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import Spinner from 'components/Spinner/Spinner';

const TradeOfferContent = ({ trades, loadNextBatch }) => {
  return trades !== null
    ? (
      <>
        <TradeOffers trades={trades} />
        <div className="text-center">
          <CustomA11yButton
            title="Load more"
            action={loadNextBatch}
            id="loadMore"

          >
            <FontAwesomeIcon
              icon={faEllipsisH}
            />
          </CustomA11yButton>
        </div>
      </>
    )
    : <Spinner />;
};

export default TradeOfferContent;
