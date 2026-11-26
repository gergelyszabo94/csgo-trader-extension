import React, { useEffect, useState } from 'react';

import { getTradeHistory } from 'utils/IEconService';
import TradeOfferContent from 'components/TradeHistory/TradeOfferContent';
import TradeSummary from 'components/TradeHistory/TradeSummary';
import TradeHistoryControls from 'components/TradeHistory/TradeHistoryControls';

const TradeHistoryContent = () => {
  document.title = 'Trade History';

  const [trades, setTrades] = useState(null);
  const [totalTrades, setTotalTrades] = useState(0);
  const [lastTradeID, setLastTradeID] = useState(0);
  const [lastTradeTime, setLastTradeTime] = useState(0);
  const [historySize, setHistorySize] = useState(50);
  const [startTime, setStartTime] = useState(0);
  const [excludeEmpty, setExcludeEmpty] = useState(false);
  const [error, setError] = useState(null);

  const updateTrades = (next) => {
    setTrades(null);
    setError(null);
    getTradeHistory(historySize, next ? lastTradeTime : startTime, next ? lastTradeID : 0)
      .then((tradesResponse) => {
        const noEmptyTrades = [];
        tradesResponse.trades.forEach((trade) => {
          if (trade.assets_given_desc.length !== 0 && trade.assets_received_desc.length !== 0) {
            noEmptyTrades.push(trade);
          }
        });
        setTrades(excludeEmpty ? noEmptyTrades : tradesResponse.trades);
        setTotalTrades(tradesResponse.totalTrades);
        setLastTradeID(tradesResponse.lastTradeID);
        setLastTradeTime(tradesResponse.lastTradeTime);
      })
      .catch((err) => {
        console.log(err);
        setError(err === 'access_token_invalid'
          ? 'Could not load trade history. Sign in to Steam Community and try again.'
          : 'Could not load your trade history. Please try again later.');
      });
  };

  const loadNextBatch = () => {
    updateTrades(true);
  };

  useEffect(() => {
    updateTrades();
  }, [historySize, startTime, excludeEmpty]);

  return (
    <div className="container">
      <div className="trade-history">
        <h1 className="trade-history__headline clearfix">
          Trade History (
          { totalTrades }
          )
          {trades !== null ? <TradeSummary trades={trades} /> : null}
        </h1>
        <TradeHistoryControls
          setHistorySize={setHistorySize}
          historySize={historySize}
          setExcludeEmpty={setExcludeEmpty}
          setStartTime={setStartTime}
          updateTrades={updateTrades}
        />
        {
          error === null
            ? <TradeOfferContent trades={trades} type="history" loadNextBatch={loadNextBatch} />
            : <div className="warning">{error}</div>
        }
      </div>
    </div>
  );
};

export default TradeHistoryContent;
