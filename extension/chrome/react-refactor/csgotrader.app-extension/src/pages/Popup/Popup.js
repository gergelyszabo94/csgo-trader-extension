/* global chrome */

import React, { Fragment } from "react";

const Popup = () => {
    chrome.storage.local.get(['popupLinks', 'steamIDOfUser'], (result) => {
        return (
            <Fragment>
                <a href="https://csgotrader.app" target="_blank">
                    <img style="margin-bottom: 5px" src="/images/cstlogo48.png"/>
                    <h5>CSGO Trader {chrome.runtime.getManifest().version}</h5>
                </a>

                {result.popupLinks.forEach(link => {
                    if (link.active) {
                        const URL = link.id === 'tradeoffers' ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers` : link.url;

                        return (
                            <div>
                                <a href={URL} target="_blank">{link.name}</a>
                            </div>
                        );
                    }
                })}
            </Fragment>
        );
    });
};

export default Popup;
