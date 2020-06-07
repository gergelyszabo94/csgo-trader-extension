import React, { useState } from 'react';

const TradeHistoryControls = (props) => {
  const { setHistorySize } = props;
  const [selectState, setSelectState] = useState(10);

  const selectValues = [10, 25, 50, 100];

  const changeHandler = (e) => {
    const value = e.target.value;
    setSelectState(value);
    console.log(props);
    setHistorySize(value);
  };

  return (
    <div className="trade-history__controls">
      <span>Size: </span>
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
