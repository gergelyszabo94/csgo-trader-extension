import React from "react";

import Category from '../Category/Category';
import Row from 'components/Options/Row';

const Notifications = () => {
    return (
        <Category title='Notifications'>
            <Row
                name='Notify on update'
                id='notifyOnUpdate'
                type='flipSwitchStorage'
                description='Whether you want to receive notifications when the extension gets updated'
            />
        </Category>
    );
};

export default Notifications;
