import React from "react";

import Category from '../Category/Category';
import Row from '../Row';

const notifications = props => {
    return (
        <Category title='Notifications'>
            <Row
                name='Notify on update'
                type='flipSwitch'
                key='updateNotifications'
                description='Whether you want to receive notifications when the extension gets updated'
            />
        </Category>
    );
};

export default notifications;
