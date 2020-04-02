import React from 'react';
import { eventTypes } from 'utils/static/friendRequests';

const HistoryEvent = ({ eventType }) => {
  return (
    <span title={eventTypes[eventType].description}>
      {eventTypes[eventType].pretty}
    </span>
  );
};

export default HistoryEvent;
