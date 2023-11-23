import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import logo from 'assets/images/cstlogo48.png';
import './Navigation.css';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import links from './links';
import CustomNavLink from './CustomNavLink';

const Navigation = () => {
  return (
    <Navbar
      expand="lg"
      variant="dark"
      className="sticky-top nav--shadow nav--dark"
    >
      <Navbar.Brand href="https://cs2trader.app">
        <img
          src={logo}
          className="d-inline-block navlogo"
          alt="CS2 Trader Extension logo"
        />
        CS2 Trader Extension
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          {links.map((link) => {
            return !link.isExternal ? <CustomNavLink to={link.path} key={link.id} title={link.title} activeClassName="active" />
              : (
                <NewTabLink to={link.path} className="nav-link" key={link.id}>
                  {' '}
                  {link.title}
                  {' '}
                </NewTabLink>
              );
          })}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
