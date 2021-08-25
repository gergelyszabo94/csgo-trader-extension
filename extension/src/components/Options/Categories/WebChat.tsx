import Category from '../Category';
import React from 'react';
import Row from 'components/Options/Row';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';

const WebChat = () => {
    return (
        <Category title='Web Chat'>
            <Row
                name='Remove Steam header'
                description='Removes the Steam header that takes up a lot of space on the web chat page.'
            >
                <FlipSwitchStorage id='removeWebChatHeader' />
            </Row>
        </Category>
    );
};

export default WebChat;
