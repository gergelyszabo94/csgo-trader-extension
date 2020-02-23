import React from "react";

const FlipSwitch = props => {
    return (
        <div className="flipswitch">
            <label className="switch">
                <input
                    type="checkbox"
                    id={props.id}
                    checked={props.checked}
                    onChange={props.onChange}
                />
                <span className="slider round" />
            </label>
        </div>
    );
};

export default FlipSwitch;
