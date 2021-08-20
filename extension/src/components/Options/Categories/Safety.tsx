import React from 'react';
import Row from 'components/Options/Row';

import Category from '../Category/Category';

const Safety = () => {
    return (
        <Category title='Safety'>
            <Row
                name='Mark scammers'
                id='markScammers'
                type='flipSwitchStorage'
                description={
                    "Changes background and adds warning ribbon to steamrep.com banned scammers' profile and trade offers they send."
                }
            />
            <Row
                name='Flag scam comments'
                id='flagScamComments'
                type='flipSwitchStorage'
                description='Reports obvious scam and spam comments like "I will give my knife for all of your csgo graffitties" and others. Helps to keep steamcommunity cleaner and safer.'
            />
            <Row
                name='Your strings to report'
                id='customCommentsToReport'
                type='modalCustomComments'
                description='Make the extension report comments that includes one of the the strings you add here. These are additional to the built-in ones.'
                modalTitle='Add or remove your strings to report'
            />
            <Row
                name='Mark moderation messages as read'
                id='markModerationMessagesAsRead'
                type='flipSwitchStorage'
                description="If you use the report spam comments feature or report comments yourself then you often receive these messages from Steam. If you turn this on you won't."
            />
            <Row
                name='Turn off Steam link filter'
                id='linkFilterOff'
                type='flipSwitchStorage'
                description="Turns off Steam's link filter that takes you to a page before you can proceed to external sites."
            />
        </Category>
    );
};

export default Safety;
