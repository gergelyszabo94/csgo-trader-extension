import React from 'react';

export interface newTabLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode
}

const newTabLink = ({className, to, children}: newTabLinkProps) => {
  return (
    <a href={to} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
};

export default newTabLink;
