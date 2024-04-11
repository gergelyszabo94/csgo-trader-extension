import React, { useState } from 'react';

import { dateToISODisplay } from 'utils/dateTime';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

const SideList = (props) => {
  const { assets } = props;
  return (
    <ul style={{ listStyle: 'none' }}>
      {assets.map((item) => (
        <li key={item.assetid}>
          {item.market_hash_name}
          :
          <ul style={{ listStyle: 'none' }}>
            <li>
              Asset ID:
              {' '}
              {item.assetid}
            </li>
            <li>
              New Asset ID:
              {' '}
              {item.new_assetid}
            </li>
          </ul>
        </li>
      ))}
    </ul>
  );
};

const TradeHistoryDetailsPrint = (props) => {
  const { trade } = props;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <span style={{ float: 'right' }}>
        <CustomA11yButton
          action={() => { setShowDetails(!showDetails); }}
          title="Print trade technical details"
          id="printTradeDetails"
        >
          <FontAwesomeIcon icon={faPrint} />
        </CustomA11yButton>
      </span>
      <div className={showDetails ? 'tradePrintDetails' : 'tradePrintDetails hidden'}>
        Partner:
        <ul style={{ listStyle: 'none' }}>
          <li>
            Name:
            {' '}
            {trade.partnerSummary.personaname}
          </li>
          <li>
            SteamID:
            {' '}
            {trade.steamid_other}
          </li>
          <li>
            Profile Link:
            {' '}
            {trade.partnerSummary.profileurl}
          </li>
        </ul>
        Trade:
        <ul style={{ listStyle: 'none' }}>
          <li>
            ID:
            {' '}
            {trade.tradeid}
          </li>
          <li>
            Status:
            {' '}
            {trade.status}
          </li>
          <li>
            Unix timestamp:
            {' '}
            {trade.time_init}
          </li>
          <li>
            UTC time:
            {' '}
            {dateToISODisplay(trade.time_init)}
          </li>
        </ul>
        Items:
        <ul style={{ listStyle: 'none' }}>
          <li>
            Given:
            {trade.assets_given_desc ? <SideList assets={trade.assets_given_desc} /> : null}
          </li>
          <li>
            Received:
            {trade.assets_received_desc ? <SideList assets={trade.assets_received_desc} /> : null}
          </li>
        </ul>
      </div>
    </>
  );
};

export default TradeHistoryDetailsPrint;
