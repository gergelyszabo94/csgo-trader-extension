import React from "react";
// import {Link} from "react-router-dom";

import NavItem from '../NavigationItem/NavigationItem'
import './Navigation.css';

const navigation = (props) => {
    const navItems = [
        {
            path: '/',
            name: 'Home'
        },
        {
            path: '/changelog',
            name: 'Changelog'
        },
        {
            path: '/release-notes',
            name: 'Release-Notes'
        },
        {
            path: '/group',
            name: 'Steam Group'
        },
        {
            path: '/prices',
            name: 'Prices'
        }

    ];

    return  (
        <nav>
            <ul>
                {
                    navItems.map(navItem => {
                        return (
                            <NavItem
                                path={navItem.path}
                                name={navItem.name}
                                active={props.activeNav === navItem.path}
                                key={navItem.path}
                            />)
                    })
                }
            </ul>
        </nav>
    );
};

export default navigation;