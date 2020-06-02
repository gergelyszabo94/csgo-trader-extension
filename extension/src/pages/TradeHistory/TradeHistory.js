import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import TradeOffer from 'components/TradeOffer/TradeOffer';

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

  return (
    <div className="container">
      <h1>Trade History</h1>
      <div className="trade-histoy ">
        {trades !== undefined
          ? trades.map((trade) => {
            return (
              <div
                className="row trade-history__list-item"
                key={trade.tradeid}
              >
                {trade.assets_given_desc.length !== 0
                  ? TradeOffer({
                    title: 'Assets given',
                    assets: trade.assets_given_desc,
                  })
                  : null}
                {trade.assets_received_desc.length !== 0
                  ? TradeOffer({
                    title: 'Assets received',
                    assets: trade.assets_received_desc,
                  })
                  : null}
              </div>
            );
          })
          : null}
      </div>
    </div>
  );
};

export default TradeHistory;
