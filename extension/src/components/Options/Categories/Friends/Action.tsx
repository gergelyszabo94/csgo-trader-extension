import React from 'react';

import { actions } from 'utils/static/friendRequests';

interface ActionProps {
    action: string;
}

const Action = ({ action }: ActionProps) => {
    return <span title={actions[action].description}>{actions[action].pretty}</span>;
};

export default Action;
