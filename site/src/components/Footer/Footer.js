import React from 'react';
import {Link} from "react-router-dom";
import NewTabLink from "..//NewTabLink/NewTabLink";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Footer.css';

const footer = () => {
    return  (
        <footer className='buildingBlock'>
            <p>
                A
                <NewTabLink to='https://www.gergely-szabo.com/'> Gergely Szabo </NewTabLink>
                project © {new Date().getFullYear()}
            </p>
            <div>
                <BrandIcon link='https://github.com/gergelyszabo94/csgo-trader-extension' brand='github'/>
                <BrandIcon link='https://steamcommunity.com/groups/csgotraderextension' brand='steam'/>
                <BrandIcon link='https://chrome.google.com/webstore/detail/csgo-trader-steam-trading/kaibcgikagnkfgjnibflebpldakfhfih' brand='chrome'/>
                <BrandIcon link='https://addons.mozilla.org/en-US/firefox/addon/csgo-trader-steam-trading/' brand='firefox'/>
                <BrandIcon link='https://microsoftedge.microsoft.com/addons/detail/emcdnkamomgiafjejbhdpcfgbeeimpdb' brand='edge'/>
                <BrandIcon link='https://www.youtube.com/channel/UCkDNavvHkCFHFCZ2bmG4zzw' brand='youtube'/>
            </div>
            <span className='footerNavLink'>
                <Link to='/privacy/'>Privacy</Link>
            </span>
            <Divider/>
            <span className='footerNavLink'>
                <NewTabLink to='mailto:support@csgotrader.app'>support@csgotrader.app</NewTabLink>
            </span>
        </footer>
    );
};

const BrandIcon = (props) => {
    return (
        <span className='brandIcon'>
            <NewTabLink to={props.link}>
                <FontAwesomeIcon icon={['fab', props.brand]} />
            </NewTabLink>
        </span>
    );
};

const Divider = () => {
    return (<span>|</span>);
};

export default footer;