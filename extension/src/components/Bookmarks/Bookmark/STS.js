import React from 'react';

const STS = ({ st, s }) => {
  if (st) {
    return (
      <span className="statTrak">
                StatTrak™
      </span>
    );
  }
  if (s) {
    return (
      <span className="souvenir">
                Souvenir
      </span>
    );
  }
  return null;
};

export default STS;
