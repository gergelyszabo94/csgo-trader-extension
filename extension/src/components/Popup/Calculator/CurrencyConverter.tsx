import React, { useState, useEffect } from 'react';
import CurrencySelect from 'components/Popup/Calculator/CurrencySelect';
import { prettyPrintPrice } from 'utils/pricing';
import { currencies } from 'utils/static/pricing';

const CurrencyConverter = () => {
  const [currency1, setCurrency1] = useState('USD');
  const [currency2, setCurrency2] = useState('EUR');
  const [inputNumber, setInputNumber] = useState(100);
  const [result, setResult] = useState('');

  const convert = (input) => {
    chrome.storage.local.get('exchangeRates', ({ exchangeRates }) => {
      const convertedValue = (input / parseFloat(exchangeRates[currency1]))
        * parseFloat(exchangeRates[currency2]);
      setResult(convertedValue.toFixed(2));
    });
  };

  useEffect(() => {
    convert(inputNumber);
  }, [currency1, currency2, inputNumber]);

  useEffect(() => {
    chrome.storage.local.get('calculatorConversionPlaceholder', ({ calculatorConversionPlaceholder }) => {
      setInputNumber(parseFloat(calculatorConversionPlaceholder));
    });
  }, []);

  const onInputChange = (change) => {
    const newInputNumber = change.target.value;
    setInputNumber(newInputNumber);
    convert(newInputNumber);
  };

  return (
    <>
      <h5>Currency convert</h5>
      <div>
        <span>
          {currencies[currency1].sign}
          {' '}
        </span>
        <input type="number" value={inputNumber} onChange={onInputChange} className="numberInput numberInput__wide" />
        <span>
          {' = '}
          {prettyPrintPrice(currency2, result)}
        </span>
      </div>
      <CurrencySelect id="defaultConverterCurrency1" selected={currency1} setSelected={setCurrency1} />
      <span> - </span>
      <CurrencySelect id="defaultConverterCurrency2" selected={currency2} setSelected={setCurrency2} />
    </>
  );
};

export default CurrencyConverter;
