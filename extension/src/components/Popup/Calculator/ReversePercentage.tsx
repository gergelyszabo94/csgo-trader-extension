import React, { useState, useEffect } from 'react';

const ReversePercentage = () => {
  const [percentage, setPercentage] = useState(30);
  const [number, setNumber] = useState(2.70);
  const [result, setResult] = useState('90');

  const onPercentageChange = (event) => {
    setPercentage(event.target.value);
  };

  const onNumberChange = (event) => {
    setNumber(event.target.value);
  };

  useEffect(() => {
    setResult((number / (percentage / 100)).toFixed(2));
  }, [percentage, number]);

  useEffect(() => {
    chrome.storage.local.get(['calculatorReversePercentage', 'calculatorReverseValue'],
      ({ calculatorReverseValue, calculatorReversePercentage }) => {
        setNumber(parseFloat(calculatorReverseValue).toFixed(2));
        setPercentage(parseFloat(calculatorReversePercentage).toFixed(2));
      });
  }, []);

  return (
    <div className="calCategory">
      <span
        className="calcSubtitle"
        title="Reverse Percentage - Find how many percent is a number of another number"
      >
        Reverse Percentage
      </span>
      <input type="number" value={number} onChange={onNumberChange} className="numberInput numberInput__narrow" />
      <span> is </span>
      <input type="number" value={percentage} onChange={onPercentageChange} className="numberInput numberInput__narrow" />
      <span> % of </span>
      <span>{result}</span>
    </div>
  );
};

export default ReversePercentage;
