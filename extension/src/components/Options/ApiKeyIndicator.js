import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

const ApiKeyIndicator = () => {
  return (
    <Link to="/options/general/" title="Steam API key required to be set for this function">
      &nbsp;
      <FontAwesomeIcon
        icon={faCode}
        className="apiIcon"
      />
    </Link>
  );
};

export default ApiKeyIndicator;
