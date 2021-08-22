import React, { useEffect } from 'react';

import { currencies } from 'utils/static/pricing';

interface CurrencySelectProps {
    id: string;
    selected: string;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const CurrencySelect = ({ id, selected, setSelected }: CurrencySelectProps) => {
    const transformCurrencies = () => {
        const transformedCurrencies = [];
        for (const currency of Object.values(currencies)) {
            transformedCurrencies.push({
                key: currency.short,
                text: currency.short,
            });
        }

        return transformedCurrencies;
    };

    useEffect(() => {
        chrome.storage.local.get(id, (result) => {
            setSelected(result[id]);
        });
    }, []);

    const applySelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const targetValue = event.target.value;
        setSelected(targetValue);
    };

    return (
        <select className='select-theme' id={id} value={selected} onChange={applySelection}>
            {transformCurrencies().map((option) => {
                return (
                    <option key={id + option.key} value={option.key}>
                        {option.text}
                    </option>
                );
            })}
        </select>
    );
};

export default CurrencySelect;
