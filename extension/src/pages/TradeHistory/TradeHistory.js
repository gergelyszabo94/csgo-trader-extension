import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import TradeOffers from 'components/TradeHistory/TradeOffers';
import TradeSummary from 'components/TradeHistory/TradeSummary';
import Spinner from 'components/Spinner/Spinner';
import TradeHistoryControls from 'components/TradeHistory/TradeHistoryControls';
import CSVExport from 'components/TradeHistory/CSVExport';

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
  const [error, setError] = useState(null);

  const updateTrades = () => {
    setTrades(null);
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
        setError('Could not load your offer history, Steam might be done or you don\'t have your API key set.');
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
          setStartTime={setStartTime}
        />
        <CSVExport trades={trades} />
        {
          error === null
            ? <TradeOffersContent trades={trades} />
            : <div className="warning">{error}</div>
        }
      </div>
    </div>
  );
};

const TradeOffersContent = ({ trades }) => {
  return trades !== null
    ? (<TradeOffers trades={trades} />)
    : (<Spinner />);
};

export default TradeHistory;
