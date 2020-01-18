import React from 'react';
import { Container } from 'react-bootstrap';
import NewTabLink from "..//NewTabLink/NewTabLink";

import './Footer.css';

const footer = () => {
    return  (
        <footer className='buildingBlock'>
            <p>
                A
                <NewTabLink to='https://www.gergely-szabo.com/'> Gergely Szabo </NewTabLink>
                project
            </p>
           <p>
               © {new Date().getFullYear()}
           </p>
        </footer>
    );
};

export default footer;