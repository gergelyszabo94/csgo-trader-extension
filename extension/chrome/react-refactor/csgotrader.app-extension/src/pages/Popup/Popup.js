/* global chrome */

import React, {useState, useEffect } from "react";

const Popup = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (data.length === 0) {
      getDataFromStorage();
    }
  }, []);
  const getDataFromStorage = () => {
    chrome.storage.local.get(["popupLinks", "steamIDOfUser"], result => {
      let template = [];
      template.push(
        <a href="https://csgotrader.app" target="_blank">
          <img src="/images/cstlogo48.png" />
          <h5>
            CSGO Trader <span>{chrome.runtime.getManifest().version}</span>
          </h5>
        </a>
      );

      result.popupLinks.map(link => {
        if (link.active) {
          const URL =
            link.id === "tradeoffers"
              ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers`
              : link.url;
          template.push(
            <div>
              <a href={URL} target="_blank">
                {link.name}
              </a>
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
