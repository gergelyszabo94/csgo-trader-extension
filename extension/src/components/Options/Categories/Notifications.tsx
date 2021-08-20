import React from 'react';

import Row from 'components/Options/Row';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import Category from '../Category/Category';

const Notifications = () => {
    return (
        <Category title='Notifications'>
            <Row
                name='Notify on update'
                id='notifyOnUpdate'
                type='flipSwitchStorage'
                description='Whether you want to receive notifications when the extension gets updated'
            />
            <Row
                name='Notify on comments'
                id='notifyAboutComments'
                type='flipSwitchStorage'
                description='Get browser notifications about new Steam comments'
            />
            <Row
                name='Audio notification'
                id='notificationSoundOn'
                type='flipSwitchStorage'
                description='Also makes a sound when notifications pop up'
            />
            <Row
                name='Notification sound'
                type='notifSound'
                id='notificationSoundToPlay'
                description='The notification sound you want to play'
            />
            <Row
                name='Notification volume'
                type='volumeSlider'
                id='notificationVolume'
                description='The sound volume you want for the notification sound'
            />
            <Row
                name='Allow Discord notifications'
                type='flipSwitchPermission'
                id='allowDiscordNotification'
                description="Allow the extension to contact discord's server to send notifications."
                permission='tabs'
                origins={['*://discord.com/*']}
            />
            <Row
                name='Discord webhook URL'
                id='discordNotificationHook'
                type='modalTextBox'
                description={
                    <>
                        Add the Webhook URL of channel you want to receive notifications to. More
                        info from Discord here:&nbsp;
                        <NewTabLink to='https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks'>
                            Intro to Webhooks
                        </NewTabLink>
                    </>
                }
                modalTitle='Enter your Discord Webhook URL here'
            />
        </Category>
    );
};

export default Notifications;
