import React from 'react';

const HistoryEvent = ({ eventType }) => {
  switch (eventType) {
    case 'new': {
      return (
        <span title="New invite spotted by the extension">
          New Invite
        </span>
      );
    }
    case 'disappeared': {
      return (
        <span title="The invite was either canceled or accepted / ignored / blocked by you">
          Invite Disappeared
        </span>
      );
    }
    default: {
      return (
        <span title="Something went wrong, I don't recognize this event">
          Unknown Event
        </span>
      );
    }
  }
};

export default HistoryEvent;
