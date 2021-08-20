import React from 'react';
import countries from 'utils/static/countries';

const AddCondition = ({ type, value, onValueChange }) => {
  if (type === 'number') {
    return <input type="number" className="numberInput numberInput__narrow" value={value} onChange={onValueChange} />;
  } if (type === 'string') {
    return <input type="text" value={value} onChange={onValueChange} className="input" />;
  } if (type === 'country') {
    return (
      <select value={value} onChange={onValueChange} className="select-theme">
        {countries.map((country) => {
          return (
            <option value={country.Code} key={country.Code}>
              {country.Name}
            </option>
          );
        })}
      </select>
    );
  }
};

export default AddCondition;
