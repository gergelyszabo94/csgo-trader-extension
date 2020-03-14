import React from 'react';

const FlipSwitch = ({
  id, checked, onChange,
}) => {
  return (
    <div className="flipswitch">
      <label className="switch">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
        />
        <span className="slider round" />
      </label>
    </div>
  );
};

export default FlipSwitch;
