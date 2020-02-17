/* globals updatePrices*/

import React, { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

const Refresh = () => {
     const [state, setState] = useState('');

    const onClickHandler = () => {
        updatePrices();
        setTimeout(() => {
            setState('Prices refreshed');
        }, 2000);
    };

    return (
        <Fragment>
            <FontAwesomeIcon icon={faSync} className='whiteIcon' onClick={onClickHandler}/>
            <div>{state}</div>
        </Fragment>
    );
};

export default Refresh;
