import React from "react";

const home = (props) => {
    props.setActiveNav('/');
    return  (
        <div>
            <h2>Home</h2>
        </div>
    );
};

export default home;