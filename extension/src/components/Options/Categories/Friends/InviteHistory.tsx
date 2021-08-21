import React, { useState, useEffect } from 'react';
import InviteHistoryTable from './InviteHistoryTable';
import InviteHistorySummary from './InviteHistorySummary';

const InviteHistory = () => {
    const [historyEvents, setHistoryEvents] = useState([]);

    const loadHistoryEvents = () => {
        chrome.storage.local.get(['friendRequestLogs'], ({ friendRequestLogs }) => {
            setHistoryEvents(friendRequestLogs.reverse());
        });
    };

    useEffect(() => {
        loadHistoryEvents();
        const loadHistoryEventsPeriodically = setInterval(() => {
            loadHistoryEvents();
        }, 60000);

        return () => clearInterval(loadHistoryEventsPeriodically);
    }, []);

    return (
        <div className='col-6'>
            <h5>Friend Request History</h5>
            <h6>Summary of the past 24 hours</h6>
            <InviteHistorySummary events={historyEvents} />
            <h6>Friend requests event history</h6>
            <div className='mb-3 font-size--s'>
                Friend request events recorded or generated by the extension from the past week.
            </div>
            <InviteHistoryTable events={historyEvents} />
        </div>
    );
};

export default InviteHistory;