import React, {Fragment} from 'react';

const generalSchema = {
        title: 'General',
        options: [
            {
                name: 'Auto-set Steam API key',
                storageKey: 'autoSetSteamAPIKey',
                inputType: 'flipSwitch',
                description: 'Automatically generates and adds the Steam API key to the extension when visiting <a href="https://steamcommunity.com/dev/apikey" target="_blank">steamcommunity.com/dev/apikey</a>'
            },
            {
                name: 'Steam API key',
                storageKey: 'steamAPIKey',
                inputType: 'modalTextBox',
                description: <Fragment>
                                Allows the extension to make API requests to the <a href="https://developer.valvesoftware.com/wiki/Steam_Web_API" target="_blank">Steam Web API</a>,
                                functions that need an API key will be tagged with this icon: <i class="fas fa-code apiIcon"></i><br/> You can get an API key by filling out
                                <a href="https://steamcommunity.com/dev/apikey" target="_blank"> this form</a> (you can put anything in as domain name).
                             </Fragment>
            }
        ]
    }

export default generalSchema;