// this utils module should never have any non-static dependencies

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemMarketLink = (appID: string, marketHashName: string) => {
    return `https://steamcommunity.com/market/listings/${appID}/${marketHashName}`;
};

export const getItemInventoryLink = (steamID: string, appID: string, contextID: string, assetID: string) => {
    return `https://steamcommunity.com/profiles/${steamID}/inventory/#${appID}_${contextID}_${assetID}`;
};

export const getOfferLink = (offerID: string) => {
    return `https://steamcommunity.com/tradeoffer/${offerID}`;
};

export const playAudio = (source: string, sourceType: string, volume: number) => {
    const sourceURL = sourceType === 'local' ? chrome.runtime.getURL(source) : source;
    const audio = new Audio(sourceURL);
    audio.volume = volume;
    audio.play();
};

export const getItemByNameAndGame = (inventory, appID, contextID, itemName) => {
    return inventory.find((item) => {
        return item.market_hash_name === itemName && item.appid === appID && item.contextid === contextID;
    });
};

export const closeTab = () =>
    new Promise((resolve, reject) => {
        if (window.opener) {
            window.close(); // only tabs opened by js can be closed by js
            resolve('closed');
        } else {
            chrome.runtime.sendMessage(
                {
                    closeTab: window.location.href,
                },
                () => {
                    reject('couldnt_close');
                },
            );
        }
    });

export const getFormattedPLPercentage = (giving, receiving) => {
    return giving === 0 || receiving === 0 ? '' : `(${((receiving / giving - 1) * 100).toFixed(2)}%)`;
};

// for phase detection we have to know if th item is a doppler
export const isDopplerInName = (name: string): boolean => {
    // english and many other languages, polish iirc, simplified chinese, korean, bulgarian, russian
    const patterns = ['Doppler', 'doppler', '多普勒', '도플러', 'Доплер', 'Волны'];
    const dopplerCheckRegex = new RegExp(patterns.join('|'), 'i');
    return dopplerCheckRegex.test(name);
};