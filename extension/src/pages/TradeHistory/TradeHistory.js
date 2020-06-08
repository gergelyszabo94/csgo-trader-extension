import React, { useEffect, useState } from 'react';

import { trackEvent } from 'utils/analytics';
import { getTradeHistory } from 'utils/IEconService';
import TradeOffer from 'components/TradeOffer/TradeOffer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { prettyTimeAgo, dateToISODisplay } from 'utils/dateTime';
import TradeSummary from 'components/TradeSummary/TradeSummary';
import Spinner from 'components/Spinner/Spinner';
import TradeHistoryControls from 'components/TradeHistoryControls/TradeHistoryControls';

const TradeHistory = () => {
  trackEvent({
    type: 'pageview',
    action: 'ExtensionTradeHistoryView',
  });

  const [historySize, setHistorySize] = useState(50);

  const [trades, setTrades] = useState(null);

  const [steamId, setSteamId] = useState(null);

  const profilIdToUrl = (userId) => {
    return `https://steamcommunity.com/profiles/${userId}`;
  };

  useEffect(() => {
    document.title = 'Trade History';
    setTrades(null);
    chrome.storage.local.get(['steamIDOfUser'], ({ steamIDOfUser }) => {
      console.log(steamIDOfUser);
      setSteamId(steamIDOfUser);
    });
    getTradeHistory(historySize, 0)
      .then((tradesResponse) => {
        console.log(tradesResponse);
        setTrades(tradesResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [historySize]);

  return (
    <div className="container">
      <div className="trade-history">
        <h1 className="trade-history__headline clearfix">
          Trade History
          {trades !== null ? <TradeSummary trades={trades} /> : null}
        </h1>
        <TradeHistoryControls setHistorySize={setHistorySize} />

        {trades !== null ? (
          trades.map((trade, index) => {
            return (
              <div className="row trade-history__list-item" key={trade.tradeid}>
                <div className="col-12">
                  <h4 className="trade-history__title">
                    #
                    {Number(index) + 1}
                    &nbsp;You have traded with&nbsp;
                    <NewTabLink
                      to={profilIdToUrl(trade.steamid_other)}
                      className="trade-history__partner"
                    >
                      {trade.partnerSummary.personaname}
                    </NewTabLink>
                    .
                  </h4>
                  <span
                    className="trade-history__date-of-trade"
                    title={dateToISODisplay(trade.time_init)}
                  >
                    {prettyTimeAgo(trade.time_init)}
                  </span>
                </div>
                {TradeOffer({
                  assets: trade.assets_given_desc,
                  profileid: trade.steamid_other,
                })}
                {TradeOffer({
                  assets: trade.assets_received_desc,
                  profileid: steamId,
                })}
                <div className="col-12 ">
                  <div className="trade-history__exchange">
                    <span className="trade-history__third" title="Given Total">
                      {trade.givenTotalFormatted}
                    </span>
                    <span className="trade-history__third trade-history__third--narrower">
                      &nbsp;
                      <FontAwesomeIcon
                        className={`trade-history__icon trade-history__icon--${
                          trade.profitLoss >= 0 ? 'profit' : 'loss'
                        }`}
                        icon={faExchangeAlt}
                      />
                    </span>
                    <span
                      className="trade-history__third"
                      title="Received Total"
                    >
                      {trade.receivedTotalFormatted}
                    </span>
                    <span
                      className={`trade-history__profit trade-history__profit--${
                        trade.profitLoss >= 0 ? 'profit' : 'loss'
                      }`}
                      title="Profit/Loss made"
                    >
                      {trade.profitLossFormatted}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
