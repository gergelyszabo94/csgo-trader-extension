const getPlayerBans = (steamIDs) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], ({ apiKeyValid, steamAPIKey }) => {
    if (apiKeyValid) {
      const getRequest = new Request(
        `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamAPIKey}&steamids=${steamIDs.join(',')}`,
      );

      fetch(getRequest).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject(response.statusText);
        } else return response.json();
      }).then((body) => {
        try {
          const bans = {};
          body.players.forEach((ban) => {
            bans[ban.SteamId] = ban;
          });
          resolve(bans);
        } catch (e) {
          console.log(e);
          reject(e);
        }
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    } else reject('api_key_invalid');
  });
});

const getPlayerSummaries = (steamIDs) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], ({ apiKeyValid, steamAPIKey }) => {
    if (apiKeyValid) {
      const getRequest = new Request(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamAPIKey}&steamids=${steamIDs.join(',')}`,
      );

      fetch(getRequest).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject(response.statusText);
        } else return response.json();
      }).then((body) => {
        try {
          const summaries = {};
          body.response.players.forEach((summary) => {
            summaries[summary.steamid] = summary;
          });
          resolve(summaries);
        } catch (e) {
          console.log(e);
          reject(e);
        }
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    } else reject('api_key_invalid');
  });
});

export { getPlayerBans, getPlayerSummaries };
