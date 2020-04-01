import React from 'react';

import Category from 'components/Options/Category/Category';
import InviteHistory from './InviteHistory';
import InviteRules from './InviteRules';

const Friends = () => {
  return (
    <Category title="Friends and Invites (BETA)">
      <div className="row">
        <InviteRules />
        <InviteHistory />
      </div>
    </Category>
  );
};

export default Friends;
