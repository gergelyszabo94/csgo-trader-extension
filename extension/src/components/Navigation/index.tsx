import './Navigation.css';

import { Nav, Navbar } from 'react-bootstrap';

import { LinkContainer } from 'react-router-bootstrap';
import NewTabLink from 'components/NewTabLink';
import React from 'react';
import links from './links';
import logo from 'assets/images/cstlogo48.png';

const navigation = () => {
    return (
        <>
            <Navbar expand='lg' variant='dark' className='sticky-top nav--shadow nav--dark'>
                <Navbar.Brand href='https://csgotrader.app'>
                    <img
                        src={logo}
                        className='d-inline-block navlogo'
                        alt='CSGO Trader Extension logo'
                    />
                    CSGO Trader Extension
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                <Navbar.Collapse id='responsive-navbar-nav'>
                    <Nav className='mr-auto'>
                        {links.map((link) => {
                            return !link.isExternal ? (
                                <RouterNavLink
                                    to={link.path}
                                    exact={false}
                                    activeClassName='active'
                                    key={link.id}
                                >
                                    {link.title}
                                </RouterNavLink>
                            ) : (
                                <NewTabLink to={link.path} className='nav-link' key={link.id}>
                                    {' '}
                                    {link.title}{' '}
                                </NewTabLink>
                            );
                        })}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    );
};

// workaround from here: https://github.com/react-bootstrap/react-linkr-bootstrap/issues/242#issuecomment-480330910
const RouterNavLink = ({ children, ...props }) => (
    <LinkContainer {...props}>
        <Nav.Link active={false}>{children}</Nav.Link>
    </LinkContainer>
);

export default navigation;
