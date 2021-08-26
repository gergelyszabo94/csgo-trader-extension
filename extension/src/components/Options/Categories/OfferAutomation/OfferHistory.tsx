import React from 'react';

import IncomingOfferHistory from './IncomingOfferHistory';
import OfferRules from './OfferRules';

const OfferHistory = (): JSX.Element => {
    return (
        <>
            <OfferRules />
            <IncomingOfferHistory />
        </>
    );
};

export default OfferHistory;
