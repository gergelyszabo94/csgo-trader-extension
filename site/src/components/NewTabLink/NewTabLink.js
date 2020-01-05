import React from "react";

const newTabLink = (props) => {
    return  (
        <a href={props.to} target='_blank' rel='noopener'>
            {props.children}
        </a>);
};

export default newTabLink;