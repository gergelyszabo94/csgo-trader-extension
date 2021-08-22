import React, { useEffect, useState } from 'react';

import FlipSwitch from 'components/FlipSwitch';

interface FlipSwitchStorageProps {
    id: string;
}

const FlipSwitchStorage = ({ id }: FlipSwitchStorageProps) => {
    const [state, setState] = useState(false);

    const onChangeHandler = (event) => {
        chrome.storage.local.set({ [event.target.id]: event.target.checked }, () => {
            setState(!state);
        });
    };

    useEffect(() => {
        chrome.storage.local.get(id, (result) => {
            setState(result[id]);
        });
    }, [id]);

    return <FlipSwitch id={id} checked={state} onChange={onChangeHandler} />;
};

export default FlipSwitchStorage;
