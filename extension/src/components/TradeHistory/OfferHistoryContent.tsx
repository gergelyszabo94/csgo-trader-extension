import React from 'react';
import TradeOfferHistorySide from 'components/TradeHistory/TradeOfferHistorySide';
import NewTabLink from 'components/NewTabLink/NewTabLink';
import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { getProperStyleSteamIDFromOfferStyle } from 'utils/steamID';
import { offerStates } from 'utils/static/offers';

const OfferHistoryContent = ({ offers }) => {
    const profileIDToURL = (userId) => {
        return `https://steamcommunity.com/profiles/${userId}`;
    };

    return offers.map((offer) => {
        return (
            <div className='row trade-history__list-item' key={offer.tradeofferid}>
                <div className='col-12'>
                    <h4 className='trade-history__title'>
                        Offer from:&nbsp;
                        <NewTabLink
                            to={profileIDToURL(
                                getProperStyleSteamIDFromOfferStyle(offer.accountid_other),
                            )}
                            className='trade-history__partner'
                        >
                            {offer.partnerSummary.personaname}
                        </NewTabLink>
                        .
                    </h4>
                    <span
                        className='trade-history__date-of-trade'
                        title={dateToISODisplay(offer.time_updated)}
                    >
                        {prettyTimeAgo(offer.time_updated)}
                    </span>
                    <OfferMessage message={offer.message} />
                    <OfferState state={offer.trade_offer_state} />
                </div>
                {TradeOfferHistorySide({
                    assets: offer.assets_given_desc,
                    itemsWithoutDescriptions: offer.itemsGivenWithoutDescriptions,
                })}
                {TradeOfferHistorySide({
                    assets: offer.assets_received_desc,
                    itemsWithoutDescriptions: offer.itemsToReceiveWithoutDescriptions,
                })}
                <div className='col-12 '>
                    <div className='trade-history__exchange'>
                        <span className='trade-history__third' title='Given Total'>
                            {offer.givenTotalFormatted}
                        </span>
                        <span className='trade-history__third trade-history__third--narrower'>
                            &nbsp;
                            <FontAwesomeIcon
                                className={`trade-history__icon trade-history__icon--${
                                    offer.profitLoss >= 0 ? 'profit' : 'loss'
                                }`}
                                icon={faExchangeAlt}
                            />
                        </span>
                        <span className='trade-history__third' title='Received Total'>
                            {offer.receivedTotalFormatted}
                        </span>
                        <span
                            className={`trade-history__profit trade-history__profit--${
                                offer.profitLoss >= 0 ? 'profit' : 'loss'
                            }`}
                            title='Profit/Loss made'
                        >
                            {offer.profitLossFormatted}
                            &nbsp;
                            {offer.PLPercentageFormatted}
                        </span>
                    </div>
                </div>
            </div>
        );
    });
};

const OfferMessage = ({ message }) => {
    return message !== '' ? (
        <div>
            Message: &nbsp;&quot;
            {message}
            &quot;
        </div>
    ) : null;
};

const OfferState = ({ state }) => {
    return (
        <div>
            State:&nbsp;
            {offerStates[state].pretty}
        </div>
    );
};

export default OfferHistoryContent;
