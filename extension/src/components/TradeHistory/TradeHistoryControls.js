import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

const TradeHistoryControls = ({
  historySize,
  setHistorySize,
  setExcludeEmpty,
  setStartTime,
}) => {
  const [selectState, setSelectState] = useState(historySize);
  const [exclude, setExclude] = useState(false);
  const [date, setDate] = useState(Date.now());

  const selectValues = [10, 25, 50, 100];

  const changeHandler = (e) => {
    const value = e.target.value;
    setSelectState(value);
    setHistorySize(value);
  };

  const onExcludeChange = (event) => {
    const value = event.target.checked;
    setExclude(value);
    setExcludeEmpty(value);
  };

  const onDateChange = (dateObject) => {
    const unixTimeStamp = dateObject.getTime() / 1000;
    setDate(dateObject);
    setStartTime(unixTimeStamp);
  };

  return (
    <div className="trade-history__controls">
      <div className="row">
        <span className="trade-history__control">
          Show:&nbsp;
          <select
            className="select-theme"
            onChange={changeHandler}
            value={selectState}
          >
            {selectValues.map((selectValue) => {
              return (
                <option
                  key={selectValue}
                  value={selectValue}
                  title={selectValue}
                >
                  {selectValue}
                </option>
              );
            })}
          </select>
        </span>
      </div>
      <div className="row">
        <span className="trade-history__control">
          Show before:&nbsp;
          <DatePicker
            selected={date}
            onChange={onDateChange}
            className="input"
          />
        </span>
      </div>
      <div className="row">
        <span className="trade-history__control">
          <label className="checkmark">
            Exclude empty offers:&nbsp;
            <input
              type="checkbox"
              onChange={onExcludeChange}
              checked={exclude}
              title="Hide trades that are empty in one side"
              className="checkmark__checkbox"
            />
            <span className="checkmark__designed" />
          </label>
        </span>
      </div>
    </div>
  );
};

export default TradeHistoryControls;
