import React from 'react';
import Row from 'components/Options/Row';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from 'components/Options/Category/Category';
import OfferHistory from './OfferHistory';

const OfferAutomation = () => {
  return (
    <Category title="Trade Offer Automation (BETA)">
      <Row
        name="Monitor Incoming offers"
        id="monitorIncomingOffers"
        type="flipSwitchStorage"
        description={(
          <>
            Monitors incoming offers and evaluates the automation rules
            <ApiKeyIndicator />
          </>
        )}
      />
      <div className="row">
        <OfferHistory />
      </div>
    </Category>
  );
};

export default OfferAutomation;
