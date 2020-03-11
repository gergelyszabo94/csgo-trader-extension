import React from 'react';
import CurrencyConverter from 'components/Popup/Calculator/CurrencyConverter';
import SimplePercentage from 'components/Popup/Calculator/SimplePercentage';
import ReversePercentage from 'components/Popup/Calculator/ReversePercentage';

const Calculator = () => {
  return (
    <>
      <CurrencyConverter />
      <h5>Calculator</h5>
      <SimplePercentage />
      <ReversePercentage />
    </>
  );
};

export default Calculator;
