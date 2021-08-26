import React from 'react';

import CurrencyConverter from 'components/Popup/Calculator/CurrencyConverter';
import ReverseIncDecPercentage from 'components/Popup/Calculator/ReverseIncDecPercentage';
import ReversePercentage from 'components/Popup/Calculator/ReversePercentage';
import SimplePercentage from 'components/Popup/Calculator/SimplePercentage';

const Calculator = () => {
    return (
        <>
            <CurrencyConverter />
            <h5>Calculator</h5>
            <SimplePercentage />
            <ReversePercentage />
            <ReverseIncDecPercentage />
        </>
    );
};

export default Calculator;
