import React, { useEffect, useState } from 'react';

const SimplePercentage = () => {
    const [percentage, setPercentage] = useState(3);
    const [number, setNumber] = useState(90);
    const [result, setResult] = useState('2.70');

    const onPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPercentage(Number(event.target.value));
    };

    const onNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNumber(Number(event.target.value));
    };

    useEffect(() => {
        setResult((number * (percentage / 100)).toFixed(2));
    }, [percentage, number]);

    useEffect(() => {
        chrome.storage.local.get(
            ['calculatorPercentageOf', 'calculatorPercentagePercentage'],
            ({ calculatorPercentageOf, calculatorPercentagePercentage }) => {
                setNumber(calculatorPercentageOf);
                setPercentage(calculatorPercentagePercentage);
            },
        );
    }, []);

    return (
        <div className='calCategory'>
            <span
                className='calcSubtitle'
                title='Percentage - Find how much a specific percentage is of a number'
            >
                Percentage
            </span>
            <input
                type='number'
                value={percentage.toFixed(2)}
                onChange={onPercentageChange}
                className='numberInput numberInput__narrow'
            />
            <span> % of </span>
            <input
                type='number'
                value={number.toFixed(2)}
                onChange={onNumberChange}
                className='numberInput numberInput__narrow'
            />
            <span> = </span>
            <span>{result}</span>
        </div>
    );
};

export default SimplePercentage;
