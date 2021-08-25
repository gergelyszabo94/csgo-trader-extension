import Category from 'components/Options/Category';
import IncomingInvites from 'components/Options/Categories/Friends/IncomingInvites';
import InviteHistory from 'components/Options/Categories/Friends/InviteHistory';
import InviteRules from 'components/Options/Categories/Friends/InviteRules';
import React from 'react';
import Row from 'components/Options/Row';
import FlipSwitchStorage from 'components/Options/Inputs/FlipSwitchStorage';

export interface Rule {
    action: string;
    active: boolean;
    condition: Condition;
}

export interface Condition {
    type: string;
    value?: string | number;
}

export interface HistoryEvent {
    steamID: string;
    timestamp: number;
    type: string;
    username: string;
    rule?: number;
}

export interface HistoryEvents {
    events: HistoryEvent[];
}

const Friends = () => {
    return (
        <Category title='Friends, Groups and Invites'>
            <Row name='Ignore group invites' description='Ignore all Steam group invites automatically'>
                <FlipSwitchStorage id='ignoreGroupInvites' />;
            </Row>
            <Row
                name='Monitor friend requests'
                description='If you have the extension installed on multiple computers you might want to turn it off in some of them to save requests to Steam.'
            >
                <FlipSwitchStorage id='monitorFriendRequests' />;
            </Row>
            <Row
                name='Notify about friend requests'
                description='You will receive browser notifications about new friend request, friend requests must be monitored for this to work'
            >
                <FlipSwitchStorage id='notifyOnFriendRequest' />;
            </Row>
            <div className='row'>
                <InviteRules />
                <InviteHistory />
                <IncomingInvites />
            </div>
        </Category>
    );
};

export default Friends;
