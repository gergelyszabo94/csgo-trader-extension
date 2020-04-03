import React from 'react';

import Category from 'components/Options/Category/Category';
import Row from 'components/Options/Row';
import InviteHistory from './InviteHistory';
import InviteRules from './InviteRules';

const Friends = () => {
  return (
    <Category title="Friends, Groups and Invites (BETA)">
      <Row
        name="Ignore group invites"
        id="ignoreGroupInvites"
        type="flipSwitchStorage"
        description="Ignore all Steam group invites automatically"
      />
      <div className="row">
        <InviteRules />
        <InviteHistory />
      </div>
    </Category>
  );
};

export default Friends;
