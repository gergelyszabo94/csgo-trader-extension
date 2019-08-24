// if there is any badge text it gets removed
chrome.runtime.sendMessage({badgetext: ""}, (response) => {});

// sets extension version
let version = chrome.runtime.getManifest().version;
document.getElementById('version').innerText = version;

// adds the links dynamically
let links = document.getElementById('links');

chrome.storage.local.get(['popupLinks', 'steamIDOfUser'], (result) => {
    result.popupLinks.forEach(link =>{
        if(link.active){
            let div = document.createElement('div');
            let linkElement = document.createElement('a');
            div.appendChild(linkElement);
            let URL = link.id === 'tradeoffers' ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers` : link.url;
            linkElement.setAttribute('href', URL);
            linkElement.setAttribute('target', '_blank');
            linkElement.innerText = link.name;
            links.appendChild(div);
        }
    });
});