import React, { useState } from 'react';

const TradeHistoryControls = ({ historySize, setHistorySize }) => {
  const [selectState, setSelectState] = useState(historySize);

  const selectValues = [10, 25, 50, 100];

  const changeHandler = (e) => {
    const value = e.target.value;
    setSelectState(value);
    setHistorySize(value);
  };

  return (
    <div className="trade-history__controls">
      <span>Show: </span>
      <select
        className="select-theme"
        onChange={changeHandler}
        value={selectState}
      >
        {selectValues.map((selectValue) => {
          return (
            <option key={selectValue} value={selectValue} title={selectValue}>
              {selectValue}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default TradeHistoryControls;
