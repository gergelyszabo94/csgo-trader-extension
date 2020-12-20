import React, {Fragment} from 'react';
import {Container} from 'react-bootstrap';

import Head from '../../components/Head/Head';
import TwoDotTen from '../../components/ReleaseNotes/Content/TwoDotTen';
import TwoDotNine from '../../components/ReleaseNotes/Content/TwoDotNine';
import TwoDotSeven from '../../components/ReleaseNotes/Content/TwoDotSeven';
import TwoDotSix from '../../components/ReleaseNotes/Content/TwoDotSix';
import TwoDotFive from '../../components/ReleaseNotes/Content/TwoDotFive';
import TwoDotFour from '../../components/ReleaseNotes/Content/TwoDotFour';
import TwoDotThree from '../../components/ReleaseNotes/Content/TwoDotThree';
import TwoDotTwo from '../../components/ReleaseNotes/Content/TwoDotTwo';
import TwoDotOne from '../../components/ReleaseNotes/Content/TwoDotOne';
import Two from '../../components/ReleaseNotes/Content/Two';
import OneDotTwentySix from '../../components/ReleaseNotes/Content/OneDotTwentySix';
import OneDotTwentyFive from '../../components/ReleaseNotes/Content/OneDotTwentyFive';
import OneDotTwentyFour from '../../components/ReleaseNotes/Content/OneDotTwentyFour';
import OneDotTwentyThree from '../../components/ReleaseNotes/Content/OneDotTwentyThree';
import OneDotTwentyTwo from '../../components/ReleaseNotes/Content/OneDotTwentyTwo';
import OneDotTwenty from '../../components/ReleaseNotes/Content/OneDotTwenty';

const releaseNotes = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
      <Fragment>
          <Head
            description='Release notes are meant to explain how to use new features and why certain design or policy decisions were made.'
            title='CSGO Trader - Release Notes'
            path={window.location.pathname}
          />

          <h1>Release-Notes</h1>
          <Container className='buildingBlock'>
              Release notes are meant to explain how to use new features and why certain design or policy decisions were made.
              They are published when a new version of the extension is submitted the distribution platforms.
              The platforms (Chrome Web Store, MozilLa Addons) review submissions before they are available for download.
              This means that the latest version might not have rolled out to your platform yet when you are reading this.
          </Container>
          <TwoDotTen />
          <TwoDotNine />
          <TwoDotSeven />
          <TwoDotSix />
          <TwoDotFive />
          <TwoDotFour />
          <TwoDotThree />
          <TwoDotTwo />
          <TwoDotOne />
          <Two />
          <OneDotTwentySix />
          <OneDotTwentyFive />
          <OneDotTwentyFour />
          <OneDotTwentyThree />
          <OneDotTwentyTwo />
          <OneDotTwenty />
      </Fragment>
    );
};

export default releaseNotes;