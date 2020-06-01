import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';

const TradeHistory = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  useEffect(() => {
    document.title = 'Trade History';
    getTradeHistory(10, 0).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <div>
      <h1>Trade History</h1>
      <div className="trade-history">Trade History page</div>
    </div>
  );
};

export default TradeHistory;
