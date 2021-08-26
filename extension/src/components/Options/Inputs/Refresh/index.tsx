import React, { useState } from 'react';

import { updatePrices } from 'utils/pricing';

import './Refresh.css';

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Refresh = () => {
    const [state, setState] = useState({
        message: '',
        spin: false,
    });

    const onClickHandler = () => {
        updatePrices();
        setState({ ...state, spin: true });

        setTimeout(() => {
            setState({
                spin: false,
                message: 'Prices refreshed',
            });
        }, 2000);
    };

    return (
        <>
            <FontAwesomeIcon
                icon={faSync}
                className={`whiteIcon ${state.spin ? 'rotate' : null}`}
                onClick={onClickHandler}
            />
            <div>{state.message}</div>
        </>
    );
};

export default Refresh;
