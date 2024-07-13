import React from 'react';
import { conditions } from 'utils/static/friendRequests';

const Condition = ({ type, value }) => {
  console.log(type);
  if (type !== 'streamrep_banned') {
    return (
      <span
        title={conditions[type].description}
      >
        {conditions[type].pretty}
        {value !== undefined ? ` ${value}` : ''}
      </span>
    );
  } return null;
};

export default Condition;
