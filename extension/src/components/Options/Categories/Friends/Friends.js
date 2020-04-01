import React from 'react';

import Category from 'components/Options/Category/Category';
import InviteHistory from './InviteHistory';

const Friends = () => {
  return (
    <Category title="Friends and Invites">
      <InviteHistory />
    </Category>
  );
};

export default Friends;
