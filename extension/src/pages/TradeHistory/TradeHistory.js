import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';

const TradeHistory = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  useEffect(() => {
    document.title = 'Trade History';
  }, []);

  return (
    <div>
      <h1>Trade History</h1>
      <div className="trade-history">Trade History page</div>
    </div>
  );
};

export default TradeHistory;
