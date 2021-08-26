import React from 'react';

import Category from '../Category';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import ModalTextBox from '../Inputs/ModalTextBox';

import Row from 'components/Options/Row';

const Safety = () => {
    return (
        <Category title='Safety'>
            <Row
                name='Mark scammers'
                description={
                    "Changes background and adds warning ribbon to steamrep.com banned scammers' profile and trade offers they send."
                }
            >
                <FlipSwitchStorage id='markScammers' />;
            </Row>
            <Row
                name='Flag scam comments'
                description='Reports obvious scam and spam comments like "I will give my knife for all of your csgo graffitties" and others. Helps to keep steamcommunity cleaner and safer.'
            >
                <FlipSwitchStorage id='flagScamComments' />;
            </Row>
            <Row
                name='Your strings to report'
                description='Make the extension report comments that includes one of the the strings you add here. These are additional to the built-in ones.'
            >
                <ModalTextBox id='customCommentsToReport' modalTitle='Add or remove your strings to report' />;
            </Row>
            <Row
                name='Mark moderation messages as read'
                description="If you use the report spam comments feature or report comments yourself then you often receive these messages from Steam. If you turn this on you won't."
            >
                <FlipSwitchStorage id='markModerationMessagesAsRead' />;
            </Row>
            <Row
                name='Turn off Steam link filter'
                description="Turns off Steam's link filter that takes you to a page before you can proceed to external sites."
            >
                <FlipSwitchStorage id='linkFilterOff' />;
            </Row>
        </Category>
    );
};

export default Safety;
