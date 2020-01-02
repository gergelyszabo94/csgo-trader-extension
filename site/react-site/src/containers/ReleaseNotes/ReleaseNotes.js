import React from "react";

import Head from '../../components/Head/Head'

const releaseNotes = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <React.Fragment>
            <Head
                description="Release notes are meant to explain how to use new features and why certain design or policy decisions were made."
                title="CSGO Trader - Release Notes"
                path={window.location.pathname}
            />
            <h2>Release-Notes</h2>
        </React.Fragment>
    );
};

export default releaseNotes;