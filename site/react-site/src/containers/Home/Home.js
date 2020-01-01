import React from "react";

import Head from '../../components/Head/Head'

const home = (props) => {
    const path = '/';

    props.setActiveNav(path);

    return  (
        <React.Fragment>
            <Head
                description="CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Steam Trading Enhancer Extension"
                path={path}
            />
            <h2>Home</h2>
        </React.Fragment>
    );
};

export default home;