import React from 'react';

import { getOfferLink } from 'utils/simpleUtils';
import { eventTypes } from 'utils/static/offers';

import NewTabLink from 'components/NewTabLink';

interface HistoryEventProps {
    eventType: string;
    ruleApplied: number;
    offerID: string;
}

const HistoryEvent = ({ eventType, ruleApplied, offerID }: HistoryEventProps) => {
    return (
        <NewTabLink to={getOfferLink(offerID)}>
            <span title={eventTypes[eventType].description}>
                {eventTypes[eventType].pretty}
                {eventType !== eventTypes.new.key ? ` by rule ${ruleApplied}` : ''}
            </span>
        </NewTabLink>
    );
};

export default HistoryEvent;
