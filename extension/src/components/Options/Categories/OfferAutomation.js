import React from 'react';
import Row from 'components/Options/Row';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from '../Category/Category';

const OfferAutomation = () => {
  return (
    <Category title="Trade Offer">
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
    </Category>
  );
};

export default OfferAutomation;
