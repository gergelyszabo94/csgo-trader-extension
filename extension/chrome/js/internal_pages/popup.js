// if there is any badge text it gets removed
chrome.runtime.sendMessage({badgetext: ""}, (response) => {});

// sets extension version
let version = chrome.runtime.getManifest().version;
document.getElementById('version').innerText = version;

// adds the links dynamically
let links = document.getElementById('links');

chrome.storage.local.get('popupLinks', (result) => {
    result.popupLinks.forEach(link =>{
        if(link.active){
            let div = document.createElement('div');
            let linkElement = document.createElement('a');
            div.appendChild(linkElement);
            linkElement.setAttribute('href', link.url);
            linkElement.setAttribute('target', '_blank');
            linkElement.innerText = link.name;
            links.appendChild(div);
        }
    });
});