import React from "react";

import Head from '../../components/Head/Head'

const steamGroup = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);
    return  (
        <React.Fragment>
            <Head
                description="Steam Group - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Steam Group"
                path={window.location.pathname}
            />
            <h2>Steam Group</h2>
        </React.Fragment>
    );
};

export default steamGroup;