import React from 'react';

import Category from 'components/Options/Category/Category';
import Row from 'components/Options/Row';
import InviteHistory from 'components/Options/Categories/Friends/InviteHistory';
import InviteRules from 'components/Options/Categories/Friends/InviteRules';
import IncomingInvites from 'components/Options/Categories/Friends/IncomingInvites';

const Friends = () => {
  return (
    <Category title="Friends, Groups and Invites">
      <Row
        name="Ignore group invites"
        id="ignoreGroupInvites"
        type="flipSwitchStorage"
        description="Ignore all Steam group invites automatically"
      />
      <Row
        name="Monitor friend requests"
        id="monitorFriendRequests"
        type="flipSwitchStorage"
        description="Incoming friend requests are checked every 5 minutes. If you have the extension installed on multiple computers you might want to turn it off in some of them to save requests to Steam."
      />
      <Row
        name="Notify about friend requests"
        id="notifyOnFriendRequest"
        type="flipSwitchStorage"
        description="You will receive browser notifications about new friend request, friend requests must be monitored for this to work"
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
