import React, { useState, useEffect } from 'react';

const Select = ({
  options, foreignChangeHandler, foreignUseEffect, id,
}) => {
  const [value, setValue] = useState(options[0].key);

  const changeHandler = (e) => {
    const thisValue = e.target.value;
    foreignChangeHandler(thisValue, id);
    setValue(thisValue);
  };

  useEffect(() => {
    foreignUseEffect(id).then((result) => {
      setValue(result);
    });
  }, []);

  return (
    <select
      className="select-theme"
      id={id}
      onChange={changeHandler}
      value={value}
    >
      {options.map((option) => {
        return (
          <option key={id + option.key} value={option.key} title={option.description ? option.description : ''}>
            {option.text}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
