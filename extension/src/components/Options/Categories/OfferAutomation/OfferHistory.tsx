import IncomingOfferHistory from './IncomingOfferHistory';
import OfferRules from './OfferRules';
import React from 'react';

const OfferHistory = (): JSX.Element => {
    return (
        <>
            <OfferRules />
            <IncomingOfferHistory />
        </>
    );
};

export default OfferHistory;
