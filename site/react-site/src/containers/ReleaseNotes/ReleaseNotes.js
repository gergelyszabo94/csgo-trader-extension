import React from "react";

import Head from '../../components/Head/Head'

const releaseNotes = (props) => {
    const path = '/release-notes';

    props.setActiveNav(path);

    return  (
        <React.Fragment>
            <Head
                description="Release notes are meant to explain how to use new features and why certain design or policy decisions were made."
                title="CSGO Trader - Release Notes"
                path={path}
            />
            <h2>Release-Notes</h2>
        </React.Fragment>
    );
};

export default releaseNotes;