import React from 'react';
import {Link} from "react-router-dom";

const navigationItem = (props) => {
    return <li>
        <Link to={props.path} className={props.active ? 'active' : null}>{props.name}</Link>
    </li>
};

export default navigationItem;
