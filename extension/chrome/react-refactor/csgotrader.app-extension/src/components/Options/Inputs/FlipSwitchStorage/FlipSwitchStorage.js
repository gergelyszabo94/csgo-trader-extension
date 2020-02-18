import React, {useState, useEffect} from "react";

const FlipSwitchStorage = (props) => {
    const [state, setState] = useState(false);

    const onChangeHandler = (event) => {
        chrome.storage.local.set({[event.target.id]: event.target.checked}, () => {
            setState(!state);
        });
    };

    useEffect(() => {
        chrome.storage.local.get(props.id, (result) => {
            console.log(result);
            setState(result[props.id]);
        });
    }, [props.id]);

    return (
        <label className="switch">
            <input type="checkbox" id={props.id} checked={state} onChange={onChangeHandler}/>
            <span className="slider round"/>
        </label>
    );
};

export default FlipSwitchStorage;