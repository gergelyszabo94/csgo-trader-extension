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
        description="Removes the Steam header that takes up a lot of space on the web chat page."
      />
      <Row
        name="Show chat message presets"
        id="showChatPresetMessages"
        type="flipSwitchStorage"
        description="Show the chat message presets by the text input field"
      />
      <Row
        name="Chat message presets"
        id="chatPresetMessages"
        type="arrayOfStrings"
        description="Add your messages to show up as options to send"
        maxMessageLength={5000}
      />
    </Category>
  );
};

export default WebChat;
