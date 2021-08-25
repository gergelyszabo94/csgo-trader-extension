// this utils module should never have any non-static dependencies

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const getItemMarketLink = (appID: string, marketHashName: string) => {
    return `https://steamcommunity.com/market/listings/${appID}/${marketHashName}`;
};

const getItemInventoryLink = (steamID: string, appID: string, contextID: string, assetID: string) => {
    return `https://steamcommunity.com/profiles/${steamID}/inventory/#${appID}_${contextID}_${assetID}`;
};

const getOfferLink = (offerID: string) => {
    return `https://steamcommunity.com/tradeoffer/${offerID}`;
};

const playAudio = (source: string, sourceType: string, volume: number) => {
    const sourceURL = sourceType === 'local' ? chrome.runtime.getURL(source) : source;
    const audio = new Audio(sourceURL);
    audio.volume = volume;
    audio.play();
};

const getItemByNameAndGame = (inventory, appID, contextID, itemName) => {
    return inventory.find((item) => {
        return item.market_hash_name === itemName && item.appid === appID && item.contextid === contextID;
    });
};

const closeTab = () =>
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

const getFormattedPLPercentage = (giving, receiving) => {
    return giving === 0 || receiving === 0 ? '' : `(${((receiving / giving - 1) * 100).toFixed(2)}%)`;
};

// for phase detection we have to know if th item is a doppler
const isDopplerInName = (name: string): boolean => {
    // english and many other languages, polish iirc, simplified chinese, korean, bulgarian, russian
    const patterns = ['Doppler', 'doppler', '多普勒', '도플러', 'Доплер', 'Волны'];
    const dopplerCheckRegex = new RegExp(patterns.join('|'), 'i');
    return dopplerCheckRegex.test(name);
};

export {
    sleep,
    getItemMarketLink,
    getItemInventoryLink,
    getOfferLink,
    playAudio,
    getItemByNameAndGame,
    closeTab,
    isDopplerInName,
    getFormattedPLPercentage,
};
