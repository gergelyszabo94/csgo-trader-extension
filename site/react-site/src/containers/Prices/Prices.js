import React from 'react';

import Head from '../../components/Head/Head'

const prices = (props) => {
    const path = '/prices';

    props.setActiveNav(path);

    return  (
        <React.Fragment>
            <Head
                description="CSGO Trader - Describes how the extension calculates prices and where they are available"
                title="CSGO Trader - Prices"
                path={path}
            />
            <h2>Prices</h2>
        </React.Fragment>
    );
};

export default prices;