import React from 'react';

const newTabLink = ({
  className, to, children,
}) => {
  return (
    <a href={to} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
};

export default newTabLink;
