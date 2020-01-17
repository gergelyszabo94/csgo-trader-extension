import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'

import './Navigation.css';

const navigation = () => {
    const navItems = [
        {
            path: '/changelog/',
            name: 'Changelog'
        },
        {
            path: '/release-notes/',
            name: 'Release-Notes'
        },
        {
            path: '/group/',
            name: 'Steam Group'
        },
        {
            path: '/prices/',
            name: 'Prices'
        },
        {
            path: '/faq/',
            name: 'FAQ'
        }
    ];

    return  (
        <Container>
            <Navbar expand='lg' bg='dark' variant='dark'>
                <LinkContainer to='/' exact={true} activeClassName='active' key='/'>
                    <Navbar.Brand>
                        <img
                            src='/cstlogo48.png'
                            className='d-inline-block navlogo'
                            alt='CSGO Trader Extension logo'
                        />
                        CSGO Trader Extension
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls='responsive-navbar-nav'/>
                <Navbar.Collapse id='responsive-navbar-nav'>
                    <Nav className='mr-auto'>
                        {
                            navItems.map(navItem => {
                                return (
                                    <RouterNavLink to={navItem.path} exact={true} activeClassName='active' key={navItem.path}>
                                        {navItem.name}
                                    </RouterNavLink>
                                )
                            })
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </Container>
    );
};

// workaround from here: https://github.com/react-bootstrap/react-router-bootstrap/issues/242#issuecomment-480330910
const RouterNavLink = ({ children, ...props }) => (
    <LinkContainer {...props}>
        <Nav.Link active={false}>
            {children}
        </Nav.Link>
    </LinkContainer>
);

export default navigation;