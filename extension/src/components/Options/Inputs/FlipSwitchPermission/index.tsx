import React, { useEffect, useState } from 'react';

import FlipSwitch from 'components/FlipSwitch';

const FlipSwitchPermission = ({ id, origins, permission }) => {
    const [state, setState] = useState(false);

    useEffect(() => {
        if (origins) {
            chrome.storage.local.get([id], (storageResult) => {
                chrome.permissions.contains({ origins }, (permissionResult) => {
                    setState(storageResult[id] && permissionResult);
                });
            });
        } else {
            chrome.permissions.contains({ permissions: [permission] }, (result) => {
                setState(result);
            });
        }
    }, [permission, origins, id]);

    const onChangeHandler = () => {
        if (!state) {
            if (origins) {
                chrome.permissions.request({ origins }, (granted) => {
                    chrome.storage.local.set({ [id]: granted }, () => {
                        setState(granted);
                    });
                });
            } else {
                chrome.permissions.request({ permissions: ['tabs'] }, (granted) => {
                    setState(granted);
                });
            }
        } else if (origins) {
            chrome.storage.local.set({ [id]: false }, () => {
                setState(false);
            });
        } else {
            chrome.permissions.remove({ permissions: ['tabs'] }, (removed) => {
                setState(!removed);
            });
        }
    };

    return <FlipSwitch id={id} checked={state} onChange={onChangeHandler} />;
};

export default FlipSwitchPermission;
