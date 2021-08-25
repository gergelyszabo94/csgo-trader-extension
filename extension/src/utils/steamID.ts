import { SharedFileIDAndOwner } from 'types';
import { injectScript } from 'utils/injection';

// converts shitty annoying trade offer style SteamID to proper SteamID64
// I agree that steamid32 is pretty shitty and steam should just use steamid64 -hexiro
export const getProperStyleSteamIDFromOfferStyle = (offerStyleID: string | number) => {
    return `7656${Number(offerStyleID) + Number(1197960265728)}`;
};

// there are many different kinds of SteamID formats
// this function converts the 64bit into the ones used in trade offers
export const getOfferStyleSteamID = (steamID64: string | number) => {
    return Number(String(steamID64).split('7656')[1]) - Number(1197960265728);
};

// gets SteamID of the user logged into steam (returns false if there is no user logged in)
export const getUserSteamID = (): string => {
    const getUserSteamIDScript = "document.querySelector('body').setAttribute('steamidOfLoggedinUser', g_steamID);";
    return injectScript(getUserSteamIDScript, true, 'steamidOfLoggedinUser', 'steamidOfLoggedinUser');
};

// gets the steam id of the user that's profile this script is run on
export const getProfileOwnerSteamID = (): string => {
    const steamIDOfProfileOwnerScript =
        "document.querySelector('body').setAttribute('steamidOfProfileOwner', g_rgProfileData.steamid);";
    return injectScript(steamIDOfProfileOwnerScript, true, 'steamidOfProfileOwner', 'steamidOfProfileOwner');
};

export const getGroupID = (): string => {
    return document.querySelector<HTMLInputElement>('input[name=groupId]').value;
};

export const getSharedFileIDAndOwner = (): SharedFileIDAndOwner => {
    const pagingElement = document.querySelector('.commentthread_paging');

    const ownerID = pagingElement.id.split('commentthread_PublishedFile_Public_')[1].split('_')[0];
    const sharedFileID = pagingElement.id.split('_pagecontrols')[0].split('_')[4];

    return { ownerID, sharedFileID };
};
