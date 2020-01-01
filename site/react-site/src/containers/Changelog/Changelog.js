import React from "react";

import Head from '../../components/Head/Head'

const changelog = (props) => {
    const path = '/changelog';

    props.setActiveNav(path);

    return  (
        <React.Fragment>
            <Head
                description="Changelog of CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Changelog"
                path={path}
            />
            <h2>Changelog</h2>
        </React.Fragment>
    );
};

export default changelog;