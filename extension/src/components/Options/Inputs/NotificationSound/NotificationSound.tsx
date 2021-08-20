import React, { useState, useEffect } from 'react';
import Select from 'components/Select/Select';
import { notificationSounds } from 'utils/static/notifications';
import { playAudio } from 'utils/simpleUtils';

const transformSounds = () => {
    const transformedSounds = [];
    for (const sound of Object.values(notificationSounds)) {
        transformedSounds.push({
            key: sound.key,
            text: sound.name,
        });
    }

    return transformedSounds;
};

const NotificationSound = () => {
    const [customURL, setCustomURL] = useState('');
    const [notifSound, setNotifSound] = useState(notificationSounds['done-for-you'].key);

    useEffect(() => {
        chrome.storage.local.get('customNotificationURL', ({ customNotificationURL }) => {
            setCustomURL(customNotificationURL);
        });
    });

    const setURL = (event) => {
        const newURL = event.target.value;
        setCustomURL(newURL);
        playAudio(newURL, 'remote', 1);
        chrome.storage.local.set({ customNotificationURL: newURL });
    };

    const setStorage = (thisValue) => {
        chrome.storage.local.set({ notificationSoundToPlay: thisValue }, () => {
            setNotifSound(thisValue);
            if (thisValue === notificationSounds.custom.key) {
                playAudio(customURL, 'remote', 1);
            } else {
                playAudio(`sounds/notification/${thisValue}.mp3`, 'local', 1);
            }
        });
    };

    const getStorage = () => {
        return new Promise((resolve) => {
            chrome.storage.local.get('notificationSoundToPlay', ({ notificationSoundToPlay }) => {
                setNotifSound(notificationSoundToPlay);
                resolve(notificationSoundToPlay);
            });
        });
    };

    return (
        <>
            <Select
                id='notificationSoundToPlay'
                foreignChangeHandler={setStorage}
                foreignUseEffect={getStorage}
                options={transformSounds()}
            />
            {notifSound === notificationSounds.custom.key ? (
                <div className='mt-3'>
                    <span>Add your custom sound (URL). Accepted formats: .mp3, .ogg</span>
                    <input type='text' value={customURL} onChange={setURL} className='input' />
                </div>
            ) : null}
        </>
    );
};

export default NotificationSound;
