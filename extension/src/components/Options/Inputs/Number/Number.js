import React, { useState, useEffect } from 'react';

const Number = ({ id, min, max }) => {
  const [state, setState] = useState(false);
  const minSet = min !== undefined;
  const maxSet = max !== undefined;

  const onChangeHandler = (event) => {
    const value = event.target.value;
    setState(value);

    if ((minSet && maxSet && value >= min && value <= max)
      || (minSet && value >= min) || (maxSet && value <= max) || (!minSet && !maxSet)) {
      chrome.storage.local.set(
        { [id]: value },
        () => {},
      );
    }
  };

  useEffect(() => {
    chrome.storage.local.get(id, (result) => {
      setState(result[id]);
    });
  }, [id]);

  return <input type="number" id={id} className="numberInput numberInput__wide" value={state} onChange={onChangeHandler} />;
};

export default Number;
