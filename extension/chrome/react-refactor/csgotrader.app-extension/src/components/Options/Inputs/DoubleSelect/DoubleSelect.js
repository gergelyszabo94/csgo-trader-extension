import React, { Fragment } from "react";
import Select from "components/Options/Inputs/Select/Select";
const DoubleSelect = props => {
  const setStorage = (thisValue, id) => {
    id === undefined
      ? chrome.storage.local.set({ [props.id]: thisValue }, () => {})
      : chrome.storage.local.set({ [id]: thisValue }, () => {});
  };

  const getStorage = id => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(id, result => {
        resolve(result[id]);
      });
    });
  };

  return (
    <Fragment>
      <Select
        id={props.id[0]}
        foreignChangeHandler={setStorage}
        foreignUseEffect={getStorage}
        options={props.options}
      />
      <Select
        id={props.id[1]}
        foreignChangeHandler={setStorage}
        foreignUseEffect={getStorage}
        options={props.options}
      />
    </Fragment>
  );
};

export default DoubleSelect;
