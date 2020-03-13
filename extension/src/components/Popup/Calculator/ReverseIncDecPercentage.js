import React, { useState, useEffect } from 'react';

const ReverseIncDecPercentage = () => {
  const [percentage, setPercentage] = useState(27);
  const [number, setNumber] = useState(1000);
  const [result, setResult] = useState('787.40');
  const [option, setOption] = useState('inc');

  const onPercentageChange = (event) => {
    setPercentage(event.target.value);
  };

  const onNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const onSelectChange = (event) => {
    setOption(event.target.value);
  };

  useEffect(() => {
    const res = option === 'inc'
      ? number / ((percentage / 100) + 1.0)
      : number / (1.0 - (percentage / 100));

    setResult(res.toFixed(2));
  }, [percentage, number, option]);

  return (
    <div className="calCategory">
      <span
        className="calcSubtitle"
        title="Find what the original number was before it was increased or decreased by a certain percentage"
      >
        Increment/decrement by
      </span>
      <span>{result}</span>
      <span> is the number </span>
      <select defaultValue={option} onChange={onSelectChange} className="select">
        <option value="inc">increased</option>
        <option value="dec">decreased</option>
      </select>
      <span> by </span>
      <input type="number" value={percentage} onChange={onPercentageChange} className="numberInput narrow" />
      <span>% when the result is </span>
      <input type="number" value={number} onChange={onNumberChange} className="numberInput narrow" />
    </div>
  );
};

export default ReverseIncDecPercentage;
