import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import NewTabLink from 'components/NewTabLink/NewTabLink';

const TradeHistory = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  const [trades, setTrades] = useState();

  useEffect(() => {
    document.title = 'Trade History';
    getTradeHistory(10, 0)
      .then((tradesResponse) => {
        setTrades(tradesResponse);
        console.log(tradesResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const urlIconToString = (iconURL) => {
    return `https://steamcommunity.com/economy/image/${iconURL}/256x256`;
  };

  const itemUrlToString = (appid, marketHashName) => {
    return `https://steamcommunity.com/market/listings/${appid}/${marketHashName}`;
  };

  return (
    <div>
      <h1>Trade History</h1>
      <div className="trade-histoy">
        {trades !== undefined
          ? trades.map((trade) => {
            return (
              <div className="trade-history__item" key={trade.tradeid}>
                {trade.assets_given_desc.length !== 0 ? (
                  <div className="assets">
                    <h3>Assets given</h3>
                    <div className="assets__items">
                      {trade.assets_given_desc.map((asset) => {
                        return (
                          <div className="assets__item">
                            <h3>
                              <NewTabLink
                                to={itemUrlToString(
                                  asset.appid,
                                  asset.market_hash_name,
                                )}
                              >
                                {asset.market_hash_name}
                              </NewTabLink>
                            </h3>
                            <img
                              key={asset.assetid}
                              src={urlIconToString(asset.icon_url)}
                              alt={asset.market_hash_name}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {trade.assets_received_desc.length !== 0 ? (
                  <div className="assets">
                    <h3>Assets received</h3>

                    <div className="assets__items">
                      {trade.assets_received_desc.map((asset) => {
                        return (
                          <div className="assets__item">
                            <h3>
                              <NewTabLink
                                to={itemUrlToString(
                                  asset.appid,
                                  asset.market_hash_name,
                                )}
                              >
                                {asset.market_hash_name}
                              </NewTabLink>
                            </h3>
                            <img
                              key={asset.assetid}
                              src={urlIconToString(asset.icon_url)}
                              alt={asset.market_hash_name}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
          : null}
      </div>
    </div>
  );
};

export default TradeHistory;
