import React from 'react';
import { eventTypes } from 'utils/static/offers';

const HistoryEvent = ({ eventType, ruleApplied }) => {
  return (
    <span title={eventTypes[eventType].description}>
      {eventTypes[eventType].pretty}
      {(ruleApplied !== undefined && ruleApplied !== 0) ? ` by rule ${ruleApplied}` : ''}
    </span>
  );
};

export default HistoryEvent;
