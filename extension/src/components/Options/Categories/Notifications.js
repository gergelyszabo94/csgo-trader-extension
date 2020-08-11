import React from 'react';

import Row from 'components/Options/Row';
import Category from '../Category/Category';

const Notifications = () => {
  return (
    <Category title="Notifications">
      <Row
        name="Notify on update"
        id="notifyOnUpdate"
        type="flipSwitchStorage"
        description="Whether you want to receive notifications when the extension gets updated"
      />
      <Row
        name="Audio notification"
        id="notificationSoundOn"
        type="flipSwitchStorage"
        description="Also makes a sound when notifications pop up"
      />
      <Row
        name="Notification sound"
        type="notifSound"
        id="notificationSoundToPlay"
        description="The notification sound you want to play"
      />
      <Row
        name="Notification volume"
        type="volumeSlider"
        id="notificationVolume"
        description="The sound volume you want for the notification sound"
      />
    </Category>
  );
};

export default Notifications;
