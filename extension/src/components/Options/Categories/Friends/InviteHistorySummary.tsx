import { HistoryEvents } from '.';
import React from 'react';
import { eventTypes } from 'utils/static/friendRequests';

const InviteHistorySummary = ({ events }: HistoryEvents) => {
    let received = 0;
    let autoIgnored = 0;
    let autoAccepted = 0;
    let autoBlocked = 0;
    const now = Date.now();
    events.forEach((event) => {
        const delta = (now - event.timestamp) / 1000;
        if (delta < 86400) {
            switch (event.type) {
                case eventTypes.new.key:
                    received += 1;
                    break;
                case eventTypes.auto_ignored.key:
                    autoIgnored += 1;
                    break;
                case eventTypes.auto_accepted.key:
                    autoAccepted += 1;
                    break;
                case eventTypes.auto_blocked.key:
                    autoBlocked += 1;
                    break;
                default:
                    break;
            }
        }
    });

    return (
        <div className='mb-3 font-size--s container'>
            <div className='row'>
                <div className='col-5'>
                    <b>Received:</b> {received}
                </div>
                <div className='col-5'>
                    <b>Auto-ignored:</b> {autoIgnored}
                </div>
            </div>
            <div className='row'>
                <div className='col-5'>
                    <b>Auto-Accepted:</b> {autoAccepted}
                </div>
                <div className='col-5'>
                    <b>Auto-Blocked:</b> {autoBlocked}
                </div>
            </div>
        </div>
    );
};

export default InviteHistorySummary;
