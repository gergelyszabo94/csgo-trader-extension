import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faPlay } from '@fortawesome/free-solid-svg-icons';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const CSVExport = ({ trades }) => {
  const [csvContent, setCsvContent] = useState(
    'Partner SteamID,Partner Name,P/L,Given Total,Received Total,Items Given,Items Taken\n',
  );
  const [showDownload, setShowDownload] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [exclude, setExclude] = useState(false);

  const startExport = () => {
    setStatusMessage('Exporting in progress');
    let lines = '';
    trades.forEach((trade) => {
      if (!exclude || (exclude
        && (trade.assets_given_desc !== 0 && trade.assets_received_desc.length !== 0))) {
        let givenItems = '';
        trade.assets_given_desc.forEach((item) => {
          givenItems += `${item.market_hash_name}(${item.price.price}),`;
        });
        let receivedItems = '';
        trade.assets_received_desc.forEach((item) => {
          receivedItems += `${item.market_hash_name}(${item.price.price}),`;
        });
        lines += `${trade.steamid_other},${trade.partnerSummary.personaname},${trade.profitLoss},${trade.givenTotal},${trade.receivedTotal},"${givenItems}","${receivedItems}"\n`;
      }
    });
    const encodedURI = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent + lines)}`;
    setCsvContent(encodedURI);
    setStatusMessage('Export finished, click the file icon to download the resulting .CSV file');
    setShowDownload(true);
  };

  const onExcludeChange = (event) => {
    const value = event.target.value;
    setExclude(value);
  };

  return (
    <div className="trade-history__controls">
      <h3>Export to .CSV</h3>
      <div>
        Config:
        <div>
          Exclude empty offers:&nbsp;
          <input
            type="checkbox"
            onChange={onExcludeChange}
            checked={exclude}
            title="Hide trades that are empty in one side"
          />
        </div>
      </div>
      <div>
        {statusMessage}
      </div>
      <CustomA11yButton
        action={startExport}
        title="Start export"
        id="startExport"
      >
        <FontAwesomeIcon
          icon={faPlay}
        />
      </CustomA11yButton>
      {
        showDownload
          ? (
            <a href={csvContent} download="trade_history_export.csv" title="Download trade_history_export.csv">
              <FontAwesomeIcon
                icon={faFileExport}
              />
            </a>
          )
          : null
      }
    </div>
  );
};

export default CSVExport;
