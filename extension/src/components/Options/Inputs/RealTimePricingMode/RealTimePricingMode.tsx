import React from 'react';
import Select from 'components/Select/Select';

const RealTimePricingMode = ({ id, options }) => {
  const setStorage = (thisValue) => {
    chrome.storage.local.set({
      realTimePricesMode: thisValue,
    }, () => {});
  };

  const getStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['realTimePricesMode'], ({ realTimePricesMode }) => {
        resolve(realTimePricesMode);
      });
    });
  };

  return (
    <Select
      id={id}
      foreignChangeHandler={setStorage}
      foreignUseEffect={getStorage}
      options={options}
    />
  );
};

export default RealTimePricingMode;
