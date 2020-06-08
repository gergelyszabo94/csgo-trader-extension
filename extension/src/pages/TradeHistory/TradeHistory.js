import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import TradeOffers from 'components/TradeHistory/TradeOffers';
import TradeSummary from 'components/TradeHistory/TradeSummary';
import Spinner from 'components/Spinner/Spinner';
import TradeHistoryControls from 'components/TradeHistory/TradeHistoryControls';

const TradeHistory = () => {
  document.title = 'Trade History';
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  const [trades, setTrades] = useState(null);
  const [historySize, setHistorySize] = useState(50);
  const [startTime, setStartTime] = useState(0);
  const [excludeEmpty, setExcludeEmpty] = useState(false);

  const updateTrades = () => {
    getTradeHistory(historySize, startTime)
      .then((tradesResponse) => {
        const noEmptyTrades = [];
        tradesResponse.forEach((trade) => {
          if (trade.assets_given_desc.length !== 0 && trade.assets_received_desc.length !== 0) {
            noEmptyTrades.push(trade);
          }
        });
        setTrades(excludeEmpty ? noEmptyTrades : tradesResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    updateTrades();
  }, [historySize, startTime, excludeEmpty]);

  return (
    <div className="container">
      <div className="trade-history">
        <h1 className="trade-history__headline clearfix">
          Trade History
          {trades !== null ? <TradeSummary trades={trades} /> : null}
        </h1>
        <TradeHistoryControls
          setHistorySize={setHistorySize}
          historySize={historySize}
          setExcludeEmpty={setExcludeEmpty}
        />

        {trades !== null ? (
          <TradeOffers trades={trades} />
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
