import React from "react";
import {NavLink} from "react-router-dom";

import './Navigation.css';

const navigation = () => {
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
                            <NavLink to={navItem.path} exact={true} activeClassName='active'>
                                <li>{navItem.name}</li>
                            </NavLink>
                           )
                    })
                }
            </ul>
        </nav>
    );
};

export default navigation;