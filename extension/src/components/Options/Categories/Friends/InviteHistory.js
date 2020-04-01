import React, { useState, useEffect } from 'react';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { dateToISODisplay } from 'utils/dateTime';
import HistoryEvent from './HistoryEvent';

const InviteHistory = () => {
  const [historyEvents, setHistoryEvents] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
      setHistoryEvents(friendRequestLogs.reverse());
    });
  }, []);

  return (
    <>
      <h3>Friend Request History</h3>
      <table>
        <tr>
          <th>User</th>
          <th>Event</th>
          <th>Time</th>
        </tr>
        {historyEvents.map((event) => {
          return (
            <tr key={event.steamID + event.type + event.timestamp}>
              <td>
                <NewTabLink to={`https://steamcommunity.com/profiles/${event.steamID}`}>
                  {event.username}
                </NewTabLink>
              </td>
              <td>
                <HistoryEvent eventType={event.type} />
              </td>
              <td>
                {dateToISODisplay(event.timestamp / 1000)}
              </td>
            </tr>
          );
        })}
      </table>
    </>
  );
};

export default InviteHistory;
