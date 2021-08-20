import React from 'react';
import { operators } from 'utils/static/offers';

const Operators = () => {
  const operatorsArr = [];
  for (const [key, value] of Object.entries(operators)) {
    operatorsArr.push({
      key,
      name: value.pretty,
      desc: value.description,
    });
  }
  return (
    operatorsArr.map((option) => {
      return <option key={option.key} value={option.key} title={option.desc}>{option.name}</option>;
    })
  );
};

const AddOperator = ({ type, index, onChange }) => {
  const onOperatorChange = ((event) => {
    onChange(index, event.target.value);
  });

  return (
    <select className="select-theme" onChange={onOperatorChange} defaultValue={type}>
      <Operators />
    </select>
  );
};

export default AddOperator;
