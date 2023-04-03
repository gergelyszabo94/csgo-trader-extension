import React from 'react';
import Row from 'components/Options/Row';

import Category from '../Category/Category';

const Safety = () => {
  return (
    <Category title="Safety">
      <Row
        name="Mark profiles"
        id="markScammers"
        type="flipSwitchStorage"
        description={'Changes background and adds warning ribbon to steamrep.com banned scammers\' profile and trade offers they send. Also marks legit trade site bots that are in the appropriate group.'}
      />
      <Row
        name="Mark moderation messages as read"
        id="markModerationMessagesAsRead"
        type="flipSwitchStorage"
        description="If you turn this on you won't see moderation messages from Steam, they will be marked as read."
      />
      <Row
        name="Turn off Steam link filter"
        id="linkFilterOff"
        type="flipSwitchStorage"
        description="Turns off Steam's link filter that takes you to a page before you can proceed to external sites."
      />
    </Category>
  );
};

export default Safety;
