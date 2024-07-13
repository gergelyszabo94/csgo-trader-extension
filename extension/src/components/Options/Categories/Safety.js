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
        description="Marks legit trade site bots that are in the appropriate group."
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
