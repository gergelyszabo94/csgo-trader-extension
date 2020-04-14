import React from 'react';
import Row from 'components/Options/Row';

import Category from '../Category/Category';

const WebChat = () => {
  return (
    <Category title="Web Chat">
      <Row
        name="Remove Steam header"
        id="removeWebChatHeader"
        type="flipSwitchStorage"
        description="Rmoves the Steam header that takes up a lot of space on the web chat page."
      />
    </Category>
  );
};

export default WebChat;
