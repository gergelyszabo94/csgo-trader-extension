import React from 'react';

const Action = ({ children, className, title }) => (
  <span className={`action ${className}`} title={title}>
    {children}
  </span>
);

export default Action;
