import React from "react";
import Select from "components/Select/Select";
const SimpleSelect = props => {
  const setStorage = thisValue => {
    chrome.storage.local.set({ [props.id]: thisValue }, () => {});
  };

  const getStorage = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(props.id, result => {
        resolve(result[props.id]);
      });
    });
  };

  return (
    <Select
      id={props.id}
      foreignChangeHandler={setStorage}
      foreignUseEffect={getStorage}
      options={props.options}
    />
  );
};

export default SimpleSelect;
