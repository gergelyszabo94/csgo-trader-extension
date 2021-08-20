import React from 'react';

import NewTabLink from 'components/NewTabLink/NewTabLink';
import MissingItems from 'components/TradeHistory/MissingItems';
import { getItemMarketLink } from 'utils/simpleUtils';

const TradeOfferHistorySide = (props) => {
  const urlIconToString = (iconURL) => {
    return `https://steamcommunity.com/economy/image/${iconURL}/256x256`;
  };

  const { assets, itemsWithoutDescriptions } = props;

  return assets !== undefined ? (
    <div className="assets col-md-6">
      <div className="assets__items">
        {assets.map((asset) => {
          return (
            <div
              className="row assets__item "
              key={asset.assetid + asset.appid + asset.contextid}
            >
              <div className="col-3">
                <img
                  className="assets__image"
                  key={asset.assetid}
                  src={urlIconToString(asset.icon_url)}
                  alt={asset.market_hash_name}
                />
              </div>
              <div className="col-9">
                <h3 className="assets__name">
                  <NewTabLink
                    to={getItemMarketLink(asset.appid, asset.market_hash_name)}
                  >
                    {asset.market_hash_name}
                  </NewTabLink>
                </h3>
                <span className="assets__price">{asset.price.display}</span>
              </div>
            </div>
          );
        })}
        <MissingItems numberOfItemsMissing={itemsWithoutDescriptions} />
      </div>
    </div>
  ) : null;
};

export default TradeOfferHistorySide;
