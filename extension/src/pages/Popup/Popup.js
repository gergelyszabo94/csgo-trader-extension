import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faCog } from '@fortawesome/free-solid-svg-icons';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import Calculator from 'components/Popup/Calculator/Calculator';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import LogoAndLinks from 'components/Popup/LogoAndLinks/LogoAndLinks';

const Popup = () => {
  // if there is any badge text it gets removed
  chrome.runtime.sendMessage({ badgetext: '' }, () => { });
  const [showCalc, doShowCalc] = useState(false);

  return (
    <div className="popup">
      {showCalc ? <Calculator /> : <LogoAndLinks />}
      <div className="bottomRow">
        <CustomA11yButton
          action={() => { doShowCalc(!showCalc); }}
          className="action"
          title="Calculator"
        >
          <FontAwesomeIcon icon={faCalculator} />
        </CustomA11yButton>
        <span className="action">
          <NewTabLink to="index.html">
            <FontAwesomeIcon icon={faCog} title="Open Options" />
          </NewTabLink>
        </span>
      </div>
    </div>
  );
};

export default Popup;
