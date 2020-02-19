/* globals updatePrices*/

import React, { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import './Refresh.css';

const Refresh = () => {
    const [state, setState] = useState({
        message: '',
        spin: false
    });

    const onClickHandler = () => {
        updatePrices();
        setState({...state, spin: true});

        setTimeout(() => {
            setState({
                spin: false,
                message: 'Prices refreshed'
            });
        }, 2000);
    };

    return (
        <Fragment>
            <FontAwesomeIcon
                icon={faSync}
                className={`whiteIcon ${state.spin ? 'rotate' : null}`}
                onClick={onClickHandler}
            />
            <div>{state.message}</div>
        </Fragment>
    );
};

export default Refresh;
