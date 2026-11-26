import { getPrice, prettyPrintPrice } from 'utils/pricing';
import { getDopplerInfo, setAccessTokenFirstTime, isSteamAccessTokenExpiring } from 'utils/utilsModular';
import { getPlayerSummaries } from 'utils/ISteamUser';
import { isDopplerInName, getFormattedPLPercentage } from './simpleUtils';

const fetchTradeData = async (url, cachedToken) => {
  let token = cachedToken;
  if (!token || isSteamAccessTokenExpiring(token)) {
    token = await setAccessTokenFirstTime();
  }
  if (!token) return Promise.reject('access_token_invalid');

  const request = (accessToken) => fetch(new Request(`${url}&access_token=${encodeURIComponent(accessToken)}`));
  let response = await request(token);
  if (response.status === 401 || response.status === 403) {
    token = await setAccessTokenFirstTime();
    if (!token) return Promise.reject('access_token_invalid');
    response = await request(token);
  }
  if (!response.ok) {
    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    if (response.status === 401 || response.status === 403) return Promise.reject('access_token_invalid');
    throw new Error(response.statusText);
  }
  const body = await response.json();
  if (!body.response) throw new Error('Steam returned no trade response');
  return body;
};

const getTradeHistory = (
  maxTrades, startTime = 0, afterTrade = 0,
) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['steamAcessTokenValid', 'steamAcessToken', 'steamAcessTokenSource', 'prices', 'pricingProvider', 'currency', 'exchangeRate'],
    ({
      steamAcessTokenValid, steamAcessToken, steamAcessTokenSource, prices, pricingProvider, pricingMode, currency, exchangeRate,
    }) => {
      const url = `https://api.steampowered.com/IEconService/GetTradeHistory/v1/?max_trades=${maxTrades}&start_after_time=${startTime}&start_after_tradeid=${afterTrade}&get_descriptions=1&include_total=1&language=english`;
      fetchTradeData(url, steamAcessTokenValid && steamAcessTokenSource === 'community-cookie' ? steamAcessToken : null).then((body) => {
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
                more: body.response.more,
              });
            }).catch((err) => {
              console.log(err);
              reject(err);
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
    });
});

const getTradeOffers = (
  activesOnly, historicalOnly, includeDescriptions, sent, received,
) => new Promise((resolve, reject) => {
  chrome.storage.local.get(['steamAcessTokenValid', 'steamAcessToken', 'steamAcessTokenSource'], ({ steamAcessTokenValid, steamAcessToken, steamAcessTokenSource }) => {
    const url = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?get_received_offers=${received}&get_sent_offers=${sent}&active_only=${activesOnly}&historical_only=${historicalOnly}&get_descriptions=${includeDescriptions}&language=english`;
    fetchTradeData(url, steamAcessTokenValid && steamAcessTokenSource === 'community-cookie' ? steamAcessToken : null)
      .then((body) => resolve(body.response))
      .catch(reject);
  });
});

export { getTradeHistory, getTradeOffers };
