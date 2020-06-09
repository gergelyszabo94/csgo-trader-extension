import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faPlay } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker/es';

import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import { getTradeHistory } from 'utils/IEconService';

const CSVExport = () => {
  let csvContent = 'Partner SteamID,Partner Name,Time,P/L,Given Total,Received Total,Items Given,Items Taken\n';

  const [downloadURI, setDownloadURI] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [exclude, setExclude] = useState(false);
  const [exportStartTime, setExportStartTime] = useState(Date.now());
  const [exportEndTime, setExportEndTime] = useState(Date.now());
  const [exportStartTimeUnix, setExportStartTimeUnix] = useState(
    parseInt(new Date().getTime() / 1000),
  );
  const [exportEndTimeUnix, setExportEndTimeUnix] = useState(parseInt(new Date().getTime() / 1000));
  const [requestCount, setRequestCount] = useState(0);

  const finishExport = () => {
    const encodedURI = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    setDownloadURI(encodedURI);
    setStatusMessage('Export finished, click the file icon to download the resulting .CSV file');
    setShowDownload(true);
  };

  const loadNextChunk = (startTime, lastTradeID) => {
    setRequestCount(requestCount + 1);
    setStatusMessage(`Request ${requestCount} received`);
    getTradeHistory(100, startTime, lastTradeID).then((tradesResponse) => {
      let lines = '';
      tradesResponse.trades.forEach((trade) => {
        if ((!exclude || (exclude
          && (trade.assets_given_desc !== 0 && trade.assets_received_desc.length !== 0)))
          && exportEndTimeUnix >= trade.time_init) {
          let givenItems = '';
          trade.assets_given_desc.forEach((item) => {
            givenItems += `${item.market_hash_name}(${item.price.price}),`;
          });
          let receivedItems = '';
          trade.assets_received_desc.forEach((item) => {
            receivedItems += `${item.market_hash_name}(${item.price.price}),`;
          });
          lines += `${trade.steamid_other},${trade.partnerSummary.personaname},${new Date(trade.time_init * 1000)},${trade.profitLoss},${trade.givenTotal},${trade.receivedTotal},"${givenItems}","${receivedItems}"\n`;
        }
      });
      csvContent += lines;
      finishExport();
    });
  };

  const startExport = () => {
    setStatusMessage('Exporting in progress');
    loadNextChunk(exportStartTimeUnix);
  };

  const onExcludeChange = (event) => {
    const value = event.target.value;
    setExclude(value);
  };

  const onStartTimeChange = (date) => {
    setExportStartTime(date);
    const unixTimeStamp = parseInt(date.getTime() / 1000);
    setExportStartTimeUnix(unixTimeStamp);
  };

  const onEndTimeChange = (date) => {
    setExportEndTime(date);
    const unixTimeStamp = parseInt(date.getTime() / 1000);
    setExportEndTimeUnix(unixTimeStamp);
  };

  return (
    <div className="trade-history__controls">
      <h3>Export to .CSV</h3>
      <div>
        <div>
          Exclude empty offers:&nbsp;
          <input
            type="checkbox"
            onChange={onExcludeChange}
            checked={exclude}
            title="Hide trades that are empty in one side"
          />
          &nbsp;
          After:&nbsp;
          <DatePicker selected={exportStartTime} onChange={onStartTimeChange} />
          &nbsp;
          and before:&nbsp;
          <DatePicker selected={exportEndTime} onChange={onEndTimeChange} />
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
            <a href={downloadURI} download="trade_history_export.csv" title="Download trade_history_export.csv">
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
