import React from 'react';
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
  const setStorage = (thisValue) => {
    chrome.storage.local.set({ notificationSoundToPlay: thisValue }, () => {
      playAudio(`sounds/notification/${thisValue}.mp3`, 1);
    });
  };

  const getStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get('notificationSoundToPlay', ({ notificationSoundToPlay }) => {
        resolve(notificationSoundToPlay);
      });
    });
  };

  return (
    <Select
      id="notificationSoundToPlay"
      foreignChangeHandler={setStorage}
      foreignUseEffect={getStorage}
      options={transformSounds()}
    />
  );
};

export default NotificationSound;
