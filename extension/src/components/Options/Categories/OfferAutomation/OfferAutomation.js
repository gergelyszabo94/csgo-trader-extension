import React from 'react';
import Row from 'components/Options/Row';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from 'components/Options/Category/Category';
import OfferHistory from './OfferHistory';

const OfferAutomation = () => {
  return (
    <Category title="Trade Offer Automation">
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
      <Row
        name="Send offers based on query params"
        id="sendOfferBasedOnQueryParams"
        type="flipSwitchStorage"
        description="Send trade offers based on query parameters. When turned on and you open a link with &csgotrader_send=appID_contextID_assetID in it the extension sends the offer automatically. Useful for P2P trading and automation."
      />
      <div className="row">
        <OfferHistory />
      </div>
    </Category>
  );
};

export default OfferAutomation;
