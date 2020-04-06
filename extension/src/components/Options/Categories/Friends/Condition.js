import React from 'react';
import { conditions } from 'utils/static/friendRequests';

const Condition = ({ type, value }) => {
  return (
    <>
      {conditions[type].pretty}
      {value !== undefined ? ` ${value}` : ''}
    </>
  );
};

export default Condition;
