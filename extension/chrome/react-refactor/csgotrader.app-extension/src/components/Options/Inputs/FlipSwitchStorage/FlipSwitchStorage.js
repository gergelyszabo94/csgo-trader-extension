import React, { useState, useEffect } from 'react';
import FlipSwitch from 'components/FlipSwitch/FlipSwitch';

const FlipSwitchStorage = (props) => {
  const [state, setState] = useState(false);

  const onChangeHandler = (event) => {
    chrome.storage.local.set(
      { [event.target.id]: event.target.checked },
      () => {
        setState(!state);
      },
    );
  };

  useEffect(() => {
    chrome.storage.local.get(props.id, (result) => {
      setState(result[props.id]);
    });
  }, [props.id]);

  return <FlipSwitch id={props.id} checked={state} onChange={onChangeHandler} />;
};

export default FlipSwitchStorage;
