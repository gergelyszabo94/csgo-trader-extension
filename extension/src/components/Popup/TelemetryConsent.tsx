import React from 'react';

import NewTabLink from 'components/NewTabLink';

const TelemetryConsent = ({ submitConsent }) => {
    return (
        <>
            <div>Do you wish to help make the extension better by allowing the collection of usage analytics?</div>
            <div className='mt-2'>
                <button
                    type='submit'
                    onClick={() => {
                        submitConsent(true);
                    }}
                    className='button'
                >
                    Yes
                </button>
                <button
                    type='submit'
                    onClick={() => {
                        submitConsent(false);
                    }}
                    className='button'
                >
                    No
                </button>
            </div>
            <small>
                To make an informed decision check the
                <NewTabLink to='https://csgotrader.app/privacy/'> Privacy policy</NewTabLink>.
            </small>
        </>
    );
};

export default TelemetryConsent;
