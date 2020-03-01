import React, { useState, useEffect } from "react";

const Select = props => {
  const [value, setValue] = useState(props.options[0].key);

  const changeHandler = e => {
    const thisValue = e.target.value;
    props.foreignChangeHandler(thisValue, props.id);
    setValue(thisValue);
  };

  useEffect(() => {
    props.foreignUseEffect(props.id).then(result => {
      setValue(result);
    });
  }, []);

  return (
    <select
      className="select"
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