const getTradeHistory = (maxTrades, startTime = 0) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], ({ apiKeyValid, steamAPIKey }) => {
    if (apiKeyValid) {
      const getRequest = new Request(
        `https://api.steampowered.com/IEconService/GetTradeHistory/v1/?max_trades=${maxTrades}&start_after_time=${startTime}&get_descriptions=1&language=english&key=${steamAPIKey}`,
      );

      fetch(getRequest).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject(response.statusText);
        } else return response.json();
      }).then((body) => {
        try {
          if (body.response.trades) {
            const trades = [];
            body.response.trades.forEach((trade) => {
              const tradeWithDesc = { ...trade };
              tradeWithDesc.assets_received_desc = [];
              tradeWithDesc.assets_given_desc = [];
              if (trade.assets_received) {
                trade.assets_received.forEach((received) => {
                  const description = body.response.descriptions.filter((desc) => {
                    return desc.appid === received.appid && desc.classid === received.classid
                      && desc.instanceid === received.instanceid;
                  });
                  tradeWithDesc.assets_received_desc.push({
                    ...received,
                    ...description[0],
                  });
                });
              }

              if (trade.assets_given) {
                trade.assets_given.forEach((given) => {
                  const description = body.response.descriptions.filter((desc) => {
                    return desc.appid === given.appid && desc.classid === given.classid
                      && desc.instanceid === given.instanceid;
                  });
                  tradeWithDesc.assets_given_desc.push({
                    ...given,
                    ...description[0],
                  });
                });
              }

              trades.push(tradeWithDesc);
            });
            resolve(trades);
          }
          reject('trades undefined');
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


// eslint-disable-next-line import/prefer-default-export
export { getTradeHistory };
