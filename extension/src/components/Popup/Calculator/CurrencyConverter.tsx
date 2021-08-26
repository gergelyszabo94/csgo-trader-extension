import { ExchangeRates } from 'types';

import React, { useEffect, useState } from 'react';

import { prettyPrintPrice } from 'utils/pricing';
import { currencies } from 'utils/static/pricing';

import CurrencySelect from 'components/Popup/Calculator/CurrencySelect';

const CurrencyConverter = () => {
    const [currency1, setCurrency1] = useState('USD');
    const [currency2, setCurrency2] = useState('EUR');
    const [inputNumber, setInputNumber] = useState(100);
    const [result, setResult] = useState<string>();

    const convert = (input: number) => {
        chrome.storage.local.get('exchangeRates', ({ exchangeRates }: ExchangeRates) => {
            const convertedValue = (input / Number(exchangeRates[currency1])) * Number(exchangeRates[currency2]);
            setResult(convertedValue.toFixed(2));
        });
    };

    useEffect(() => {
        convert(inputNumber);
    }, [currency1, currency2, inputNumber]);

    useEffect(() => {
        chrome.storage.local.get('calculatorConversionPlaceholder', ({ calculatorConversionPlaceholder }) => {
            setInputNumber(parseFloat(calculatorConversionPlaceholder));
        });
    }, []);

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newInputNumber = Number(event.target.value);
        setInputNumber(newInputNumber);
        convert(newInputNumber);
    };

    return (
        <>
            <h5>Currency convert</h5>
            <div>
                <span>{currencies[currency1].sign} </span>
                <input
                    type='number'
                    value={inputNumber}
                    onChange={onInputChange}
                    className='numberInput numberInput__wide'
                />
                <span>
                    {' = '}
                    {prettyPrintPrice(currency2, result)}
                </span>
            </div>
            <CurrencySelect id='defaultConverterCurrency1' selected={currency1} setSelected={setCurrency1} />
            <span> - </span>
            <CurrencySelect id='defaultConverterCurrency2' selected={currency2} setSelected={setCurrency2} />
        </>
    );
};

export default CurrencyConverter;
