import React from "react";

import Head from '../../components/Head/Head'

const changelog = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <React.Fragment>
            <Head
                description="Changelog of CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Changelog"
                path={window.location.pathname}
            />
            <h2>Changelog</h2>
        </React.Fragment>
    );
};

export default changelog;