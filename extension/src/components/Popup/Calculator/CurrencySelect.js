import React, { useEffect } from 'react';
import { currencies } from 'utils/static/pricing';

const CurrencySelect = ({ id, selected, setSelected }) => {
  const transformCurrencies = () => {
    const transformedCurrencies = [];
    for (const currency of Object.values(currencies)) {
      transformedCurrencies.push({
        key: currency.short,
        text: currency.short,
      });
    }

    return transformedCurrencies;
  };

  useEffect(() => {
    chrome.storage.local.get(id, (result) => {
      setSelected(result[id]);
    });
  }, []);

  const applySelection = (e) => {
    const targetValue = e.target.value;
    setSelected(targetValue);
  };

  return (
    <select
      className="select"
      id={id}
      value={selected}
      onChange={applySelection}
    >
      {transformCurrencies().map((option) => {
        return (
          <option key={id + option.key} value={option.key}>
            {option.text}
          </option>
        );
      })}
    </select>
  );
};

export default CurrencySelect;
