import React, { useState, useEffect } from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import HistoryEvent from './HistoryEvent';

const InviteHistory = () => {
  const [historyEvents, setHistoryEvents] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
      setHistoryEvents(friendRequestLogs.reverse());
    });
  }, []);

  return (
    <div className="col-6">
      <h5>Friend Request History</h5>
      <table className="inviteHistoryTable">
        <thead>
          <tr>
            <th>User</th>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {historyEvents.map((event) => {
            return (
              <tr key={event.steamID + event.type + event.timestamp}>
                <td>
                  <NewTabLink to={`https://steamcommunity.com/profiles/${event.steamID}`}>
                    {event.username}
                  </NewTabLink>
                </td>
                <td>
                  <HistoryEvent eventType={event.type} ruleApplied={event.rule} />
                </td>
                <td title={dateToISODisplay(event.timestamp / 1000)}>
                  {prettyTimeAgo(event.timestamp / 1000)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InviteHistory;
