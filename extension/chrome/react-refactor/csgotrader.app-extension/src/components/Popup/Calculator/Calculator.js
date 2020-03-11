import React from 'react';
import CurrencyConverter from 'components/Popup/Calculator/CurrencyConverter';
import SimplePercentage from 'components/Popup/Calculator/SimplePercentage';

const Calculator = () => {
  return (
    <>
      <CurrencyConverter />
      <h5>Calculator</h5>
      <SimplePercentage />
    </>
  );
};

export default Calculator;
