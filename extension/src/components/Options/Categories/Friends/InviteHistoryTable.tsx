import React, { useState } from 'react';
import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';

import CustomA11yButton from 'components/CustomA11yButton';
import HistoryEvent from './HistoryEvent';
import NewTabLink from 'components/NewTabLink';

const InviteHistoryTable = ({ events }) => {
    const [showAll, setShowAll] = useState(false);

    const onShowAll = () => {
        setShowAll(!showAll);
    };

    return (
        <table className='spacedTable'>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Event</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {events.map((event, index) => {
                    if (showAll || (!showAll && index < 15)) {
                        return (
                            <tr key={event.steamID + event.type + event.timestamp}>
                                <td>
                                    <NewTabLink
                                        to={`https://steamcommunity.com/profiles/${event.steamID}`}
                                    >
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
                    }
                    return null;
                })}
                <tr>
                    <td colSpan={3} className='center'>
                        <CustomA11yButton
                            action={onShowAll}
                            title='Show All Invite Events form the past week'
                            id='showAll'
                            className='golden'
                        >
                            Show All
                        </CustomA11yButton>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

export default InviteHistoryTable;
