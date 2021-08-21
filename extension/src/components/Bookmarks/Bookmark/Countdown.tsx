import React, { useEffect, useState } from 'react';

const Countdown = ({ tradability }) => {
    const dateToCountDownTo = tradability;
    const [state, setState] = useState({
        text: '',
        class: 'countdown',
    });

    useEffect(() => {
        const countDownInterval = setInterval(() => {
            // eslint-disable-next-line no-use-before-define
            setCurrentRemaining();
        }, 1000);

        const setCurrentRemaining = () => {
            const now = new Date().getTime();
            const distance = new Date(dateToCountDownTo).getTime() - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance > 0)
                setState({ ...state, text: `${days}d ${hours}h ${minutes}m ${seconds}s` });
            else {
                setState({ text: 'Tradable', class: null });
                clearInterval(countDownInterval);
            }
        };

        setCurrentRemaining();

        return () => {
            // cleanup function, runs when the components get removed
            clearInterval(countDownInterval);
        };
    }, []);

    return <div className={state.class}>{state.text}</div>;
};

export default Countdown;
