import React from "react";

import Head from '../../components/Head/Head'

const steamGroup = (props) => {
    const path = '/group';

    props.setActiveNav(path);
    return  (
        <React.Fragment>
            <Head
                description="Steam Group - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Steam Group"
                path={path}
            />
            <h2>Steam Group</h2>
        </React.Fragment>
    );
};

export default steamGroup;