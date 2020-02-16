import React, { useState, useEffect } from "react";

const Select = props => {
  const [value, setValue] = useState(props.options[0].key);

  const changeHandler = e => {
    const thisValue = e.target.value;
    chrome.storage.local.set({ [props.id]: thisValue }, () => {
      setValue(thisValue);
    });
  };

  useEffect(() => {
    chrome.storage.local.get(props.id, result => {
      setValue(result[props.id]);
    });
  }, [props.id]);

  return (
    <select
      className="select-theme"
      id={props.id}
      onChange={changeHandler}
      value={value}
    >
      {props.options.map((option, i) => {
        return (
          <option key={i} value={option.key}>
            {option.text}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
