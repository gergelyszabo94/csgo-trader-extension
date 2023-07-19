import React from 'react';
import { NavLink, useMatch, useResolvedPath } from 'react-router-dom';

// this is the only way I managed to make nested routes
// get highlighted when active
// from: https://stackoverflow.com/a/71054976/3862289
const CustomNavLink = ({
  to, title, activeClassName, className,
}) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: false });

  return (
    <NavLink to={to} className={`nav-link ${className} ${match ? activeClassName : ''}`}>
      {title}
    </NavLink>
  );
};

export default CustomNavLink;
