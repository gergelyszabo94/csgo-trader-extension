import React from 'react';

import Category from '../Category';
import FlipSwitchPermission from '../Inputs/FlipSwitchPermission';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import ModalTextBox from '../Inputs/ModalTextBox';
import NotificationSound from '../Inputs/NotificationSound';
import VolumeSlider from '../Inputs/VolumeSlider';

import NewTabLink from 'components/NewTabLink';
import Row from 'components/Options/Row';

const Notifications = () => {
    return (
        <Category title='Notifications'>
            <Row
                name='Notify on update'
                description='Whether you want to receive notifications when the extension gets updated'
            >
                <FlipSwitchStorage id='notifyOnUpdate' />
            </Row>
            <Row name='Notify on comments' description='Get browser notifications about new Steam comments'>
                <FlipSwitchStorage id='notifyAboutComments' />
            </Row>
            <Row name='Audio notification' description='Also makes a sound when notifications pop up'>
                <FlipSwitchStorage id='notificationSoundOn' />
            </Row>
            <Row name='Notification sound' description='The notification sound you want to play'>
                <NotificationSound />
            </Row>
            <Row name='Notification volume' description='The sound volume you want for the notification sound'>
                <VolumeSlider id='notificationVolume' />
            </Row>
            <Row
                name='Allow Discord notifications'
                description="Allow the extension to contact discord's server to send notifications."
            >
                <FlipSwitchPermission id='allowDiscordNotification' permission='tabs' origins={['*://discord.com/*']} />
            </Row>
            <Row
                name='Discord webhook URL'
                description={
                    <>
                        Add the Webhook URL of channel you want to receive notifications to. More info from Discord
                        here:&nbsp;
                        <NewTabLink to='https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks'>
                            Intro to Webhooks
                        </NewTabLink>
                    </>
                }
            >
                <ModalTextBox id='discordNotificationHook' modalTitle='Enter your Discord Webhook URL here' />
            </Row>
        </Category>
    );
};

export default Notifications;
