import React, { useEffect, useState } from 'react';

import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';

import NewTabLink from 'components/NewTabLink';
import TradeOfferSide from 'components/TradeHistory/TradeOfferSide';

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TradeOffers = ({ trades }) => {
    const [steamID, setSteamID] = useState(null);

    useEffect(() => {
        chrome.storage.local.get(['steamIDOfUser'], ({ steamIDOfUser }) => {
            setSteamID(steamIDOfUser);
        });
    }, []);

    const profileIDToURL = (userId) => {
        return `https://steamcommunity.com/profiles/${userId}`;
    };

    return trades.map((trade, index) => {
        return (
            <div className='row trade-history__list-item' key={trade.tradeid}>
                <div className='col-12'>
                    <h4 className='trade-history__title'>
                        #{Number(index) + 1}
                        &nbsp;You have traded with&nbsp;
                        <NewTabLink to={profileIDToURL(trade.steamid_other)} className='trade-history__partner'>
                            {trade.partnerSummary.personaname}
                        </NewTabLink>
                        .
                    </h4>
                    <span className='trade-history__date-of-trade' title={dateToISODisplay(trade.time_init)}>
                        {prettyTimeAgo(trade.time_init)}
                    </span>
                </div>
                {TradeOfferSide({
                    assets: trade.assets_given_desc,
                    profileid: trade.steamid_other,
                })}
                {TradeOfferSide({
                    assets: trade.assets_received_desc,
                    profileid: steamID,
                })}
                <div className='col-12 '>
                    <div className='trade-history__exchange'>
                        <span className='trade-history__third' title='Given Total'>
                            {trade.givenTotalFormatted}
                        </span>
                        <span className='trade-history__third trade-history__third--narrower'>
                            &nbsp;
                            <FontAwesomeIcon
                                className={`trade-history__icon trade-history__icon--${
                                    trade.profitLoss >= 0 ? 'profit' : 'loss'
                                }`}
                                icon={faExchangeAlt}
                            />
                        </span>
                        <span className='trade-history__third' title='Received Total'>
                            {trade.receivedTotalFormatted}
                        </span>
                        <span
                            className={`trade-history__profit trade-history__profit--${
                                trade.profitLoss >= 0 ? 'profit' : 'loss'
                            }`}
                            title='Profit/Loss made'
                        >
                            {trade.profitLossFormatted}
                            &nbsp;
                            {trade.PLPercentageFormatted}
                        </span>
                    </div>
                </div>
            </div>
        );
    });
};

export default TradeOffers;
