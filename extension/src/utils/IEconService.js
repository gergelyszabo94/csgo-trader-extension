import { getPrice, prettyPrintPrice } from 'utils/pricing';
import { getDopplerInfo } from 'utils/utilsModular';
import { getPlayerSummaries } from 'utils/ISteamUser';
import { isDopplerInName, getFormattedPLPercentage } from './simpleUtils';

const getTradeHistory = (
  maxTrades, startTime = 0, afterTrade = 0,
) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey', 'prices', 'pricingProvider', 'currency', 'exchangeRate'],
    ({
      apiKeyValid, steamAPIKey, prices, pricingProvider, pricingMode, currency, exchangeRate,
    }) => {
      if (apiKeyValid) {
        const getRequest = new Request(
          `https://api.steampowered.com/IEconService/GetTradeHistory/v1/?max_trades=${maxTrades}&start_after_time=${startTime}&start_after_tradeid=${afterTrade}&get_descriptions=1&include_total=1language=english&key=${steamAPIKey}`,
        );

        fetch(getRequest).then((response) => {
          if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            reject(response.statusText);
          } else return response.json();
        }).then((body) => {
          try {
            if (body.response.trades) {
              const partnerIDs = [];
              body.response.trades.forEach((trade) => {
                partnerIDs.push(trade.steamid_other);
              });
              const uniquePartnerIDs = [...new Set(partnerIDs)];
              getPlayerSummaries(uniquePartnerIDs).then((summaries) => {
                const trades = [];
                body.response.trades.forEach((trade) => {
                  const partnerSummary = summaries[trade.steamid_other] !== undefined
                    ? summaries[trade.steamid_other]
                    : {
                      personaname: 'No name found',
                    };
                  const tradeWithDesc = {
                    ...trade,
                    receivedTotal: 0.0,
                    givenTotal: 0.0,
                    partnerSummary,
                  };
                  tradeWithDesc.assets_received_desc = [];
                  tradeWithDesc.assets_given_desc = [];

                  if (trade.assets_received) {
                    trade.assets_received.forEach((received) => {
                      const description = body.response.descriptions.filter((desc) => {
                        return desc.appid === received.appid && desc.classid === received.classid
                          && desc.instanceid === received.instanceid;
                      });
                      const dopplerInfo = isDopplerInName(description[0].market_hash_name)
                        ? getDopplerInfo(description[0].icon_url)
                        : null;
                      const price = getPrice(
                        description[0].market_hash_name,
                        dopplerInfo,
                        prices,
                        pricingProvider,
                        pricingMode,
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
                      const dopplerInfo = isDopplerInName(description[0].market_hash_name)
                        ? getDopplerInfo(description[0].icon_url)
                        : null;
                      const price = getPrice(
                        description[0].market_hash_name,
                        dopplerInfo,
                        prices,
                        pricingProvider,
                        pricingMode,
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
                  tradeWithDesc.receivedTotalFormatted = prettyPrintPrice(
                    currency,
                    tradeWithDesc.receivedTotal.toFixed(2),
                  );
                  tradeWithDesc.givenTotalFormatted = prettyPrintPrice(
                    currency,
                    tradeWithDesc.givenTotal.toFixed(2),
                  );
                  tradeWithDesc.profitLossFormatted = prettyPrintPrice(
                    currency,
                    tradeWithDesc.profitLoss.toFixed(2),
                  );
                  tradeWithDesc.PLPercentageFormatted = getFormattedPLPercentage(
                    tradeWithDesc.givenTotal,
                    tradeWithDesc.receivedTotal,
                  );

                  trades.push(tradeWithDesc);
                });
                resolve({
                  totalTrades: body.response.total_trades,
                  trades,
                  lastTradeID: trades[trades.length - 1].tradeid,
                  lastTradeTime: trades[trades.length - 1].time_init,
                });
              }).catch((err) => {
                console.log(err);
              });
            } else reject('trades undefined');
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

const getTradeOffers = (
  activesOnly, historicalOnly, includeDescriptions, sent, received,
) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['apiKeyValid', 'steamAPIKey'], ({ apiKeyValid, steamAPIKey }) => {
    if (apiKeyValid) {
      const getRequest = new Request(`https://api.steampowered.com/IEconService/GetTradeOffers/v1/?get_received_offers=${received}&get_sent_offers=${sent}&active_only=${activesOnly}&historical_only${historicalOnly}&get_descriptions=${includeDescriptions}&language=english&key=${steamAPIKey}`);

      fetch(getRequest).then((response) => {
        if (!response.ok) {
          console.log(`Error code: ${response.status} Status: ${response.statusText}`);
          reject(response.statusText);
        } else return response.json();
      }).then((body) => {
        try { resolve(body.response); } catch (e) {
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

export { getTradeHistory, getTradeOffers };
