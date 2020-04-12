import React from 'react';

import Category from 'components/Options/Category/Category';
import Row from 'components/Options/Row';
import InviteHistory from 'components/Options/Categories/Friends/InviteHistory';
import InviteRules from 'components/Options/Categories/Friends/InviteRules';
import IncomingInvites from 'components/Options/Categories/Friends/IncomingInvites';

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
        <IncomingInvites />
      </div>
    </Category>
  );
};

export default Friends;
