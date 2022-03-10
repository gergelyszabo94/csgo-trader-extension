import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';

import TwoDotFourteenDotOne from '../../components/Changelog/Content/TwoDotFourteenDotOne.js';
import TwoDotFourteen from '../../components/Changelog/Content/TwoDotFourteen.js';
import TwoDotThirteen from '../../components/Changelog/Content/TwoDotThirteen.js';
import TwoDotTwelveDotOne from '../../components/Changelog/Content/TwoDotTwelveDotOne.js';
import TwoDotTwelve from '../../components/Changelog/Content/TwoDotTwelve.js';
import TwoDotEleven from '../../components/Changelog/Content/TwoDotEleven.js';
import TwoDotTenDotTwo from '../../components/Changelog/Content/TwoDotTenDotTwo.js';
import TwoDotTenDotOne from '../../components/Changelog/Content/TwoDotTenDotOne.js';
import TwoDotTen from '../../components/Changelog/Content/TwoDotTen.js';
import TwoDotNineDotTwo from '../../components/Changelog/Content/TwoDotNineDotTwo.js';
import TwoDotNineDotOne from '../../components/Changelog/Content/TwoDotNineDotOne.js';
import TwoDotNine from '../../components/Changelog/Content/TwoDotNine.js';
import TwoDotEight from '../../components/Changelog/Content/TwoDotEight.js';
import TwoDotSeven from '../../components/Changelog/Content/TwoDotSeven.js';
import TwoDotSixDotThree from '../../components/Changelog/Content/TwoDotSixDotThree.js';
import TwoDotSixDotTwo from '../../components/Changelog/Content/TwoDotSixDotTwo.js';
import TwoDotSixDotOne from '../../components/Changelog/Content/TwoDotSixDotOne.js';
import TwoDotSix from '../../components/Changelog/Content/TwoDotSix.js';
import TwoDotFive from '../../components/Changelog/Content/TwoDotFive.js';
import TwoDotFourDotOne from '../../components/Changelog/Content/TwoDotFourDotOne';
import TwoDotFour from '../../components/Changelog/Content/TwoDotFour.js';
import TwoDotThree from '../../components/Changelog/Content/TwoDotThree.js';
import TwoDotTwo from '../../components/Changelog/Content/TwoDotTwo.js';
import TwoDotOneDotTwo from '../../components/Changelog/Content/TwoDotOneDotTwo.js';
import TwoDotOneDotOne from '../../components/Changelog/Content/TwoDotOneDotOne.js';
import TwoDotOne from '../../components/Changelog/Content/TwoDotOne.js';
import Two from '../../components/Changelog/Content/Two.js';
import OneDotTwentySixDotOne from '../../components/Changelog/Content/OneDotTwentySixDotOne.js';
import OneDotTwentySix from '../../components/Changelog/Content/OneDotTwentySix.js';
import OneDotTwentyFiveDotOne from '../../components/Changelog/Content/OneDotTwentyFiveDotOne.js';
import OneDotTwentyFive from '../../components/Changelog/Content/OneDotTwentyFive.js';
import OneDotTwentyFour from '../../components/Changelog/Content/OneDotTwentyFour.js';
import OneDotTwentyThreeDotOne from '../../components/Changelog/Content/OneDotTwentyThreeDotOne';
import OneDotTwentyThree from '../../components/Changelog/Content/OneDotTwentyThree';
import OneDotTwentyTwo from '../../components/Changelog/Content/OneDotTwentyTwo';
import OneDotTwentyOneDotOne from '../../components/Changelog/Content/OneDotTwentyOneDotOne';
import OneDotTwentyOne from '../../components/Changelog/Content/OneDotTwentyOne';
import OneDotTwentyDotOne from '../../components/Changelog/Content/OneDotTwentyDotOne';
import OneDotTwenty from '../../components/Changelog/Content/OneDotTwenty';
import OneDotNineTeenDotTwo from '../../components/Changelog/Content/OneDotNineTeenDotTwo';
import OneDotNineTeenDotOne from '../../components/Changelog/Content/OneDotNineTeenDotOne';
import OneDotNineTeen from '../../components/Changelog/Content/OneDotNineTeen';
import OneDotEighteen from '../../components/Changelog/Content/OneDotEighteen';
import OneDotSeventeenDotOne from '../../components/Changelog/Content/OneDotSeventeenDotOne';
import OneDotSeventeen from '../../components/Changelog/Content/OneDotSeventeen';
import OneDotSixteenDotOne from '../../components/Changelog/Content/OneDotSixteenDotOne';
import OneDotSixteen from '../../components/Changelog/Content/OneDotSixteen';
import OneDotFifteen from '../../components/Changelog/Content/OneDotFifteen';
import OneDotFourteenDotTwo from '../../components/Changelog/Content/OneDotFourteenDotTwo';
import OneDotFourteenDotOne from '../../components/Changelog/Content/OneDotFourteenDotOne';
import OneDotFourteen from '../../components/Changelog/Content/OneDotFourteen';
import OneDotThirteenDotOne from '../../components/Changelog/Content/OneDotThirteenDotOne';
import OneDotThirteen from '../../components/Changelog/Content/OneDotThirteen';
import OneDotTwelve from '../../components/Changelog/Content/OneDotTwelve';
import OneDotElevenDotOne from '../../components/Changelog/Content/OneDotElevenDotOne';
import OneDotEleven from '../../components/Changelog/Content/OneDotEleven';
import OneDotTenDotOne from '../../components/Changelog/Content/OneDotTenDotOne';
import OneDotTen from '../../components/Changelog/Content/OneDotTen';
import OneDotNine from '../../components/Changelog/Content/OneDotNine';
import OneDotEightDotTwo from '../../components/Changelog/Content/OneDotEightDotTwo';
import OneDotEightDotOne from '../../components/Changelog/Content/OneDotEightDotOne';
import OneDotEight from '../../components/Changelog/Content/OneDotEight';
import OneDotSeven from '../../components/Changelog/Content/OneDotSeven';
import OneDotSix from '../../components/Changelog/Content/OneDotSix';

