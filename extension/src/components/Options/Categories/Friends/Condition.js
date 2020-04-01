import React from 'react';
import { conditions } from 'utils/static/friendRequests';

const getCondition = (type, value) => {
  switch (type) {
    case conditions.profile_private.key: return conditions.profile_private.pretty;
    default: return type + value;
  }
};

const Condition = ({ type, value }) => {
  return (
    <span>
      {getCondition(type, value)}
    </span>
  );
};

export default Condition;
