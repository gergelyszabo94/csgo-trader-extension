import React from 'react';
import {Helmet} from "react-helmet";

const head = (props) => {
    return (
        <Helmet>
            <meta name="description" content={props.description}/>
            <meta property="og:description" content={props.description}/>
            <meta property="og:title" content={props.title} />
            <meta property="og:url" content={"https://csgotrader.app" + props.path}/>
            <link rel="canonical" href={"https://csgotrader.app" + props.path}/>
            <title>{props.title}</title>
        </Helmet>
    )
};

export default head;
