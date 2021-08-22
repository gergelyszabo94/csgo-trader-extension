import React from 'react';
import { eventTypes } from 'utils/static/friendRequests';

interface HistoryEventProps {
    eventType: string;
    ruleApplied: number;
}

const HistoryEvent = ({ eventType, ruleApplied }: HistoryEventProps) => {
    return (
        <span title={eventTypes[eventType].description}>
            {eventTypes[eventType].pretty}
            {ruleApplied !== undefined && ruleApplied !== 0 ? ` by rule ${ruleApplied}` : ''}
        </span>
    );
};

export default HistoryEvent;
