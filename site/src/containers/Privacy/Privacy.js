import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';

const privacy = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);
    return  (
        <Fragment>
            <Head
                description="Privacy - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Privacy"
                path={window.location.pathname}
            />

            <h1>Privacy</h1>
            <Container className='buildingBlock'>
                <p>This page is not meant to be interpreted as a legal document. It explains what data is collected where in everyday plain English.</p>
                <h2>On the site (csgotrader.app)</h2>
                <p>Google Analytics is running on the site, it uses cookies. It's just a static site for now, it does not collect or store any kind of personal information.</p>
                <h2>In the browser extension</h2>
                <p>When the "Collect usage data" option is enabled (on by default), anonymized usage data is reported for analytics purposes.
                    This includes user actions (for example the user has viewed their inventory or market listings, sorted their items, generated a list of their items) and the extension preferences they set
                    (any potential identity revealing preferences like customization is only reported as "custom").
                    The extension is only allowed to run on a very limited set of pages, it does not have permission to collect a users general browsing data.
                    Any information that could identify a person is removed before it's sent, a random client ID is generated and reported.
                    The analytics collection solution is a first party service.
                    It helps the developers understand how the extension is used and is not shared with any third parties.
                    An aggregated form of this data may be displayed publicly in a dashboard format.
                    If you want the exact details of what is collected and reported check the
                    <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension'> source code</NewTabLink>.
                </p>
            </Container>
        </Fragment>
    );
};

export default privacy;