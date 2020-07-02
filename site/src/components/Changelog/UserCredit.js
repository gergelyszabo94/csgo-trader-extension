import NewTabLink from '../NewTabLink/NewTabLink';
import React from 'react';

const UserCredit = ({to, children}) => {
  return <span> (thanks to <NewTabLink to={to}> {children} </NewTabLink> for reporting it) </span>
};

export default UserCredit;