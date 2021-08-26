import React from 'react';

import { eventTypes } from 'utils/static/offers';

import { HistoryEvents } from '.';

const OfferHistorySummary = ({ events }: HistoryEvents) => {
    let received = 0;
    let autoDeclined = 0;
    let autoAccepted = 0;
    let notified = 0;
    const now = Date.now();

    events.forEach((event) => {
        const delta = (now - event.timestamp) / 1000;
        if (delta < 86400) {
            switch (event.type) {
                case eventTypes.new.key:
                    received += 1;
                    break;
                case eventTypes.decline.key:
                    autoDeclined += 1;
                    break;
                case eventTypes.accept.key:
                    autoAccepted += 1;
                    break;
                case eventTypes.notify.key:
                    notified += 1;
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
                    <b>Auto-declined:</b> {autoDeclined}
                </div>
            </div>
            <div className='row'>
                <div className='col-5'>
                    <b>Auto-Accepted:</b> {autoAccepted}
                </div>
                <div className='col-5'>
                    <b>Notified:</b> {notified}
                </div>
            </div>
        </div>
    );
};

export default OfferHistorySummary;
