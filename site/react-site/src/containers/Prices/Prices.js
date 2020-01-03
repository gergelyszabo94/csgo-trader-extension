import React, {Fragment} from "react";

import Head from '../../components/Head/Head'

const prices = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <Fragment>
            <Head
                description="CSGO Trader - Describes how the extension calculates prices and where they are available"
                title="CSGO Trader - Prices"
                path={window.location.pathname}
            />
            <h2>Prices</h2>
        </Fragment>
    );
};

export default prices;