import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import TradeOffer from 'components/TradeOffer/TradeOffer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import NewTabLink from 'components/NewTabLink/NewTabLink';

const TradeHistory = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  const [trades, setTrades] = useState();

  const profilIdToUrl = (userId) => {
    return `https://steamcommunity.com/profiles/${userId}`;
  };

  useEffect(() => {
    document.title = 'Trade History';
    getTradeHistory(50, 0)
      .then((tradesResponse) => {
        console.log(tradesResponse);
        setTrades(tradesResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="container">
      <div className="trade-history">
        <h1 className="trade-history__headline">Trade History</h1>
        {trades !== undefined
          ? trades.map((trade) => {
            return (
              <div
                className="row trade-history__list-item"
                key={trade.tradeid}
              >
                <div className="col-md-12">
                  <h4 className="trade-history__title">
                    You have traded with&nbsp;
                    <NewTabLink
                      to={profilIdToUrl(trade.steamid_other)}
                      className="trade-history__partner"
                    >
                      --partner--
                    </NewTabLink>
                    .
                  </h4>
                </div>
                {TradeOffer({
                  assets: trade.assets_given_desc,
                })}
                <div className="col-md-2 ">
                  <div className="trade-history__exchange">
                    <span className="trade-history__third" title="Given Total">
                      {trade.givenTotalFormatted}
                    </span>
                    <span className="trade-history__third">
                        &nbsp;
                      <FontAwesomeIcon
                        className={`trade-history__icon trade-history__icon--${
                          trade.profitLoss >= 0
                            ? 'profit'
                            : 'loss'
                        }`}
                        icon={faExchangeAlt}
                      />
                    </span>
                    <span className="trade-history__third" title="Received Total">
                      {trade.receivedTotalFormatted}
                    </span>
                    <span
                      className={`trade-history__profit trade-history__profit--${
                        trade.profitLoss >= 0
                          ? 'profit'
                          : 'loss'
                      }`}
                      title="Profit/Loss made"
                    >
                      {trade.profitLossFormatted}
                    </span>
                  </div>
                </div>
                {TradeOffer({
                  assets: trade.assets_received_desc,
                })}
              </div>
            );
          })
          : null}
      </div>
    </div>
  );
};

export default TradeHistory;
