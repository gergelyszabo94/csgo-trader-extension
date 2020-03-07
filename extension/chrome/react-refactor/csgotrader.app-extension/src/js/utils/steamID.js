import { injectScript } from 'js/utils/injection';

// converts shitty annoying trade offer style SteamID to proper SteamID64
const getProperStyleSteamIDFromOfferStyle = (offerStyleID) => {
  return `7656${Number(offerStyleID) + Number(1197960265728)}`;
};

// there are many different kinds of SteamID formats
// this function converts the 64bit into the ones used in trade offers
const getOfferStyleSteamID = (steamID64) => {
  return Number(steamID64.split('7656')[1]) - Number(1197960265728);
};

// gets SteamID of the user logged into steam (returns false if there is no user logged in)
const getUserSteamID = () => {
  const getUserSteamIDScript = 'document.querySelector(\'body\').setAttribute(\'steamidOfLoggedinUser\', g_steamID);';
  return injectScript(getUserSteamIDScript, true, 'steamidOfLoggedinUser', 'steamidOfLoggedinUser');
};

export { getProperStyleSteamIDFromOfferStyle, getOfferStyleSteamID, getUserSteamID };
