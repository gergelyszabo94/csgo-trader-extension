/* globals trackEvent*/

import React, {useState, useEffect } from "react";
import NewTabLink from 'components/NewTabLink/NewTabLink';

const Popup = () => {
    // if there is any badge text it gets removed
    chrome.runtime.sendMessage({badgetext: ''}, (response) => {});

    trackEvent({
        type: 'pageview',
        action: 'ExtensionPopupView'
    });

    const [state, setState] = useState([]);

    useEffect(() => {
        chrome.storage.local.get(['popupLinks', 'steamIDOfUser'], result => {

            const navLinks = result.popupLinks.map(link => {
                if (link.active) {
                    const URL =
                        link.id === 'tradeoffers'
                            ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers`
                            : link.url;
                    return (
                        <div key={link.id}>
                            <NewTabLink to={URL}>{link.name}</NewTabLink>
                        </div>
                    );
                }
                return null;
            });
            setState(navLinks);
        });
    }, []);

    return (
        <div className='popup'>
            <NewTabLink to='https://csgotrader.app' key='home'>
                <img src='/images/cstlogo48.png' alt='CSGO Trader Logo'/>
                <h5>
                    CSGO Trader <span>{chrome.runtime.getManifest().version}</span>
                </h5>
            </NewTabLink>
            {state}
        </div>
    );
};

export default Popup;
