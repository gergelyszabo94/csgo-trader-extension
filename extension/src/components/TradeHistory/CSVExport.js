import React, { useState } from 'react';

const CSVExport = ({ trades }) => {
  const [csvContent, setCsvContent] = useState(
    'Partner SteamID,Partner Name,P/L,Given Total,Received Total,Items Given,Items Taken\n',
  );

  const startExport = () => {
    let lines = '';
    trades.forEach((trade) => {
      let givenItems = '';
      trade.assets_given_desc.forEach((item) => {
        givenItems += `${item.market_hash_name}(${item.price.price}),`;
      });
      let receivedItems = '';
      trade.assets_received_desc.forEach((item) => {
        receivedItems += `${item.market_hash_name}(${item.price.price}),`;
      });
      lines += `${trade.steamid_other},${trade.partnerSummary.personaname},${trade.profitLoss},${trade.givenTotal},${trade.receivedTotal},"${givenItems}","${receivedItems}"\n`;
    });
    const encodedURI = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent + lines)}`;
    setCsvContent(encodedURI);
  };

  return (
    <div className="trade-history__controls">
      <h3>Export to .CSV</h3>
      <button type="submit" onClick={startExport}>Start Export</button>
      <a href={csvContent} download="trade_history_export.csv">Download .CSV</a>
    </div>
  );
};

export default CSVExport;
