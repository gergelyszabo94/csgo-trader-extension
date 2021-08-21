import NewTabLink from 'components/NewTabLink';
import React from 'react';
import { eventTypes } from 'utils/static/offers';
import { getOfferLink } from 'utils/simpleUtils';

const HistoryEvent = ({ eventType, ruleApplied, offerID }) => {
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
