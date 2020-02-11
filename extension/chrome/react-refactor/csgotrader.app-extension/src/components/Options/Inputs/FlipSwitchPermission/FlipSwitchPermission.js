import React, {useState, useEffect} from "react";

const flipSwitchPermission = (props) => {
    const [state, setState] = useState({
        hasRun: false,
        value: false
    });

    const init = (permission, origins, key) => {
        if (origins) {
            chrome.storage.local.get([key], (storageResult) => {
                chrome.permissions.contains({permissions: ['tabs'], origins: origins}, (permissionResult) => {
                    setState({hasRun: true, value: storageResult[key] && permissionResult});
                });
            });
        }
        else {
            chrome.permissions.contains({permissions: [permission]}, (result) => {
                setState({hasRun: true, value: result});
            });
        }
    };

    const onChangeHandler = () => {
        if (!state.value) {
            if (props.origins) {
                chrome.permissions.request({permissions: ['tabs'], origins: props.origins}, (granted) => {
                    chrome.storage.local.set({[props.id]: granted}, () => {
                        setState({hasRun: true, value: granted});
                    });
                });
            }
            else {
                chrome.permissions.request({permissions: ['tabs']}, (granted) => {
                    setState({...state, value: granted});
                });
            }
        }
        else {
            if (props.origins) {
                chrome.storage.local.set({[props.id]: false}, () => {
                    setState({...state, value: false})
                });
            }
            else {
                chrome.permissions.remove({permissions: ['tabs']}, (removed) => {
                    setState({...state, value: !removed})
                });
            }
        }
    };

    useEffect(() => {
        if (!state.hasRun) {
            init(props.permission, props.origins, props.id);
        }
    });

    return (
        <label className="switch">
            <input type="checkbox" id={props.id} checked={state.value} onChange={onChangeHandler}/>
            <span className="slider round"/>
        </label>
    );
};

export default flipSwitchPermission;