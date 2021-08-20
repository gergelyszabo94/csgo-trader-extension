import React from 'react';
import { actions } from 'utils/static/offers';

const Action = ({ action }) => {
    return <span title={actions[action].description}>{actions[action].pretty}</span>;
};

export default Action;