const changelog = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <Fragment>
            <Head
                description="Changelog of CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Changelog"
                path={window.location.pathname}
            />

            <h1>Changelog</h1>
            <Container className='buildingBlock'>
                Changelogs are published when a new version of the extension is submitted the distribution platforms.
                The platforms (Chrome Web Store, Mozilla Addons, Edge Add-ons) review submissions before they are available for download.
                This means that the latest version might not have rolled out to your platform yet when you are reading this.
            </Container>
            <TwoDotFourteenDotOne />
            <TwoDotFourteen />
            <TwoDotThirteen />
            <TwoDotTwelveDotOne />
            <TwoDotTwelve />
            <TwoDotEleven />
            <TwoDotTenDotTwo />
            <TwoDotTenDotOne />
            <TwoDotTen />
            <TwoDotNineDotTwo />
            <TwoDotNineDotOne />
            <TwoDotNine />
            <TwoDotEight />
            <TwoDotSeven />
            <TwoDotSixDotThree />
            <TwoDotSixDotTwo />
            <TwoDotSixDotOne />
            <TwoDotSix />
            <TwoDotFive />
            <TwoDotFourDotOne />
            <TwoDotFour />
            <TwoDotThree />
            <TwoDotTwo />
            <TwoDotOneDotTwo />
            <TwoDotOneDotOne />
            <TwoDotOne />
            <Two />
            <OneDotTwentySixDotOne />
            <OneDotTwentySix />
            <OneDotTwentyFiveDotOne />
            <OneDotTwentyFive />
            <OneDotTwentyFour />
            <OneDotTwentyThreeDotOne />
            <OneDotTwentyThree />
            <OneDotTwentyTwo />
            <OneDotTwentyOneDotOne />
            <OneDotTwentyOne />
            <OneDotTwentyDotOne />
            <OneDotTwenty />
            <OneDotNineTeenDotTwo />
            <OneDotNineTeenDotOne />
            <OneDotNineTeen />
            <OneDotEighteen />
            <OneDotSeventeenDotOne />
            <OneDotSeventeen />
            <OneDotSixteenDotOne />
            <OneDotSixteen />
            <OneDotFifteen />
            <OneDotFourteenDotTwo />
            <OneDotFourteenDotOne />
            <OneDotFourteen />
            <OneDotThirteenDotOne />
            <OneDotThirteen />
            <OneDotTwelve />
            <OneDotElevenDotOne />
            <OneDotEleven />
            <OneDotTenDotOne />
            <OneDotTen />
            <OneDotNine />
            <OneDotEightDotTwo />
            <OneDotEightDotOne />
            <OneDotEight />
            <OneDotSeven />
            <OneDotSix />
        </Fragment>
    );
};

export default changelog;