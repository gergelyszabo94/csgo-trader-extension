import React, { useState, useEffect } from 'react';
import { prettyPrintPrice } from 'utils/pricing';

const TradeSummary = ({ trades }) => {
  const [PL, setPL] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(['currency'], ({ currency }) => {
      let sum = 0;
      trades.forEach((trade) => {
        sum += Number(trade.profitLoss);
      });
      setPL(prettyPrintPrice(currency, sum.toFixed(2)));
    });
  }, []);

  return (
    <div className="trade-history__summary">
      P/L:&nbsp;
      {PL}
      &nbsp;in&nbsp;
      {trades.length}
      &nbsp;trades
    </div>
  );
};

export default TradeSummary;
