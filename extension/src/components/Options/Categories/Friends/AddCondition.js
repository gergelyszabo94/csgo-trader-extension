import React from 'react';

const AddCondition = ({ type, value, onValueChange }) => {
  console.log(type);
  return type === 'number'
    ? <input type="number" className="numberInput numberInput__narrow" value={value} onChange={onValueChange} />
    : <input type="text" value={value} onChange={onValueChange} />;
};

export default AddCondition;
