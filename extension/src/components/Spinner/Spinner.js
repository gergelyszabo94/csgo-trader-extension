import React from 'react';
import SpinnerGif from 'assets/images/spinner.gif';

const Spinner = () => {
  return (
    <div className="spinner">
      <img src={SpinnerGif} alt="loading" />
    </div>
  );
};

export default Spinner;
