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

  useEffect(() => {
    chrome.storage.local.get(['calculatorIncDecPercentage', 'calculatorIncDecResult'],
      ({ calculatorIncDecPercentage, calculatorIncDecResult }) => {
        setPercentage(parseFloat(calculatorIncDecPercentage).toFixed(2));
        setNumber(parseFloat(calculatorIncDecResult).toFixed(2));
      });
  }, []);

  return (
    <div className="calCategory">
      <div>
        <span
          className="calcSubtitle"
          title="Find what the original number was before it was increased or decreased by a certain percentage"
        >
          Increment/decrement by
        </span>
      </div>
      <div>
        <span>{result}</span>
        <span> is the number </span>
      </div>
      <div>
        <select defaultValue={option} onChange={onSelectChange} className="select-theme">
          <option value="inc">increased</option>
          <option value="dec">decreased</option>
        </select>
        <span> by </span>
      </div>
      <input type="number" value={percentage} onChange={onPercentageChange} className="numberInput numberInput__narrow" />
      <span>% when the result is </span>
      <input type="number" value={number} onChange={onNumberChange} className="numberInput numberInput__narrow" />
    </div>
  );
};

export default ReverseIncDecPercentage;
