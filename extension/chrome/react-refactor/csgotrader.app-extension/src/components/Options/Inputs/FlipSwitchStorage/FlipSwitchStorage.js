import React, {useState, useEffect} from "react";

const FlipSwitchStorage = (props) => {
    const [state, setState] = useState({
        hasRun: false,
        value: false
    });

    const init = (key) => {
        chrome.storage.local.get(key, (result) => {
            setState({hasRun: true, value: result[key]});
        });
    };

    const onChangeHandler = (event) => {
        chrome.storage.local.set({[event.target.id]: event.target.checked}, () => {
            setState({...state, value: !state.value})
        });
    };

    useEffect(() => {
        if (!state.hasRun) {
            init(props.id);
        }
    });

    return (
        <label className="switch">
            <input type="checkbox" id={props.id} checked={state.value} onChange={onChangeHandler}/>
            <span className="slider round"/>
        </label>
    );
};

export default FlipSwitchStorage;