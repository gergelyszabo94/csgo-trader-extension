import React from 'react';
import Select from 'components/Select/Select';

const DoubleSelect = (props) => {
  const setStorage = (thisValue, id) => {
    id === undefined
      ? chrome.storage.local.set({ [props.id]: thisValue }, () => {})
      : chrome.storage.local.set({ [id]: thisValue }, () => {});
  };

  const getStorage = (id) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(id, (result) => {
        resolve(result[id]);
      });
    });
  };

  return (
    <>
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
    </>
  );
};

export default DoubleSelect;
