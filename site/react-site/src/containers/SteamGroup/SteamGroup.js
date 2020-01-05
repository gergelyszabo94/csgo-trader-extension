import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';

const steamGroup = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);
    return  (
        <Fragment>
            <Head
                description="Steam Group - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Steam Group"
                path={window.location.pathname}
            />

            <h1>Steam Group</h1>
            <Container className='buildingBlock'>
                Join <NewTabLink to='https://steamcommunity.com/groups/csgotraderextension'> CSGO Trader Chrome Extension Steam Group</NewTabLink> for discussions surrounding the extension.
            <br/>
                    Report bugs in the <NewTabLink to='https://steamcommunity.com/groups/csgotraderextension/discussions/0/1630790506917547249/'> bug reports topic</NewTabLink>
                <br/>
                    Share your ideas in the <NewTabLink to='https://steamcommunity.com/groups/csgotraderextension/discussions/0/1630790506917551589/'> feature requests topic</NewTabLink>
            </Container>
        </Fragment>
);
};

export default steamGroup;