import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faCog } from '@fortawesome/free-solid-svg-icons';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import { trackEvent } from 'utils/analytics';
import Calculator from 'components/Popup/Calculator/Calculator';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import TelemetryConsent from 'components/Popup/TelemetryConsent';

const Popup = () => {
  // if there is any badge text it gets removed
  chrome.runtime.sendMessage({ badgetext: '' }, () => {});

  trackEvent({
    type: 'pageview',
    action: 'ExtensionPopupView',
  });

  const [showTelemetryConsent, setShowTelemetryConsent] = useState(false);
  const [links, setLinks] = useState([]);
  const [showCalc, doShowCalc] = useState(false);

  const saveConsentResult = (consented) => {
    chrome.storage.local.set({
      telemetryOn: consented,
      telemetryConsentSubmitted: true,
    }, () => {
      setShowTelemetryConsent(false);
    });
  };

  useEffect(() => {
    chrome.storage.local.get(['popupLinks', 'steamIDOfUser', 'telemetryConsentSubmitted'],
      ({ popupLinks, steamIDOfUser, telemetryConsentSubmitted }) => {
        const navLinks = popupLinks.map((link) => {
          if (link.active) {
            const URL = link.id === 'tradeoffers'
              ? steamIDOfUser !== ''
                ? `https://steamcommunity.com/profiles/${steamIDOfUser}/tradeoffers`
                : 'https://steamcommunity.com/app/730/tradingforum/'
              : link.url;
            return (
              <div key={link.id}>
                <NewTabLink to={URL}>{link.name}</NewTabLink>
              </div>
            );
          }
          return null;
        });
        setLinks(navLinks);
        if (!telemetryConsentSubmitted) setShowTelemetryConsent(true);
      });
  }, []);

  const LogoAndLinks = () => {
    return (
      <>
        <NewTabLink to="https://csgotrader.app" key="home">
          <img src="/images/cstlogo48.png" alt="CSGO Trader Logo" />
          <h5>
            <span className="orange">CSGO Trader </span>
            <span>
              {chrome.runtime.getManifest().version}
            </span>
          </h5>
        </NewTabLink>
        {
          showTelemetryConsent ? <TelemetryConsent submitConsent={saveConsentResult} /> : links
        }
      </>
    );
  };

  return (
    <>
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
    </>
  );
};

export default Popup;
