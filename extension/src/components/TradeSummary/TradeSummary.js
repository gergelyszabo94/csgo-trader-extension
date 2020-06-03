import React from 'react';

const TradeSummary = (trades) => {
  let sum = 0;
  const numbersOfTrade = trades.length;

  trades.forEach((trade) => {
    sum += Number(trade.profitLoss);
  });

  return (
    <div className="trade-history__summary">
      P/L:&nbsp;
      {sum.toFixed(2)}
      &nbsp;in&nbsp;
      {numbersOfTrade}
      &nbsp;trades
    </div>
  );
};

export default TradeSummary;
