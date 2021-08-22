import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from 'components/Options/Category';
import NewTabLink from 'components/NewTabLink';
import OfferHistory from './OfferHistory';
import React from 'react';
import Row from 'components/Options/Row';

export interface Rule {
    action: string;
    active: boolean;
    conditions: Condition[];
    operators: Operator[];
    value?: any;
    valueType?: any;
}

export type Operator = 'and' | 'or';

export interface Condition {
    type: string;
    value?: string | number | null;
    valueType?: null;
}

export interface HistoryEvent {
    offerID: string;
    rule: number;
    steamID: string;
    timestamp: number;
    type: string;
}

export interface HistoryEvents {
    events: HistoryEvent[];
}

const OfferAutomation = () => {
    return (
        <Category title='Trade Offer Automation'>
            <Row
                name='Monitor Incoming offers'
                id='monitorIncomingOffers'
                type='flipSwitchStorage'
                description={
                    <>
                        Monitors incoming offers and evaluates the automation rules
                        <ApiKeyIndicator />
                    </>
                }
            />
            <Row
                name='Send offers based on query params'
                id='sendOfferBasedOnQueryParams'
                type='flipSwitchStorage'
                description={
                    <>
                        Send trade offers based on query parameters. When turned on and you open a link with
                        &csgotrader_send=side(your/their)_type(name/id)appID_contextID_(market name / asset ID) in it
                        the extension sends the offer automatically. Useful for P2P trading and automation.
                        <NewTabLink to='https://csgotrader.app/release-notes/#2.9'>
                            {' '}
                            More info about this here{' '}
                        </NewTabLink>
                    </>
                }
            />
            <Row
                name='Select item based on query params (autofill)'
                id='selectItemsBasedOnQueryParams'
                type='flipSwitchStorage'
                description={`Select items in trade offers automatically based on query parameters.
          When turned on and you open a link with
            &csgotrader_select=side(your/their)_type(name/id)appID_contextID_(market name / asset ID)
            in it the extension will select the appropriate item and add it to the trade.
            Useful for P2P trading and automation.`}
            />
            <div className='row'>
                <OfferHistory />
            </div>
        </Category>
    );
};

export default OfferAutomation;
