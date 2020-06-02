import { getPrice } from 'utils/pricing';
import { getDopplerInfo } from 'utils/utilsModular';

const getTradeHistory = (maxTrades, startTime = 0) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey', 'prices', 'pricingProvider', 'currency', 'exchangeRate'],
    ({
      apiKeyValid, steamAPIKey, prices, pricingProvider, currency, exchangeRate,
    }) => {
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
                const tradeWithDesc = {
                  ...trade,
                  receivedTotal: 0.0,
                  givenTotal: 0.0,
                };
                tradeWithDesc.assets_received_desc = [];
                tradeWithDesc.assets_given_desc = [];

                if (trade.assets_received) {
                  trade.assets_received.forEach((received) => {
                    const description = body.response.descriptions.filter((desc) => {
                      return desc.appid === received.appid && desc.classid === received.classid
                        && desc.instanceid === received.instanceid;
                    });
                    const dopplerInfo = (description[0].market_hash_name.includes('Doppler') || description[0].market_hash_name.includes('doppler'))
                      ? getDopplerInfo(description[0].icon_url)
                      : null;
                    const price = getPrice(
                      description[0].market_hash_name,
                      dopplerInfo,
                      prices,
                      pricingProvider,
                      exchangeRate,
                      currency,
                    );
                    tradeWithDesc.receivedTotal += parseFloat(price.price);
                    tradeWithDesc.assets_received_desc.push({
                      ...received,
                      ...description[0],
                      dopplerInfo,
                      price,
                    });
                  });
                }

                if (trade.assets_given) {
                  trade.assets_given.forEach((given) => {
                    const description = body.response.descriptions.filter((desc) => {
                      return desc.appid === given.appid && desc.classid === given.classid
                        && desc.instanceid === given.instanceid;
                    });
                    const dopplerInfo = (description[0].market_hash_name.includes('Doppler') || description[0].market_hash_name.includes('doppler'))
                      ? getDopplerInfo(description[0].icon_url)
                      : null;
                    const price = getPrice(
                      description[0].market_hash_name,
                      dopplerInfo,
                      prices,
                      pricingProvider,
                      exchangeRate,
                      currency,
                    );
                    tradeWithDesc.givenTotal += parseFloat(price.price);
                    tradeWithDesc.assets_given_desc.push({
                      ...given,
                      ...description[0],
                      dopplerInfo,
                      price,
                    });
                  });
                }

                tradeWithDesc.profitLoss = tradeWithDesc.receivedTotal - tradeWithDesc.givenTotal;

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
