import React from 'react';

import Head from '../../components/Head/Head'

const prices = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);
    props.setActiveNav(window.location.pathname);

    return  (
        <React.Fragment>
            <Head
                description="CSGO Trader - Describes how the extension calculates prices and where they are available"
                title="CSGO Trader - Prices"
                path={window.location.pathname}
            />
            <h2>Prices</h2>
        </React.Fragment>
    );
};

export default prices;