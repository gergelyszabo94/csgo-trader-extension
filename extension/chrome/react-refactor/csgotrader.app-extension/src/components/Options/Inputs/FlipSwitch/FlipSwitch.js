import React from "react";

const flipSwitch = (props) => {
    return (
        <label className="switch">
            <input type="checkbox" id={props.key}/>
            <span className="slider round"/>
        </label>
    );
};

export default flipSwitch;