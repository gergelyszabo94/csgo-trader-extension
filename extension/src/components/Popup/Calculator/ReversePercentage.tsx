import React, { useEffect, useState } from 'react';

const ReversePercentage = () => {
    const [percentage, setPercentage] = useState(30);
    const [number, setNumber] = useState(2.7);
    const [result, setResult] = useState('90');

    const onPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPercentage(Number(event.target.value));
    };

    const onNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNumber(Number(event.target.value));
    };

    useEffect(() => {
        setResult((number / (percentage / 100)).toFixed(2));
    }, [percentage, number]);

    useEffect(() => {
        chrome.storage.local.get(
            ['calculatorReversePercentage', 'calculatorReverseValue'],
            ({ calculatorReverseValue, calculatorReversePercentage }) => {
                setNumber(calculatorReverseValue);
                setPercentage(calculatorReversePercentage);
            },
        );
    }, []);

    return (
        <div className='calCategory'>
            <span
                className='calcSubtitle'
                title='Reverse Percentage - Find how many percent is a number of another number'
            >
                Reverse Percentage
            </span>
            <input
                type='number'
                value={number.toFixed(2)}
                onChange={onNumberChange}
                className='numberInput numberInput__narrow'
            />
            <span> is </span>
            <input
                type='number'
                value={percentage.toFixed(2)}
                onChange={onPercentageChange}
                className='numberInput numberInput__narrow'
            />
            <span> % of </span>
            <span>{result}</span>
        </div>
    );
};

export default ReversePercentage;
