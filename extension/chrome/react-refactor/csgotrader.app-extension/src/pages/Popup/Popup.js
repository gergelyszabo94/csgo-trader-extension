import React, {useState, useEffect } from "react";
import NewTabLink from 'components/NewTabLink/NewTabLink';

const Popup = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (data.length === 0) {
      getDataFromStorage();
    }
  }, []);
  const getDataFromStorage = () => {
    chrome.storage.local.get(["popupLinks", "steamIDOfUser"], result => {
      const template = [];
      template.push(
          <NewTabLink to='https://csgotrader.app' key='home'>
            <img src="/images/cstlogo48.png" />
            <h5>
              CSGO Trader <span>{chrome.runtime.getManifest().version}</span>
            </h5>
          </NewTabLink>
      );

      result.popupLinks.map(link => {
        if (link.active) {
          const URL =
            link.id === "tradeoffers"
              ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers`
              : link.url;
          template.push(
            <div key={link.id}>
              <NewTabLink to={URL}>{link.name}</NewTabLink>
            </div>
          );
        }
      });

      setData(...data, template);
    });
  };

  return <div className="popup">{data}</div>;
};

export default Popup;
